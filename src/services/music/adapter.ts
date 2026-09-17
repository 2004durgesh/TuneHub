import type {
  Song,
  Album,
  AlbumSummary,
  Artist,
  ArtistSummary,
  RemotePlaylist,
  DiscoveryItem,
  AudioQuality,
} from '@/types';

/**
 * The ONLY place that converts raw JioSaavn SDK objects into app domain models.
 *
 * The SDK returns scraped data, so every field is treated defensively: shapes
 * differ between "full" endpoints (getSongByIds, getAlbumById, ...) and
 * "lightweight" ones (searchAll, discover). We accept loose local Raw types and
 * `any` at this boundary only — this is the sanctioned place for it.
 */

type QualityUrl = { quality: string; url: string };
type RawImage = string | QualityUrl[] | null | undefined;

type RawArtistRef = { id?: string | null; name?: string | null };
type RawArtists = { primary?: RawArtistRef[] | null } | null | undefined;

type RawSong = {
  id: string;
  name?: string | null;
  title?: string | null;
  language?: string | null;
  year?: string | null;
  duration?: number | null;
  hasLyrics?: boolean | null;
  lyricsId?: string | null;
  album?: { id?: string | null; name?: string | null } | null;
  artists?: RawArtists;
  image?: RawImage;
  downloadUrl?: QualityUrl[] | null;
};

type RawAlbum = {
  id: string;
  name?: string | null;
  title?: string | null;
  language?: string | null;
  year?: number | string | null;
  songCount?: number | null;
  image?: RawImage;
  artist?: string | null;
  artists?: RawArtists;
  songs?: RawSong[] | null;
};

type RawArtistFull = {
  id: string;
  name?: string | null;
  title?: string | null;
  image?: RawImage;
  followerCount?: number | null;
  bio?: { title?: string | null; text?: string | null; sequence?: number | null }[] | null;
  topSongs?: RawSong[] | null;
  topAlbums?: RawAlbum[] | null;
  singles?: RawAlbum[] | null;
};

type RawArtistSummary = {
  id: string;
  name?: string | null;
  title?: string | null;
  image?: RawImage;
};

type RawPlaylist = {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  image?: RawImage;
  songCount?: number | null;
  songs?: RawSong[] | null;
};

type RawDiscovery = {
  id: string;
  name?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image?: RawImage;
};

// --- primitive helpers -----------------------------------------------------

export function pickImage(images: QualityUrl[], size: '150x150' | '500x500'): string {
  if (!Array.isArray(images) || images.length === 0) return '';
  const match = images.find((i) => i.quality === size);
  if (match?.url) return match.url;
  return images[images.length - 1]?.url ?? '';
}

export function pickStreamUrl(downloadUrl: QualityUrl[], quality: AudioQuality): string {
  if (!Array.isArray(downloadUrl) || downloadUrl.length === 0) return '';
  const byQuality = (q: string): string | undefined =>
    downloadUrl.find((d) => d.quality === q)?.url;
  return (
    byQuality(quality) ??
    byQuality('320kbps') ??
    byQuality('160kbps') ??
    byQuality('96kbps') ??
    downloadUrl[downloadUrl.length - 1]?.url ??
    ''
  );
}

/** Resolve an image field that may be a single URL string (discover) or a
 *  quality/url array (songs, albums, search). */
function resolveImage(image: RawImage, size: '150x150' | '500x500'): string {
  if (typeof image === 'string') return image;
  if (Array.isArray(image)) return pickImage(image, size);
  return '';
}

function toYear(year: number | string | null | undefined): number | null {
  if (year === null || year === undefined || year === '') return null;
  const n = typeof year === 'number' ? year : parseInt(year, 10);
  return Number.isFinite(n) ? n : null;
}

// --- domain mappers --------------------------------------------------------

export function toSong(raw: RawSong, quality: AudioQuality = '320kbps'): Song {
  const primary = raw.artists?.primary ?? [];
  return {
    id: raw.id,
    title: raw.name ?? raw.title ?? '',
    artistName: primary[0]?.name ?? '',
    artistId: primary[0]?.id ?? '',
    albumName: raw.album?.name ?? null,
    albumId: raw.album?.id ?? null,
    artworkUrl: resolveImage(raw.image, '500x500'),
    artworkSmall: resolveImage(raw.image, '150x150'),
    duration: raw.duration ?? 0,
    streamUrl: pickStreamUrl(raw.downloadUrl ?? [], quality),
    hasLyrics: raw.hasLyrics ?? false,
    lyricsId: raw.lyricsId ?? null,
    language: raw.language ?? '',
    year: raw.year ?? null,
  };
}

export function toAlbum(raw: RawAlbum, quality: AudioQuality = '320kbps'): Album {
  const primary = raw.artists?.primary ?? [];
  return {
    id: raw.id,
    title: raw.name ?? raw.title ?? '',
    artistName: primary[0]?.name ?? raw.artist ?? '',
    artistId: primary[0]?.id ?? null,
    artworkUrl: resolveImage(raw.image, '500x500'),
    year: toYear(raw.year),
    songCount: raw.songCount ?? null,
    language: raw.language ?? '',
    songs: (raw.songs ?? []).map((s) => toSong(s, quality)),
  };
}

export function toAlbumSummary(raw: RawAlbum): AlbumSummary {
  const primary = raw.artists?.primary ?? [];
  return {
    id: raw.id,
    title: raw.name ?? raw.title ?? '',
    artistName: primary[0]?.name ?? raw.artist ?? '',
    artworkUrl: resolveImage(raw.image, '500x500'),
    year: toYear(raw.year),
  };
}

export function toArtist(raw: RawArtistFull, quality: AudioQuality = '320kbps'): Artist {
  const bio =
    (raw.bio ?? [])
      .map((b) => b?.text)
      .filter((t): t is string => Boolean(t))
      .join('\n\n') || null;
  return {
    id: raw.id,
    name: raw.name ?? raw.title ?? '',
    artworkUrl: resolveImage(raw.image, '500x500'),
    followerCount: raw.followerCount ?? null,
    bio,
    topSongs: (raw.topSongs ?? []).map((s) => toSong(s, quality)),
    topAlbums: (raw.topAlbums ?? []).map(toAlbumSummary),
    singles: (raw.singles ?? []).map(toAlbumSummary),
  };
}

export function toArtistSummary(raw: RawArtistSummary): ArtistSummary {
  return {
    id: raw.id,
    name: raw.name ?? raw.title ?? '',
    artworkUrl: resolveImage(raw.image, '500x500'),
  };
}

export function toRemotePlaylist(
  raw: RawPlaylist,
  quality: AudioQuality = '320kbps',
): RemotePlaylist {
  return {
    id: raw.id,
    title: raw.name ?? raw.title ?? '',
    description: raw.description ?? null,
    artworkUrl: resolveImage(raw.image, '500x500'),
    songCount: raw.songCount ?? null,
    songs: (raw.songs ?? []).map((s) => toSong(s, quality)),
  };
}

export function toDiscoveryItem(raw: RawDiscovery, kind: DiscoveryItem['kind']): DiscoveryItem {
  return {
    id: raw.id,
    title: raw.name ?? raw.title ?? '',
    subtitle: raw.subtitle ?? raw.description ?? null,
    artworkUrl: resolveImage(raw.image, '500x500'),
    kind,
  };
}
