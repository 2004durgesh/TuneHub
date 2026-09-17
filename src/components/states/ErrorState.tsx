import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/components/app-icon';
import { colors, spacing, typography } from '@/theme';

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.root}>
      <AppIcon name="warning" size={36} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry != null && (
        <Pressable onPress={onRetry} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.retry}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retry: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
});
