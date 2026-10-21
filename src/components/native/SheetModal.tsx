import {
  Column,
  Host,
  ModalBottomSheet,
  RNHostView,
  type ModalBottomSheetRef,
} from '@expo/ui/jetpack-compose';
import { padding } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

export type SheetModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Material 3 bottom sheet sized to its content. `@expo/ui`'s universal `BottomSheet` keeps M3's
 * half-open state unless it's given snap points that also stretch it full screen, so a tall sheet
 * (the song menu) opened halfway with its last rows under the navigation bar; this one skips the
 * half state. The RN children are wrapped in `RNHostView` so they stay interactive.
 */
export function SheetModal({ visible, onClose, children }: SheetModalProps) {
  const sheet = useRef<ModalBottomSheetRef>(null);
  // Stays mounted while closing so the sheet can animate out first.
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) return;
    let cancelled = false;
    void sheet.current?.hide().then(() => {
      if (!cancelled) setMounted(false);
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  if (!mounted) return null;

  return (
    <Host style={styles.host} pointerEvents="none">
      <ModalBottomSheet
        ref={sheet}
        onDismissRequest={onClose}
        showDragHandle
        skipPartiallyExpanded
        containerColor={colors.surface}
        contentColor={colors.text}
      >
        <Column modifiers={[padding(spacing.md, 0, spacing.md, spacing.sm)]}>
          <RNHostView matchContents={{ vertical: true }}>
            <View>{children}</View>
          </RNHostView>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute' },
});
