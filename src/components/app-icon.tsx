import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';
import { colors } from '@/theme';

// Platform name map: SF Symbol (iOS) → Material Symbol (Android/web).
const ICONS = {
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause', web: 'pause' },
  next: { ios: 'forward.fill', android: 'skip_next', web: 'skip_next' },
  prev: { ios: 'backward.fill', android: 'skip_previous', web: 'skip_previous' },
  heart: { ios: 'heart', android: 'favorite', web: 'favorite' },
  heartFill: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  queue: { ios: 'list.bullet', android: 'queue_music', web: 'queue_music' },
  shuffle: { ios: 'shuffle', android: 'shuffle', web: 'shuffle' },
  repeat: { ios: 'repeat', android: 'repeat', web: 'repeat' },
  repeatOne: { ios: 'repeat.1', android: 'repeat_one', web: 'repeat_one' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  more: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  library: { ios: 'books.vertical.fill', android: 'library_music', web: 'library_music' },
  lyrics: { ios: 'text.bubble', android: 'lyrics', web: 'lyrics' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  chevronDown: { ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  playlistAdd: { ios: 'text.badge.plus', android: 'playlist_add', web: 'playlist_add' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  share: { ios: 'square.and.arrow.up', android: 'share', web: 'share' },
  album: { ios: 'square.stack', android: 'album', web: 'album' },
  artist: { ios: 'music.mic', android: 'mic', web: 'mic' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  download: { ios: 'arrow.down.circle', android: 'download', web: 'download' },
  downloaded: { ios: 'arrow.down.circle.fill', android: 'download_done', web: 'download_done' },
  retry: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  update: { ios: 'arrow.triangle.2.circlepath', android: 'system_update', web: 'system_update' },
  newVersion: { ios: 'arrow.up.circle', android: 'arrow_circle_up', web: 'arrow_circle_up' },
  code: {
    ios: 'chevron.left.forwardslash.chevron.right',
    android: 'code',
    web: 'code',
  },
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: ColorValue;
};

export function AppIcon({ name, size = 24, color = colors.text }: Props) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} />;
}
