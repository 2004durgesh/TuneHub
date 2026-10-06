import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Playlist } from 'react-native-nitro-player';
import type { Song } from '@/types';
import { AppIcon } from '@/components/app-icon';
import { ThemedTextInput } from '@/components/native/ThemedTextInput';
import { SheetModal } from '@/components/SheetModal';
import { addSongToPlaylist, createPlaylist, getAllPlaylists } from '@/services/player/playerQueue';
import { colors, radii, spacing, typography } from '@/theme';

type Props = {
  song: Song | null;
  onClose: () => void;
};

export function AddToPlaylistSheet({ song, onClose }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  // Bumped on each open so the name field remounts empty.
  const [nameFieldKey, setNameFieldKey] = useState(0);
  // Song captured when the create flow starts, since the sheet closes first.
  const [pendingSong, setPendingSong] = useState<Song | null>(null);

  // Refresh the playlist list whenever the sheet is opened for a song.
  useEffect(() => {
    if (song != null) {
      setPlaylists(getAllPlaylists());
    }
  }, [song]);

  const handleAdd = useCallback(
    (playlistId: string) => {
      if (song == null) return;
      void addSongToPlaylist(playlistId, song).then(onClose);
    },
    [song, onClose],
  );

  const createAndAdd = useCallback((name: string, target: Song) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    void createPlaylist(trimmed).then((id) => addSongToPlaylist(id, target));
  }, []);

  const handleNewPlaylist = useCallback(() => {
    const target = song;
    if (target == null) return;
    // Close this sheet first, then prompt — avoids stacking two Modals.
    onClose();
    setTimeout(() => {
      if (Platform.OS === 'ios') {
        Alert.prompt(
          'New Playlist',
          'Enter a name for your playlist',
          (name) => createAndAdd(name ?? '', target),
          'plain-text',
          '',
        );
      } else {
        setPendingSong(target);
        setNewName('');
        setNameFieldKey((k) => k + 1);
        setShowCreateModal(true);
      }
    }, 350);
  }, [song, onClose, createAndAdd]);

  const handleCreateConfirm = useCallback(() => {
    setShowCreateModal(false);
    if (pendingSong != null) createAndAdd(newName, pendingSong);
    setPendingSong(null);
  }, [newName, pendingSong, createAndAdd]);

  return (
    <>
      <SheetModal visible={song != null} onClose={onClose}>
        {song != null && (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Add to Playlist</Text>
            </View>

            <View style={styles.divider} />

            <Pressable
              onPress={handleNewPlaylist}
              android_ripple={{ color: colors.surfaceHigh }}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowIcon}>
                <AppIcon name="add" size={20} color={colors.accent} />
              </View>
              <Text style={styles.rowLabel}>New Playlist</Text>
            </Pressable>

            {playlists.length === 0 ? (
              <Text style={styles.emptyHint}>No playlists yet — create one above</Text>
            ) : (
              playlists.map((playlist) => (
                <Pressable
                  key={playlist.id}
                  onPress={() => handleAdd(playlist.id)}
                  android_ripple={{ color: colors.surfaceHigh }}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <View style={styles.rowIcon}>
                    <AppIcon name="queue" size={20} color={colors.accent} />
                  </View>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={styles.trackCount}>{playlist.tracks.length}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </SheetModal>

      {/* Android create prompt — native bottom sheet (iOS uses Alert.prompt) */}
      <SheetModal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <View style={styles.createSheet}>
          <Text style={styles.modalTitle}>New Playlist</Text>
          <View style={styles.modalInput}>
            <ThemedTextInput
              key={nameFieldKey}
              onChangeText={setNewName}
              placeholder="Playlist name"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateConfirm}
            />
          </View>
          <View style={styles.modalButtons}>
            <Pressable onPress={() => setShowCreateModal(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnCancel}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleCreateConfirm} style={styles.modalBtn}>
              <Text style={styles.modalBtnConfirm}>Create</Text>
            </Pressable>
          </View>
        </View>
      </SheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  rowIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  trackCount: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  emptyHint: {
    ...typography.metadata,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  // Create-playlist prompt (inside SheetModal)
  createSheet: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.sectionHeader,
    color: colors.text,
  },
  modalInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modalBtnCancel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalBtnConfirm: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
});
