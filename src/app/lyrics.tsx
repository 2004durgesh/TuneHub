import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingState } from '@/components/states/LoadingState';
import { usePlayer } from '@/hooks/usePlayer';
import { getLyrics } from '@/services/music';
import { colors, spacing, typography } from '@/theme';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function LyricsScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { currentSong } = usePlayer();

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const lyricsId = currentSong?.lyricsId ?? null;

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!lyricsId) {
      setLyrics(null);
      setLoading(false);
      return;
    }
    getLyrics(lyricsId)
      .then((text) => {
        if (active) setLyrics(text);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lyricsId]);

  return (
    <View style={[styles.container, { paddingTop: top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
          <AppIcon name="chevronDown" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentSong?.title ?? 'Lyrics'}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <LoadingState />
      ) : lyrics ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lyrics}>{lyrics}</Text>
        </ScrollView>
      ) : (
        <EmptyState
          icon="lyrics"
          title="No lyrics available"
          subtitle="This song doesn't have lyrics yet"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.sm },
  lyrics: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 28,
  },
});
