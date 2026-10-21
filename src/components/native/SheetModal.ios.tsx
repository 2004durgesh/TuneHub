import { View } from 'react-native';
import { BottomSheet, RNHostView } from '@expo/ui';

import { colors } from '@/theme';
import type { SheetModalProps } from './SheetModal';

/**
 * Bottom sheet built on `@expo/ui`'s native `BottomSheet`. Omitting `snapPoints`
 * auto-sizes it to content. The RN children are wrapped in `RNHostView` so they
 * bridge into the native (Compose/SwiftUI) tree and stay interactive — plain RN
 * views placed directly in a `BottomSheet` render but don't receive touches.
 */
export function SheetModal({ visible, onClose, children }: SheetModalProps) {
  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onClose}
      showDragIndicator
      containerColor={colors.surface}
      contentColor={colors.text}
    >
      <RNHostView>
        <View>{children}</View>
      </RNHostView>
    </BottomSheet>
  );
}
