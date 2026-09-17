export type Song = {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  albumName: string | null;
  albumId: string | null;
  artworkUrl: string; // 500x500
  artworkSmall: string; // 150x150
  duration: number; // seconds
  streamUrl: string; // decrypted, quality per settings
  hasLyrics: boolean;
  lyricsId: string | null;
  language: string;
  year: string | null;
};
