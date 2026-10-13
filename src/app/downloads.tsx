import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/app-icon';
import { Artwork } from '@/components/Artwork';
import { SONG_LIST_WINDOW, SongRow } from '@/components/SongRow';
import { SongActionSheet } from '@/components/SongActionSheet';
import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { EmptyState } from '@/components/states/EmptyState';
import {
  removeCollectionDownloads,
  useDownloadCollections,
  useDownloads,
} from '@/hooks/useDownloads';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { usePlayer } from '@/hooks/usePlayer';
import { colors, radii, spacing, typography } from '@/theme';
import type { Download, DownloadCollection, Song } from '@/types';

const formatSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const songCount = (count: number) => `${count} ${count === 1 ? 'song' : 'songs'}`;

type Section = {
  key: string;
  collection: DownloadCollection | null;
  items: Download[];
  data: Download[];
};

type HeaderProps = {
  collection: DownloadCollection;
  items: Download[];
  expanded: boolean;
  onToggle: () => void;
};

function CollectionHeader({ collection, items, expanded, onToggle }: HeaderProps) {
  const completed = items.filter((d) => d.status === 'completed');
  const active = items.some((d) => d.status === 'queued' || d.status === 'downloading');
  const bytes = completed.reduce((sum, d) => sum + d.bytes, 0);
  const kind = collection.kind === 'album' ? 'Album' : 'Playlist';
  const detail = active
    ? `Downloading ${completed.length}/${items.length}`
    : completed.length === items.length
      ? `${songCount(items.length)} · ${formatSize(bytes)}`
      : `${completed.length}/${songCount(items.length)} · ${formatSize(bytes)}`;

  function handleRemove() {
    Alert.alert(
      'Remove Downloads?',
      `${collection.title} will be removed from this device. Songs you downloaded on their own stay.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeCollectionDownloads(collection.id),
        },
      ],
    );
  }

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={handleRemove}
      android_ripple={{ color: colors.surfaceHigh }}
      style={styles.collection}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <Artwork uri={collection.artworkUrl} size={spacing.xxl} borderRadius={radii.sm} />
      <View style={styles.collectionText}>
        <Text style={styles.collectionTitle} numberOfLines={1}>
          {collection.title}
        </Text>
        <Text style={styles.collectionDetail} numberOfLines={1}>
          {`${kind} · ${detail}`}
        </Text>
      </View>
      <AppIcon
        name={expanded ? 'chevronDown' : 'chevronRight'}
        size={20}
        color={colors.textTertiary}
      />
    </Pressable>
  );
}

export default function DownloadsScreen() {
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const router = useRouter();
  const { downloads, byId, downloadSong, removeAllDownloads } = useDownloads();
  const collections = useDownloadCollections();
  const { playSongs, currentSong, isPlaying } = usePlayer();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const sections = useMemo<Section[]>(() => {
    const grouped = new Set<string>();
    const result: Section[] = collections.map((collection) => {
      const items = collection.songIds
        .map((id) => byId[id])
        .filter((d): d is Download => d != null);
      items.forEach((d) => grouped.add(d.song.id));
      return {
        key: collection.id,
        collection,
        items,
        data: expanded.has(collection.id) ? items : [],
      };
    });
    const singles = downloads.filter((d) => d.single || !grouped.has(d.song.id));
    if (singles.length > 0) {
      result.push({ key: 'songs', collection: null, items: singles, data: singles });
    }
    return result;
  }, [collections, byId, downloads, expanded]);

  const completed = downloads.filter((d) => d.status === 'completed');
  const totalBytes = completed.reduce((sum, d) => sum + d.bytes, 0);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRemoveAll() {
    Alert.alert('Remove All Downloads', 'Downloaded songs will be deleted from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: removeAllDownloads },
    ]);
  }

  function statusElement(download: Download) {
    switch (download.status) {
      case 'completed':
        return <AppIcon name="downloaded" size={20} color={colors.accent} />;
      case 'downloading':
        return <Text style={styles.status}>{`${Math.round(download.progress * 100)}%`}</Text>;
      case 'queued':
        return <Text style={styles.status}>Waiting</Text>;
      case 'failed':
        return (
          <Pressable
            onPress={() => downloadSong(download.song)}
            hitSlop={8}
            accessibilityLabel="Retry download"
          >
            <AppIcon name="retry" size={20} color={colors.error} />
          </Pressable>
        );
    }
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <AppIcon name="chevronLeft" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Downloads</Text>
        <View style={styles.headerSide}>
          {downloads.length > 0 && (
            <Pressable
              onPress={handleRemoveAll}
              hitSlop={8}
              accessibilityLabel="Remove all downloads"
            >
              <AppIcon name="trash" size={20} color={colors.text} />
            </Pressable>
          )}
        </View>
      </View>

      {completed.length > 0 && (
        <Text style={styles.count}>
          {songCount(completed.length)} · {formatSize(totalBytes)}
        </Text>
      )}

      {downloads.length === 0 ? (
        <EmptyState
          icon="download"
          title="No downloads yet"
          subtitle="Download songs, albums or playlists to play them offline"
        />
      ) : (
        <SectionList
          sections={sections}
          {...SONG_LIST_WINDOW}
          keyExtractor={(item) => item.song.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) =>
            section.collection ? (
              <CollectionHeader
                collection={section.collection}
                items={section.items}
                expanded={expanded.has(section.key)}
                onToggle={() => toggle(section.key)}
              />
            ) : (
              <Text style={styles.sectionTitle}>Songs</Text>
            )
          }
          renderItem={({ item, section }) => (
            <SongRow
              song={item.song}
              onPress={(song) => {
                const queue = section.items.map((d) => d.song);
                void playSongs(
                  queue,
                  Math.max(
                    0,
                    queue.findIndex((s) => s.id === song.id),
                  ),
                );
              }}
              onLongPress={setSelectedSong}
              isPlaying={currentSong?.id === item.song.id && isPlaying}
              rightElement={statusElement(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: spacing.xxl + miniPlayerInset }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SongActionSheet
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
        onAddToPlaylist={() => setAddToPlaylistSong(selectedSong)}
      />
      <AddToPlaylistSheet song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    ...typography.sectionHeader,
    color: colors.text,
    textAlign: 'center',
  },
  count: {
    ...typography.metadata,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  collection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  collectionText: {
    flex: 1,
    gap: spacing.xxs,
  },
  collectionTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  collectionDetail: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  status: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
});
