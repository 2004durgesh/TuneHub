import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import ArtworkCard from '@/components/ArtworkCard';
import { Artwork } from '@/components/Artwork';
import { SongActionSheet } from '@/components/SongActionSheet';
import { SongRow } from '@/components/SongRow';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useArtist } from '@/hooks/queries';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { playSongs, useCurrentSongId } from '@/hooks/usePlayer';
import { colors, radii, screenPadding, spacing, typography } from '@/theme';
import type { AlbumSummary, Song } from '@/types';

const ALBUM_CARD_WIDTH = 128;
const TOP_SONGS_LIMIT = 5;

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const router = useRouter();
  const currentSongId = useCurrentSongId();

  const artistQuery = useArtist(id);
  const artist = artistQuery.data;
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [addingSong, setAddingSong] = useState<Song | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  const handleSongPress = (song: Song) => {
    if (!artist?.topSongs.length) return;
    const index = artist.topSongs.findIndex((s) => s.id === song.id);
    void playSongs(artist.topSongs, Math.max(index, 0));
  };

  const handleAlbumPress = (album: AlbumSummary) => {
    router.push(`/album/${album.id}`);
  };

  const handleSeeAllSongs = () => {
    router.push({ pathname: '/artist/[id]/songs', params: { id, name: artist?.name ?? '' } });
  };

  if (!artist) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
        {artistQuery.isError && !artistQuery.isFetching ? (
          <ErrorState
            message="Could not load artist. Please try again."
            onRetry={() => void artistQuery.refetch()}
          />
        ) : (
          <LoadingState message="Loading artist…" />
        )}
      </>
    );
  }

  const topSongs = artist.topSongs.slice(0, TOP_SONGS_LIMIT);

  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: top + spacing.xl, paddingBottom: spacing.xxl + miniPlayerInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Artwork uri={artist.artworkUrl} size={180} borderRadius={radii.pill} />
          <Text style={styles.artistName} numberOfLines={2}>
            {artist.name}
          </Text>
          {artist.followerCount != null && (
            <Text style={styles.followers}>{formatFollowers(artist.followerCount)} followers</Text>
          )}
        </View>

        {/* Bio */}
        {artist.bio != null && artist.bio.length > 0 && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText} numberOfLines={bioExpanded ? undefined : 3}>
              {artist.bio}
            </Text>
            <Pressable
              onPress={() => setBioExpanded((v) => !v)}
              style={({ pressed }) => pressed && styles.pressed}
              hitSlop={8}
            >
              <Text style={styles.bioToggle}>{bioExpanded ? 'Show less' : 'Show more'}</Text>
            </Pressable>
          </View>
        )}

        {/* Top Songs */}
        {topSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Songs</Text>
            {topSongs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                onPress={handleSongPress}
                onLongPress={setMenuSong}
                isPlaying={currentSongId === song.id}
              />
            ))}
            {artist.topSongs.length > 0 && (
              <Pressable
                onPress={handleSeeAllSongs}
                style={({ pressed }) => [styles.seeAllRow, pressed && styles.pressed]}
              >
                <Text style={styles.seeAllText}>See all songs</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Top Albums */}
        {artist.topAlbums.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Albums</Text>
            <FlatList
              data={artist.topAlbums}
              keyExtractor={(album) => album.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
              renderItem={({ item }) => (
                <ArtworkCard
                  imageUrl={item.artworkUrl}
                  title={item.title}
                  subtitle={item.artistName}
                  width={ALBUM_CARD_WIDTH}
                  onPress={() => handleAlbumPress(item)}
                />
              )}
            />
          </View>
        )}

        {/* Singles */}
        {artist.singles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Singles</Text>
            <FlatList
              data={artist.singles}
              keyExtractor={(single) => single.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
              renderItem={({ item }) => (
                <ArtworkCard
                  imageUrl={item.artworkUrl}
                  title={item.title}
                  subtitle={item.artistName}
                  width={ALBUM_CARD_WIDTH}
                  onPress={() => handleAlbumPress(item)}
                />
              )}
            />
          </View>
        )}
      </ScrollView>
      <SongActionSheet
        song={menuSong}
        onClose={() => setMenuSong(null)}
        onAddToPlaylist={() => setAddingSong(menuSong)}
      />
      <AddToPlaylistSheet songs={addingSong && [addingSong]} onClose={() => setAddingSong(null)} />
    </>
  );
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return String(count);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.lg,
  },
  artistName: {
    ...typography.screenTitle,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxs,
  },
  followers: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bioContainer: {
    paddingHorizontal: screenPadding,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  bioText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bioToggle: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.text,
    paddingHorizontal: screenPadding,
    marginBottom: spacing.sm,
  },
  seeAllRow: {
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.sm,
  },
  seeAllText: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
  horizontalList: {
    paddingHorizontal: screenPadding,
  },
  cardSeparator: {
    width: spacing.sm,
  },
});
