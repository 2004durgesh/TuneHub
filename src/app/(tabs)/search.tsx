import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import ArtworkCard from '@/components/ArtworkCard';
import { SongActionSheet } from '@/components/SongActionSheet';
import { SongRow } from '@/components/SongRow';
import { LoadingState } from '@/components/states/LoadingState';
import { usePlayer } from '@/hooks/usePlayer';
import { getSongById, searchAll } from '@/services/music';
import { useMusicStore, useSettingsStore } from '@/store';
import { colors, radii, spacing, typography } from '@/theme';
import type { AlbumSummary, ArtistSummary, DiscoveryItem, Song } from '@/types';

const CARD_WIDTH = 140;

// ── History chips ────────────────────────────────────────────────────────────

type HistoryChipsProps = {
  history: string[];
  onSelect: (q: string) => void;
  onClear: () => void;
};

function HistoryChips({ history, onSelect, onClear }: HistoryChipsProps) {
  if (history.length === 0) return null;

  return (
    <View style={styles.historySection}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Recent searches</Text>
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>
      <View style={styles.chips}>
        {history.map((q) => (
          <Pressable key={q} style={styles.chip} onPress={() => onSelect(q)}>
            <Text style={styles.chipText} numberOfLines={1}>
              {q}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Results sections ─────────────────────────────────────────────────────────

type ResultsProps = {
  songs: Song[];
  albums: AlbumSummary[];
  artists: ArtistSummary[];
  playlists: DiscoveryItem[];
  onSongPress: (song: Song) => void;
  onSongLongPress: (song: Song) => void;
  onAlbumPress: (album: AlbumSummary) => void;
  onItemPress: (item: DiscoveryItem) => void;
  onArtistPress: (artist: ArtistSummary) => void;
};

function SearchResults({
  songs,
  albums,
  artists,
  playlists,
  onSongPress,
  onSongLongPress,
  onAlbumPress,
  onItemPress,
  onArtistPress,
}: ResultsProps) {
  const isEmpty =
    songs.length === 0 && albums.length === 0 && artists.length === 0 && playlists.length === 0;

  if (isEmpty) {
    return (
      <View style={styles.emptyResults}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {songs.length > 0 && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Songs</Text>
          {songs.slice(0, 5).map((song) => (
            <SongRow
              key={song.id}
              song={song}
              onPress={onSongPress}
              onLongPress={onSongLongPress}
            />
          ))}
        </View>
      )}

      {albums.length > 0 && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Albums</Text>
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <ArtworkCard
                imageUrl={item.artworkUrl}
                title={item.title}
                subtitle={item.artistName}
                width={CARD_WIDTH}
                onPress={() => onAlbumPress(item)}
              />
            )}
          />
        </View>
      )}

      {artists.length > 0 && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Artists</Text>
          <FlatList
            data={artists}
            keyExtractor={(a) => a.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <ArtworkCard
                imageUrl={item.artworkUrl}
                title={item.name}
                width={CARD_WIDTH}
                onPress={() => onArtistPress(item)}
              />
            )}
          />
        </View>
      )}

      {playlists.length > 0 && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Playlists</Text>
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <ArtworkCard
                imageUrl={item.artworkUrl}
                title={item.title}
                width={CARD_WIDTH}
                onPress={() => onItemPress(item)}
              />
            )}
          />
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { playSongs } = usePlayer();
  const audioQuality = useSettingsStore((s) => s.audioQuality);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetSong, setSheetSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const searchResults = useMusicStore((s) => s.searchResults);
  const searchHistory = useMusicStore((s) => s.searchHistory);
  const setSearchResults = useMusicStore((s) => s.setSearchResults);
  const setSearchLoading = useMusicStore((s) => s.setSearchLoading);
  const addSearchHistory = useMusicStore((s) => s.addSearchHistory);
  const clearSearchHistory = useMusicStore((s) => s.clearSearchHistory);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setLoading(true);
      setSearchLoading(true);
      addSearchHistory(trimmed);
      try {
        const results = await searchAll(trimmed);
        setSearchResults(results);
      } catch {
        setSearchResults(null);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [setSearchResults, setSearchLoading, addSearchHistory],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (!text.trim()) {
        setSearchResults(null);
      }
    },
    [setSearchResults],
  );

  const handleSubmit = useCallback(() => {
    void runSearch(query);
  }, [query, runSearch]);

  const handleHistorySelect = useCallback(
    (q: string) => {
      setQuery(q);
      void runSearch(q);
    },
    [runSearch],
  );

  const handleSongPress = useCallback(
    async (song: Song) => {
      try {
        const full = await getSongById(song.id, audioQuality);
        if (full == null) return;
        await playSongs([full], 0);
      } catch {
        // ignore; song unavailable
      }
    },
    [audioQuality, playSongs],
  );

  const handleSongLongPress = useCallback((song: Song) => {
    setSheetSong(song);
  }, []);

  const handleAlbumPress = useCallback(
    (album: AlbumSummary) => {
      router.push(`/album/${album.id}`);
    },
    [router],
  );

  const handleItemPress = useCallback(
    (item: DiscoveryItem) => {
      if (item.kind === 'album') {
        router.push(`/album/${item.id}`);
      } else {
        router.push(`/playlist/${item.id}`);
      }
    },
    [router],
  );

  const handleArtistPress = useCallback(
    (artist: ArtistSummary) => {
      router.push(`/artist/${artist.id}`);
    },
    [router],
  );

  const showHistory = query.trim() === '' && !searchResults;
  const showResults = !loading && searchResults !== null;

  return (
    <View style={[styles.container, { paddingTop: top + spacing.sm }]}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <AppIcon name="search" size={18} color={colors.textTertiary} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Songs, artists, albums…"
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor={colors.accent}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              setSearchResults(null);
              inputRef.current?.focus();
            }}
            hitSlop={8}
          >
            <AppIcon name="close" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Body */}
      {loading && <LoadingState />}

      {!loading && showHistory && (
        <HistoryChips
          history={searchHistory}
          onSelect={handleHistorySelect}
          onClear={clearSearchHistory}
        />
      )}

      {showResults && searchResults && (
        <SearchResults
          songs={searchResults.songs}
          albums={searchResults.albums}
          artists={searchResults.artists}
          playlists={searchResults.playlists}
          onSongPress={handleSongPress}
          onSongLongPress={handleSongLongPress}
          onAlbumPress={handleAlbumPress}
          onItemPress={handleItemPress}
          onArtistPress={handleArtistPress}
        />
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
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  historySection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  clearText: {
    ...typography.metadata,
    color: colors.accent,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    maxWidth: 200,
  },
  chipText: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  resultSection: {
    marginBottom: spacing.lg,
  },
  resultTitle: {
    ...typography.sectionHeader,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  horizontalList: {
    paddingHorizontal: spacing.md,
  },
  emptyResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
