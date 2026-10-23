import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { EdgeFadeItem, useEdgeFade } from '@/components/EdgeFade';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingState } from '@/components/states/LoadingState';
import { useLyrics } from '@/hooks/queries';
import type { Lyrics } from '@/services/music';
import { usePlayerStore } from '@/store';
import { colors, spacing, typography } from '@/theme';

/** Lyrics for the current song, shown in place of the artwork in the expanded player. */
export function LyricsPanel() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const lyricsId = currentSong ? (currentSong.lyricsId ?? currentSong.id) : null;
  const { data: lyrics, isLoading } = useLyrics(lyricsId);

  if (isLoading) return <LoadingState />;
  if (!lyrics) {
    return (
      <EmptyState
        icon="lyrics"
        title="No lyrics available"
        subtitle="This song doesn't have lyrics yet"
      />
    );
  }

  return <LyricsBody key={lyricsId} lyrics={lyrics} />;
}

function LyricsBody({ lyrics }: { lyrics: Lyrics }) {
  const fade = useEdgeFade();
  const lines = lyrics.text.split(/\n\s*\n/).flatMap((stanza) =>
    stanza
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, i) => ({ text, startsStanza: i === 0 })),
  );

  return (
    <Animated.ScrollView
      {...fade.scrollProps}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {lines.map((line, i) => (
        <EdgeFadeItem
          key={i}
          frame={fade.frame}
          style={line.startsStanza && i > 0 ? styles.stanzaStart : undefined}
        >
          <Text style={styles.line}>{line.text}</Text>
        </EdgeFadeItem>
      ))}
      {lyrics.copyright && <Text style={styles.copyright}>{lyrics.copyright}</Text>}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xxs,
  },
  stanzaStart: { marginTop: spacing.lg },
  line: {
    ...typography.lyric,
    color: colors.text,
  },
  copyright: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.lg,
  },
});
