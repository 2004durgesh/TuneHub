import { ListItem, type ListItemProps, type ListProps } from '@expo/ui';
import { List, Text } from '@expo/ui/swift-ui';
import {
  background,
  font,
  foregroundStyle,
  listRowBackground,
  refreshable,
  scrollContentBackground,
} from '@expo/ui/swift-ui/modifiers';

import { colors, typography } from '@/theme';

// SwiftUI's List paints its own system grouped background (black page, gray rows), and the
// universal List/ListItem can't override it on iOS — so hide it and apply the theme here.
export function ThemedList({ children, onRefresh, testID }: ListProps) {
  return (
    <List
      testID={testID}
      modifiers={[
        scrollContentBackground('hidden'),
        background(colors.background),
        ...(onRefresh ? [refreshable(onRefresh)] : []),
      ]}
    >
      {children}
    </List>
  );
}

// The universal ListItem draws a string subtitle in the headline's font and a UIKit gray; Android's
// Material ListItem uses a smaller onSurfaceVariant line, so match that.
export function ThemedListItem({ modifiers, supportingText, ...props }: ListItemProps) {
  const supporting =
    typeof supportingText === 'string' ? (
      <Text
        modifiers={[
          font({ size: typography.metadata.fontSize }),
          foregroundStyle(colors.textSecondary),
        ]}
      >
        {supportingText}
      </Text>
    ) : (
      supportingText
    );

  return (
    <ListItem
      {...props}
      supportingText={supporting}
      modifiers={[listRowBackground(colors.surfaceElevated), ...(modifiers ?? [])]}
    />
  );
}
