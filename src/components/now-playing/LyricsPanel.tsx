import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { EmptyState } from '@/components/states/EmptyState';
import { LoadingState } from '@/components/states/LoadingState';
import { usePlayer } from '@/hooks/usePlayer';
import { getLyrics } from '@/services/music';
import { colors, spacing, typography } from '@/theme';

/** Lyrics for the current song, shown in place of the artwork in the expanded player. */
export function LyricsPanel() {
  const { currentSong } = usePlayer();
  const lyricsId = currentSong?.lyricsId ?? null;
  const [result, setResult] = useState<{ id: string; text: string | null } | null>(null);

  useEffect(() => {
    if (!lyricsId) return;
    let active = true;
    getLyrics(lyricsId)
      .then((text) => {
        if (active) setResult({ id: lyricsId, text });
      })
      .catch(() => {
        if (active) setResult({ id: lyricsId, text: null });
      });
    return () => {
      active = false;
    };
  }, [lyricsId]);

  if (lyricsId && result?.id !== lyricsId) return <LoadingState />;

  const lyrics = lyricsId ? result?.text : null;
  if (!lyrics) {
    return (
      <EmptyState
        icon="lyrics"
        title="No lyrics available"
        subtitle="This song doesn't have lyrics yet"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.lyrics}>{lyrics}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.sm, paddingBottom: spacing.lg },
  lyrics: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 28,
  },
});
