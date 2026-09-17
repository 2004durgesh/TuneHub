import { Share, StyleSheet, Text, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Song } from '@/types';
import { AppIcon } from '@/components/app-icon';
import type { IconName } from '@/components/app-icon';
import { SheetModal } from '@/components/SheetModal';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { usePlayer } from '@/hooks/usePlayer';
import { colors, spacing, typography } from '@/theme';

type Props = {
  song: Song | null;
  onClose: () => void;
  onAddToPlaylist?: () => void;
};

type ActionRowProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  iconColor?: string;
  labelColor?: string;
};

function ActionRow({
  icon,
  label,
  onPress,
  iconColor = colors.text,
  labelColor = colors.text,
}: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.surfaceHigh }}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <AppIcon name={icon} size={20} color={iconColor} />
      <Text style={[styles.actionLabel, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

export function SongActionSheet({ song, onClose, onAddToPlaylist }: Props) {
  const router = useRouter();
  const { toggleLike, isLiked } = useLikedSongs();
  const { playSongs } = usePlayer();

  const liked = song != null ? isLiked(song.id) : false;

  function handlePlayNow() {
    if (song == null) return;
    void playSongs([song], 0);
    onClose();
  }

  function handleAddToPlaylist() {
    // Dismiss this sheet first, then open the next one AFTER it finishes
    // animating out — React Native can't present a second Modal while the
    // first is still dismissing.
    onClose();
    setTimeout(() => onAddToPlaylist?.(), 350);
  }

  function handleToggleLike() {
    if (song == null) return;
    toggleLike(song);
    onClose();
  }

  function handleGoToAlbum() {
    if (song?.albumId == null) return;
    router.push(`/album/${song.albumId}`);
    onClose();
  }

  function handleGoToArtist() {
    if (song == null) return;
    router.push(`/artist/${song.artistId}`);
    onClose();
  }

  async function handleShare() {
    if (song == null) return;
    await Share.share({ message: `${song.title} - ${song.artistName}` });
    onClose();
  }

  return (
    <SheetModal visible={song != null} onClose={onClose}>
      {song != null && (
        <View>
          <View style={styles.songHeader}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {song.artistName}
            </Text>
          </View>

          <View style={styles.divider} />

          <ActionRow icon="play" label="Play Now" onPress={handlePlayNow} />
          <ActionRow icon="playlistAdd" label="Add to Playlist" onPress={handleAddToPlaylist} />
          <ActionRow
            icon={liked ? 'heartFill' : 'heart'}
            label={liked ? 'Unlike' : 'Like'}
            onPress={handleToggleLike}
            iconColor={liked ? colors.like : colors.text}
            labelColor={liked ? colors.like : colors.text}
          />
          {song.albumId != null && (
            <ActionRow icon="album" label="Go to Album" onPress={handleGoToAlbum} />
          )}
          <ActionRow icon="artist" label="Go to Artist" onPress={handleGoToArtist} />
          <ActionRow icon="share" label="Share" onPress={handleShare} />
        </View>
      )}
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  songHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xxs,
  },
  songTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  songArtist: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  actionLabel: {
    ...typography.body,
    color: colors.text,
  },
});
