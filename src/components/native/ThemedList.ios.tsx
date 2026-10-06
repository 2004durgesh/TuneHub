import { ListItem, type ListItemProps, type ListProps } from '@expo/ui';
import { List } from '@expo/ui/swift-ui';
import {
  background,
  listRowBackground,
  refreshable,
  scrollContentBackground,
} from '@expo/ui/swift-ui/modifiers';

import { colors } from '@/theme';

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

export function ThemedListItem({ modifiers, ...props }: ListItemProps) {
  return (
    <ListItem
      {...props}
      modifiers={[listRowBackground(colors.surfaceElevated), ...(modifiers ?? [])]}
    />
  );
}
