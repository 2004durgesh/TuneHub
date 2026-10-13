import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { SongActionSheet } from '@/components/SongActionSheet';
import { SongRow } from '@/components/SongRow';
import { EmptyState } from '@/components/states/EmptyState';
import { useDownloads } from '@/hooks/useDownloads';
import { useHistory } from '@/hooks/useHistory';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { usePlayer } from '@/hooks/usePlayer';
import { colors, spacing, typography } from '@/theme';
import type { Song } from '@/types';

// ── Section row (nav entry) ──────────────────────────────────────────────────

type NavRowProps = {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
  count?: number;
  onPress: () => void;
};

function NavRow({ icon, label, count, onPress }: NavRowProps) {
  return (
    <Pressable
      style={styles.navRow}
      onPress={onPress}
      android_ripple={{ color: colors.surfaceHigh }}
    >
      <View style={styles.navIcon}>
        <AppIcon name={icon} size={20} color={colors.accent} />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
      {count !== undefined && <Text style={styles.navCount}>{count}</Text>}
      <AppIcon name="chevronRight" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function LibraryScreen() {
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const router = useRouter();
  const { likedSongs } = useLikedSongs();
  const { history } = useHistory();
  const { downloads } = useDownloads();
  const { playSongs } = usePlayer();
  const [sheetSong, setSheetSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const handleSongPress = useCallback(
    (song: Song) => {
      // Queue the whole history so next/previous move through it (a one-song queue just stops).
      void playSongs(
        history,
        Math.max(
          0,
          history.findIndex((s) => s.id === song.id),
        ),
      );
    },
    [history, playSongs],
  );

  const recentSongs = history.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: top + spacing.md, paddingBottom: spacing.xxl + miniPlayerInset },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Library</Text>

      {/* Navigation entries */}
      <View style={styles.navSection}>
        <NavRow
          icon="heart"
          label="Liked Songs"
          count={likedSongs.length}
          onPress={() => router.push('/liked-songs')}
        />
        <NavRow icon="queue" label="Playlists" onPress={() => router.push('/playlists')} />
        <NavRow
          icon="download"
          label="Downloads"
          count={downloads.filter((d) => d.status === 'completed').length}
          onPress={() => router.push('/downloads')}
        />
      </View>

      {/* Recently played preview */}
      {recentSongs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <Pressable onPress={() => router.push('/history')} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {recentSongs.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              onPress={handleSongPress}
              onLongPress={setSheetSong}
            />
          ))}
        </View>
      )}

      {likedSongs.length === 0 && history.length === 0 && (
        <EmptyState
          icon="heart"
          title="Your library is empty"
          subtitle="Like songs and play music to build your library"
        />
      )}

      <View style={{ height: spacing.xxl }} />

      <SongActionSheet
        song={sheetSong}
        onClose={() => setSheetSong(null)}
        onAddToPlaylist={() => {
          const s = sheetSong;
          setSheetSong(null);
          setAddToPlaylistSong(s);
        }}
      />
      <AddToPlaylistSheet song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
    </ScrollView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.screenTitle,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  navSection: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  navIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    ...typography.bodyStrong,
    color: colors.text,
  },
  navCount: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.text,
  },
  seeAll: {
    ...typography.metadata,
    color: colors.accent,
  },
});
