import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Song } from '@/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Artwork } from './Artwork';

const ARTWORK_SIZE = 48;
// Fixed so lists can lay rows out without measuring them (`songRowLayout`). Text scaling is capped
// so two lines of the largest allowed size still fit.
export const SONG_ROW_HEIGHT = ARTWORK_SIZE + spacing.sm * 2;
const MAX_FONT_SCALE = 1.4;

export const songRowLayout = (_: unknown, index: number) => ({
  length: SONG_ROW_HEIGHT,
  offset: SONG_ROW_HEIGHT * index,
  index,
});

// Fewer rows mounted off-screen than FlatList's default (~10 screens); rows are cheap to render.
export const SONG_LIST_WINDOW = {
  initialNumToRender: 12,
  maxToRenderPerBatch: 8,
  windowSize: 7,
} as const;

type Props = {
  song: Song;
  onPress: (song: Song) => void;
  onLongPress?: (song: Song) => void;
  showAlbumArt?: boolean;
  rightElement?: React.ReactNode;
  isPlaying?: boolean;
};

export function SongRow({
  song,
  onPress,
  onLongPress,
  showAlbumArt = true,
  rightElement,
  isPlaying = false,
}: Props) {
  return (
    <Pressable
      onPress={() => onPress(song)}
      onLongPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onLongPress) onLongPress(song);
      }}
      android_ripple={{ color: colors.surfaceHigh }}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      {showAlbumArt && (
        <Artwork uri={song.artworkSmall} size={ARTWORK_SIZE} borderRadius={radii.sm} />
      )}
      <View style={styles.info}>
        <Text
          style={[styles.title, isPlaying && styles.titlePlaying]}
          numberOfLines={1}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {song.artistName}
        </Text>
      </View>
      {rightElement != null && <View>{rightElement}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    height: SONG_ROW_HEIGHT,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  titlePlaying: {
    color: colors.accent,
  },
  artist: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
});
