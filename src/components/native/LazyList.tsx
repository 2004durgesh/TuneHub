import { Host, LazyColumn, RNHostView } from '@expo/ui/jetpack-compose';
import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';

export type LazyListProps<T> = {
  data: readonly T[];
  keyExtractor: (item: T, index: number) => string;
  /** One React Native row, hosted in the native list and sized by its own layout. */
  renderItem: (info: { item: T; index: number }) => ReactElement;
  /** Row height until a row is measured; keep it close to the real height so scrolling doesn't jump. */
  estimatedItemSize: number;
  /** React Native content above the rows that scrolls with them. */
  header?: ReactElement;
  /** Space after the last row, e.g. for the mini player. */
  bottomInset?: number;
};

/**
 * A native recycling list (Compose `LazyColumn`, SwiftUI `LazyVStack`) with React Native rows: only
 * rows near the viewport are mounted, and each is hosted in an `RNHostView` so it keeps RN touches.
 */
export function LazyList<T>({
  data,
  keyExtractor,
  renderItem,
  estimatedItemSize,
  header,
  bottomInset = 0,
}: LazyListProps<T>) {
  return (
    <Host style={styles.host} colorScheme="dark">
      <LazyColumn contentPadding={{ bottom: bottomInset }}>
        {header ? <RNHostView matchContents={{ vertical: true }}>{header}</RNHostView> : null}
        <LazyColumn.Items
          data={data}
          keyExtractor={keyExtractor}
          estimatedItemSize={estimatedItemSize}
          overscanCount={25}
        >
          {(info) => <RNHostView matchContents={{ vertical: true }}>{renderItem(info)}</RNHostView>}
        </LazyColumn.Items>
      </LazyColumn>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
