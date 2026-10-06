import { Host, TextInput, type TextInputProps } from '@expo/ui';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme';

export type ThemedTextInputProps = TextInputProps & { containerStyle?: StyleProp<ViewStyle> };

// Native field in a Host sized to its height; width comes from `containerStyle`.
// fillMaxWidth: Compose's BasicTextField wraps its content otherwise (SwiftUI ignores it).
// Theme colors resolve to hex strings at runtime on every platform.
export function ThemedTextInput({
  containerStyle,
  textStyle,
  modifiers,
  ...props
}: ThemedTextInputProps) {
  return (
    <Host matchContents={{ vertical: true }} style={containerStyle} colorScheme="dark">
      <TextInput
        placeholderTextColor={colors.textTertiary}
        cursorColor={colors.accent}
        selectionColor={colors.accent}
        textStyle={{ fontSize: 16, color: colors.text as string, ...textStyle }}
        modifiers={[fillMaxWidth(), ...(modifiers ?? [])]}
        {...props}
      />
    </Host>
  );
}
