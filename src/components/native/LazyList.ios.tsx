import { Host, LazyVStack, RNHostView, ScrollView } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { LazyListProps } from './LazyList';

// SwiftUI's LazyVStack spaces children by default; rows here sit flush like a FlatList.
export function LazyList<T>({
  data,
  keyExtractor,
  renderItem,
  estimatedItemSize,
  header,
  bottomInset = 0,
}: LazyListProps<T>) {
  // A recycled row can be laid out before the stack proposes its width, so long titles overflowed
  // instead of truncating. The lists are always full-width, so pin the RN content to the window.
  const { width } = useWindowDimensions();

  return (
    <Host style={styles.host} colorScheme="dark">
      <ScrollView showsIndicators={false}>
        <LazyVStack spacing={0} modifiers={[padding({ bottom: bottomInset })]}>
          {header ? (
            <RNHostView matchContents={{ vertical: true }}>
              <View style={{ width }}>{header}</View>
            </RNHostView>
          ) : null}
          <LazyVStack.ForEach
            data={data}
            keyExtractor={keyExtractor}
            estimatedItemSize={estimatedItemSize}
            overscanCount={25}
          >
            {(info) => (
              <RNHostView matchContents={{ vertical: true }}>
                <View style={{ width }}>{renderItem(info)}</View>
              </RNHostView>
            )}
          </LazyVStack.ForEach>
        </LazyVStack>
      </ScrollView>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
