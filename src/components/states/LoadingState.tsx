import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type Props = {
  message?: string;
};

export function LoadingState({ message }: Props) {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.accent} size="large" />
      {message != null && <Text style={styles.message}>{message}</Text>}
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
    ...typography.metadata,
    color: colors.textSecondary,
  },
});
