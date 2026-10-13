import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState, useCallback } from 'react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Host } from '@expo/ui';
import type { Playlist } from 'react-native-nitro-player';
import { AppIcon } from '@/components/app-icon';
import { ThemedList, ThemedListItem } from '@/components/native/ThemedList';
import { ThemedTextInput } from '@/components/native/ThemedTextInput';
import { SheetModal } from '@/components/SheetModal';
import { EmptyState } from '@/components/states/EmptyState';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { getAllPlaylists, createPlaylist, deletePlaylist } from '@/services/player/playerQueue';
import { colors, radii, spacing, typography } from '@/theme';

export default function PlaylistsScreen() {
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  // Bumped on each open so the name field remounts empty.
  const [nameFieldKey, setNameFieldKey] = useState(0);

  const refresh = useCallback(() => {
    setPlaylists(getAllPlaylists());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleCreate = useCallback(() => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'New Playlist',
        'Enter a name for your playlist',
        (name) => {
          if (!name?.trim()) return;
          void createPlaylist(name.trim()).then(refresh);
        },
        'plain-text',
        '',
      );
    } else {
      setNewName('');
      setNameFieldKey((k) => k + 1);
      setShowCreateModal(true);
    }
  }, [refresh]);

  const handleCreateConfirm = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setShowCreateModal(false);
    void createPlaylist(trimmed).then(refresh);
  }, [newName, refresh]);

  const handleDelete = useCallback(
    (playlist: Playlist) => {
      Alert.alert('Delete Playlist', `Delete "${playlist.name}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deletePlaylist(playlist.id).then(refresh);
          },
        },
      ]);
    },
    [refresh],
  );

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <AppIcon name="chevronLeft" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>My Playlists</Text>
        <Pressable onPress={handleCreate} hitSlop={8} style={styles.headerSide}>
          <AppIcon name="add" size={24} color={colors.text} />
        </Pressable>
      </View>

      {playlists.length === 0 ? (
        <EmptyState
          icon="queue"
          title="No playlists yet"
          subtitle="Create a playlist to get started"
        />
      ) : (
        // TODO: @expo/ui ListItem has no long-press / per-row action, so
        // long-press-to-delete is dropped here. Re-wire delete via a swipe
        // action or a delete button on /playlist-detail/[id]. handleDelete /
        // deletePlaylist are kept intact for that follow-up.
        <Host style={[styles.listHost, { marginBottom: miniPlayerInset }]} colorScheme="dark">
          <ThemedList>
            {playlists.map((playlist) => (
              <ThemedListItem
                key={playlist.id}
                onPress={() => router.push(`/playlist-detail/${playlist.id}`)}
                leading={<AppIcon name="queue" size={20} color={colors.accent} />}
                trailing={<AppIcon name="chevronRight" size={16} color={colors.textTertiary} />}
                supportingText={`${playlist.tracks.length} songs`}
              >
                {playlist.name}
              </ThemedListItem>
            ))}
          </ThemedList>
        </Host>
      )}

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
  listHost: {
    flex: 1,
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
