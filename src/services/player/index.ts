export {
  setupPlayer,
  play,
  pause,
  next,
  previous,
  seek,
  setVolume,
  setRepeat,
  setSpeed,
  playNow,
  playNext,
  addToUpNext,
  addToQueue,
  shuffleUpcoming,
  getUpNextSong,
} from './nitroPlayer';

export { setEqualizerEnabled, applyEqualizerPreset, getEqualizerPresets } from './equalizer';

export {
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  getAllPlaylists,
  getPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderSong,
} from './playerQueue';

export { songToTrack, trackToSong } from './trackAdapter';

export { subscribePlayback } from './events';
export type { PlaybackHandlers } from './events';

export { useQueue } from './queue';
