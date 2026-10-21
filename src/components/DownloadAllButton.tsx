import { Alert, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { AppIcon } from '@/components/app-icon';
import { OutlinedIconButton } from '@/components/OutlinedIconButton';
import {
  cancelCollectionDownloads,
  downloadCollection,
  removeCollectionDownloads,
  useDownloadCounts,
  useHasDownloadCollection,
} from '@/hooks/useDownloads';
import { colors, typography } from '@/theme';
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
    <OutlinedIconButton
      onPress={handlePress}
      style={style}
      accessibilityLabel={
        downloading ? 'Stop downloading' : done ? 'Remove downloads' : 'Download all'
      }
    >
      {downloading ? (
        <Text style={styles.progress}>{`${completed}/${total}`}</Text>
      ) : (
        <AppIcon name={done ? 'downloaded' : 'download'} size={20} color={colors.accent} />
      )}
    </OutlinedIconButton>
  );
}

const styles = StyleSheet.create({
  progress: {
    ...typography.metadata,
    color: colors.accent,
  },
});
