import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Playlist } from 'react-native-nitro-player';
import { AppIcon } from '@/components/app-icon';
import { EmptyState } from '@/components/states/EmptyState';
import { getAllPlaylists, createPlaylist, deletePlaylist } from '@/services/player/playerQueue';
import { colors, radii, spacing, typography } from '@/theme';

export default function PlaylistsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');

  const refresh = useCallback(() => {
    setPlaylists(getAllPlaylists());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
          <AppIcon name="chevronDown" size={24} color={colors.text} />
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
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.playlistRow, pressed && styles.pressed]}
              onPress={() => router.push(`/playlist-detail/${item.id}`)}
              onLongPress={() => handleDelete(item)}
              android_ripple={{ color: colors.surfaceHigh }}
            >
              <View style={styles.playlistIcon}>
                <AppIcon name="queue" size={20} color={colors.accent} />
              </View>
              <Text style={styles.playlistName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.tracks.length > 0 && (
                <Text style={styles.trackCount}>{item.tracks.length}</Text>
              )}
              <AppIcon name="chevronRight" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Android create modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor={colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateConfirm}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowCreateModal(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnCancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreateConfirm} style={styles.modalBtn}>
                <Text style={styles.modalBtnConfirm}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  listContent: {
    paddingBottom: spacing.xxl,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistName: {
    flex: 1,
    ...typography.bodyStrong,
    color: colors.text,
  },
  trackCount: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
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
    ...typography.body,
    color: colors.text,
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
