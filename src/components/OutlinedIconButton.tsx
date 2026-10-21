import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/theme';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** The square outlined action beside Play All in album and playlist headers. */
export function OutlinedIconButton({ onPress, accessibilityLabel, style, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
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
});
