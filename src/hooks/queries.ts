import {
  queryOptions,
  skipToken,
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from '@tanstack/react-query';

import {
  getAlbum,
  getArtist,
  getArtistSongs,
  getCharts,
  getFeaturedPlaylists,
  getLyrics,
  getNewReleases,
  getPlaylist,
  getTopArtists,
  searchAll,
} from '@/services/music';
import { PERSIST_MAX_AGE } from '@/services/query/client';
import { useSettingsStore } from '@/store/settingsStore';
import type { Song } from '@/types';

const MINUTE = 60_000;

function homeSection<T>(section: string, fetchSection: () => Promise<T>) {
  return queryOptions({
    queryKey: ['home', section],
    // Called without arguments: TanStack's context object would land in the fetchers' `page`.
    queryFn: () => fetchSection(),
    staleTime: 60 * MINUTE,
    // Saved to disk (see services/query/client), so it must outlive the default 5 min.
    gcTime: PERSIST_MAX_AGE,
  });
}

export const homeQueries = {
  charts: homeSection('charts', getCharts),
  newReleases: homeSection('newReleases', getNewReleases),
  featuredPlaylists: homeSection('featuredPlaylists', getFeaturedPlaylists),
  topArtists: homeSection('topArtists', getTopArtists),
};

export function useAlbum(id: string) {
  const quality = useSettingsStore((s) => s.audioQuality);
  return useQuery({
    queryKey: ['album', id, quality],
    queryFn: () => getAlbum(id, quality),
    staleTime: 10 * MINUTE,
  });
}

export function usePlaylist(id: string) {
  const quality = useSettingsStore((s) => s.audioQuality);
  return useQuery({
    queryKey: ['playlist', id, quality],
    queryFn: () => getPlaylist(id, 1, 50, quality),
    staleTime: 10 * MINUTE,
  });
}

export function useArtist(id: string) {
  const quality = useSettingsStore((s) => s.audioQuality);
  return useQuery({
    queryKey: ['artist', id, quality],
    queryFn: () => getArtist(id, quality),
    staleTime: 10 * MINUTE,
  });
}

// Pages can repeat songs, and a page that adds no new ones is the end.
function nextArtistSongsPage(lastPage: Song[], allPages: Song[][], lastPageParam: number) {
  const known = new Set(allPages.slice(0, -1).flatMap((page) => page.map((song) => song.id)));
  return lastPage.some((song) => !known.has(song.id)) ? lastPageParam + 1 : undefined;
}

function uniqueSongs(data: InfiniteData<Song[], number>): Song[] {
  const seen = new Set<string>();
  const songs: Song[] = [];
  for (const page of data.pages) {
    for (const song of page) {
      if (seen.has(song.id)) continue;
      seen.add(song.id);
      songs.push(song);
    }
  }
  return songs;
}

export function useArtistSongs(id: string) {
  const quality = useSettingsStore((s) => s.audioQuality);
  return useInfiniteQuery({
    queryKey: ['artistSongs', id, quality],
    queryFn: ({ pageParam }) => getArtistSongs(id, pageParam, quality),
    initialPageParam: 0,
    getNextPageParam: nextArtistSongsPage,
    select: uniqueSongs,
    // A refetch reloads every loaded page one by one, so only Retry refetches.
    staleTime: Infinity,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: query ? () => searchAll(query) : skipToken,
  });
}

export function useLyrics(lyricsId: string | null) {
  return useQuery({
    queryKey: ['lyrics', lyricsId],
    queryFn: lyricsId ? () => getLyrics(lyricsId) : skipToken,
    staleTime: Infinity,
    gcTime: 30 * MINUTE,
  });
}
