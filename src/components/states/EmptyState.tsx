import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/components/app-icon';
import type { IconName } from '@/components/app-icon';
import { colors, spacing, typography } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: IconName;
};

export function EmptyState({ title, subtitle, icon }: Props) {
  return (
    <View style={styles.root}>
      {icon != null && <AppIcon name={icon} size={40} color={colors.textTertiary} />}
      <Text style={styles.title}>{title}</Text>
      {subtitle != null && <Text style={styles.subtitle}>{subtitle}</Text>}
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
  title: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.metadata,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
