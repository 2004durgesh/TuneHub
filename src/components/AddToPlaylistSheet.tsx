import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Playlist } from 'react-native-nitro-player';
import type { Song } from '@/types';
import { AppIcon } from '@/components/app-icon';
import { ThemedTextInput } from '@/components/native/ThemedTextInput';
import { SheetModal } from '@/components/native/SheetModal';
import { showToast } from '@/components/Toast';
import { addSongsToPlaylist, createPlaylist, getAllPlaylists } from '@/services/player/playerQueue';
import { colors, radii, spacing, typography } from '@/theme';

type Props = {
  /** One song from a song menu, or a whole album/playlist; `null` closes the sheet. */
  songs: readonly Song[] | null;
  /** Prefills the name of a new playlist, e.g. the album being added. */
  suggestedName?: string;
  onClose: () => void;
};

const songsLabel = (count: number) => `${count} song${count === 1 ? '' : 's'}`;

function confirmAdded(playlistId: string, name: string, added: number, total: number) {
  const message =
    added === 0
      ? `Already in ${name}`
      : total === 1
        ? `Added to ${name}`
        : added === total
          ? `Added ${songsLabel(added)} to ${name}`
          : `Added ${songsLabel(added)} to ${name} · ${total - added} already there`;
  showToast(message, {
    label: 'View',
    onPress: () => router.push(`/playlist-detail/${playlistId}`),
  });
}

export function AddToPlaylistSheet({ songs, suggestedName = '', onClose }: Props) {
  // Re-read (a synchronous native call) each time the sheet opens; the old list stays while it
  // closes so it doesn't empty mid-dismiss.
  const open = songs != null;
  const [playlists, setPlaylists] = useState<Playlist[]>(getAllPlaylists);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPlaylists(getAllPlaylists());
  }
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  // Bumped on each open so the name field remounts with the suggested name.
  const [nameFieldKey, setNameFieldKey] = useState(0);
  // Captured when the create flow starts: closing this sheet clears `songs` and `suggestedName`.
  const [pending, setPending] = useState<{ songs: readonly Song[]; name: string } | null>(null);

  const handleAdd = (playlist: Playlist) => {
    if (songs == null) return;
    const total = songs.length;
    onClose();
    void addSongsToPlaylist(playlist.id, songs).then((added) =>
      confirmAdded(playlist.id, playlist.name, added, total),
    );
  };

  const createAndAdd = (name: string, target: readonly Song[]) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    void createPlaylist(trimmed).then(async (id) => {
      await addSongsToPlaylist(id, target);
      showToast(
        target.length === 1
          ? `Added to ${trimmed}`
          : `Created ${trimmed} with ${songsLabel(target.length)}`,
        { label: 'View', onPress: () => router.push(`/playlist-detail/${id}`) },
      );
    });
  };

  const handleNewPlaylist = () => {
    const target = songs;
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
          suggestedName,
        );
      } else {
        setPending({ songs: target, name: suggestedName });
        setNewName(suggestedName);
        setNameFieldKey((k) => k + 1);
        setShowCreateModal(true);
      }
    }, 350);
  };

  const handleCreateConfirm = () => {
    setShowCreateModal(false);
    if (pending) createAndAdd(newName, pending.songs);
    setPending(null);
  };

  const songIds = new Set(songs?.map((song) => song.id));
  const hasAll = (playlist: Playlist) => {
    const inPlaylist = new Set(playlist.tracks.map((track) => track.id));
    return songIds.size > 0 && [...songIds].every((id) => inPlaylist.has(id));
  };

  return (
    <>
      <SheetModal visible={open} onClose={onClose}>
        {songs != null && (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>
                {songs.length === 1 ? 'Add to Playlist' : `Add ${songsLabel(songs.length)}`}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {songs.length === 1 ? songs[0].title : suggestedName}
              </Text>
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
              playlists.map((playlist) => {
                const added = hasAll(playlist);
                return (
                  <Pressable
                    key={playlist.id}
                    onPress={() => handleAdd(playlist)}
                    android_ripple={{ color: colors.surfaceHigh }}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                    accessibilityHint={added ? 'Already has these songs' : undefined}
                  >
                    <View style={styles.rowIcon}>
                      <AppIcon name="queue" size={20} color={colors.accent} />
                    </View>
                    <Text style={styles.rowLabel} numberOfLines={1}>
                      {playlist.name}
                    </Text>
                    {added ? (
                      <AppIcon name="check" size={18} color={colors.accent} />
                    ) : (
                      <Text style={styles.trackCount}>{playlist.tracks.length}</Text>
                    )}
                  </Pressable>
                );
              })
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
              defaultValue={pending?.name}
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
    gap: spacing.xxs,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  subtitle: {
    ...typography.metadata,
    color: colors.textSecondary,
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
