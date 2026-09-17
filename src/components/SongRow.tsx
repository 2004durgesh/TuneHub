import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Song } from '@/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Artwork } from './Artwork';

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
      {showAlbumArt && <Artwork uri={song.artworkSmall} size={48} borderRadius={radii.sm} />}
      <View style={styles.info}>
        <Text style={[styles.title, isPlaying && styles.titlePlaying]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
