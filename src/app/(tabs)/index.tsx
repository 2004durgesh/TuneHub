import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import ArtworkCard from '@/components/ArtworkCard';
import { SongActionSheet } from '@/components/SongActionSheet';
import { SongRow } from '@/components/SongRow';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useHistory } from '@/hooks/useHistory';
import { useHomeData } from '@/hooks/useHomeData';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { playSongs } from '@/hooks/usePlayer';
import { getSongById } from '@/services/music';
import { useSettingsStore } from '@/store';
import { colors, radii, spacing, typography } from '@/theme';
import type { ArtistSummary, DiscoveryItem, Song } from '@/types';
import { profiled } from '@/perf/perfHarness';

const CARD_WIDTH = 148;
const ARTIST_CARD_WIDTH = 96;

// ── Section header ──────────────────────────────────────────────────────────

type SectionHeaderProps = { title: string; onSeeAll?: () => void };

function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Discovery row (cards) ───────────────────────────────────────────────────

type DiscoveryRowProps = {
  title: string;
  items: DiscoveryItem[];
  onPress: (item: DiscoveryItem) => void;
};

function DiscoveryRow({ title, items, onPress }: DiscoveryRowProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        renderItem={({ item }) => (
          <ArtworkCard
            imageUrl={item.artworkUrl}
            title={item.title}
            subtitle={item.subtitle ?? undefined}
            width={CARD_WIDTH}
            onPress={() => onPress(item)}
          />
        )}
      />
    </View>
  );
}

// ── Top artists row ─────────────────────────────────────────────────────────

type ArtistsRowProps = { artists: ArtistSummary[]; onPress: (a: ArtistSummary) => void };

function ArtistsRow({ artists, onPress }: ArtistsRowProps) {
  if (artists.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="Top Artists" />
      <FlatList
        data={artists}
        keyExtractor={(a) => a.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        renderItem={({ item }) => (
          <Pressable style={styles.artistCard} onPress={() => onPress(item)}>
            <ArtworkCard
              imageUrl={item.artworkUrl}
              title={item.name}
              width={ARTIST_CARD_WIDTH}
              onPress={() => onPress(item)}
            />
          </Pressable>
        )}
      />
    </View>
  );
}

// ── Recently played ─────────────────────────────────────────────────────────

type RecentlyPlayedProps = {
  songs: Song[];
  onPress: (song: Song) => void;
  onLongPress: (song: Song) => void;
};

function RecentlyPlayed({ songs, onPress, onLongPress }: RecentlyPlayedProps) {
  if (songs.length === 0) return null;

  const recent = songs.slice(0, 5);

  return (
    <View style={styles.section}>
      <SectionHeader title="Recently Played" />
      {recent.map((song) => (
        <SongRow key={song.id} song={song} onPress={onPress} onLongPress={onLongPress} />
      ))}
    </View>
  );
}

// ── Search entry ────────────────────────────────────────────────────────────

function SearchEntry() {
  const router = useRouter();
  return (
    <Pressable style={styles.searchEntry} onPress={() => router.push('/search')}>
      <AppIcon name="search" size={18} color={colors.textTertiary} />
      <Text style={styles.searchPlaceholder}>Songs, artists, albums…</Text>
    </Pressable>
  );
}

// ── Home header ─────────────────────────────────────────────────────────────

function HomeHeader() {
  const router = useRouter();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.appName}>TuneHub</Text>
      </View>
      <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
        <AppIcon name="settings" size={24} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────────

function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset(true);
  const router = useRouter();
  const { charts, newReleases, featuredPlaylists, topArtists, loading, error, refresh } =
    useHomeData();
  const { history } = useHistory();
  const audioQuality = useSettingsStore((s) => s.audioQuality);
  const [sheetSong, setSheetSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const handleDiscoveryPress = async (item: DiscoveryItem) => {
    if (item.kind === 'song') {
      const song = await getSongById(item.id, audioQuality).catch(() => null);
      if (song) await playSongs([song], 0);
    } else if (item.kind === 'album') {
      router.push(`/album/${item.id}`);
    } else {
      router.push(`/playlist/${item.id}`);
    }
  };

  const handleArtistPress = (artist: ArtistSummary) => {
    router.push(`/artist/${artist.id}`);
  };

  const handleSongPress = (song: Song) => {
    // Queue the whole history so next/previous move through it (a one-song queue just stops).
    void playSongs(
      history,
      Math.max(
        0,
        history.findIndex((s) => s.id === song.id),
      ),
    );
  };

  if (loading && charts.length === 0) {
    return <LoadingState message="Loading music…" />;
  }

  if (error && charts.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  const hasContent = charts.length > 0 || newReleases.length > 0 || featuredPlaylists.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: top + spacing.md, paddingBottom: spacing.xxl + miniPlayerInset },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <HomeHeader />
      <SearchEntry />

      {!hasContent ? (
        <EmptyState
          icon="queue"
          title="No music yet"
          subtitle="Pull to refresh to discover songs"
        />
      ) : (
        <>
          <RecentlyPlayed songs={history} onPress={handleSongPress} onLongPress={setSheetSong} />
          <DiscoveryRow title="Charts" items={charts} onPress={handleDiscoveryPress} />
          <DiscoveryRow title="New Releases" items={newReleases} onPress={handleDiscoveryPress} />
          <DiscoveryRow
            title="Featured Playlists"
            items={featuredPlaylists}
            onPress={handleDiscoveryPress}
          />
          <ArtistsRow artists={topArtists} onPress={handleArtistPress} />
        </>
      )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  appName: {
    ...typography.screenTitle,
    color: colors.text,
  },
  searchEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textTertiary,
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
  horizontalList: {
    paddingHorizontal: spacing.md,
  },
  cardSeparator: {
    width: spacing.sm,
  },
  artistCard: {
    alignItems: 'center',
  },
});

export default profiled('Home tab', HomeScreen);
