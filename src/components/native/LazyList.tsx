import { Host, LazyColumn, RNHostView } from '@expo/ui/jetpack-compose';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { EndReached } from './EndReached';
import { uniqueKeys } from './uniqueKeys';

export type LazyListProps<T> = {
  data: readonly T[];
  keyExtractor: (item: T, index: number) => string;
  /** One React Native row, hosted in the native list and sized by its own layout. */
  renderItem: (info: { item: T; index: number }) => ReactElement;
  /** Row height until a row is measured; keep it close to the real height so scrolling doesn't jump. */
  estimatedItemSize: number;
  /** React Native content above the rows that scrolls with them. */
  header?: ReactElement;
  /** React Native content after the rows, e.g. a "loading more" row. */
  footer?: ReactElement;
  /** Space after the last row, e.g. for the mini player. */
  bottomInset?: number;
  /** Called when the last row is about to scroll into view (it's within the overscan window). */
  onEndReached?: () => void;
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
  footer,
  bottomInset = 0,
  onEndReached,
}: LazyListProps<T>) {
  const keys = uniqueKeys(data.map((item, index) => keyExtractor(item, index)));

  return (
    <Host style={styles.host} colorScheme="dark">
      <LazyColumn contentPadding={{ bottom: bottomInset }}>
        {header ? <RNHostView matchContents={{ vertical: true }}>{header}</RNHostView> : null}
        <LazyColumn.Items
          data={data}
          keyExtractor={(_, index) => keys[index]}
          estimatedItemSize={estimatedItemSize}
          overscanCount={25}
        >
          {(info) => (
            <RNHostView matchContents={{ vertical: true }}>
              <View>
                {renderItem(info)}
                {onEndReached && info.index === data.length - 1 ? (
                  <EndReached onReached={onEndReached} />
                ) : null}
              </View>
            </RNHostView>
          )}
        </LazyColumn.Items>
        {footer ? <RNHostView matchContents={{ vertical: true }}>{footer}</RNHostView> : null}
      </LazyColumn>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
