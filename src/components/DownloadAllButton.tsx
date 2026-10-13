import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { AppIcon } from '@/components/app-icon';
import {
  cancelCollectionDownloads,
  downloadCollection,
  removeCollectionDownloads,
  useDownloadCounts,
  useHasDownloadCollection,
} from '@/hooks/useDownloads';
import { colors, radii, spacing, typography } from '@/theme';
import type { DownloadCollectionInfo, Song } from '@/types';

type Props = {
  collection: DownloadCollectionInfo;
  songs: Song[];
  style?: StyleProp<ViewStyle>;
};

export function DownloadAllButton({ collection, songs, style }: Props) {
  const ids = songs.map((s) => s.id);
  const { completed, active } = useDownloadCounts(ids);
  const saved = useHasDownloadCollection(collection.id);
  const total = songs.length;
  if (total === 0) return null;

  const downloading = saved && active > 0;
  const done = saved && completed === total;

  function handlePress() {
    if (downloading) {
      Alert.alert('Stop Downloading?', 'Songs that already finished stay on this device.', [
        { text: 'Keep Downloading', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => cancelCollectionDownloads(collection.id),
        },
      ]);
    } else if (done) {
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
    } else {
      downloadCollection(collection, songs);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={
        downloading ? 'Stop downloading' : done ? 'Remove downloads' : 'Download all'
      }
    >
      {downloading ? (
        <Text style={styles.progress}>{`${completed}/${total}`}</Text>
      ) : (
        <AppIcon name={done ? 'downloaded' : 'download'} size={20} color={colors.accent} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: spacing.xxl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  progress: {
    ...typography.metadata,
    color: colors.accent,
  },
});
