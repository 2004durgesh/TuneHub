import { Host, LazyVStack, RNHostView, ScrollView } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { EndReached } from './EndReached';
import type { LazyListProps } from './LazyList';
import { uniqueKeys } from './uniqueKeys';

// SwiftUI's LazyVStack spaces children by default; rows here sit flush like a FlatList.
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
  // A recycled row can be laid out before the stack proposes its width, so long titles overflowed
  // instead of truncating. The lists are always full-width, so pin the RN content to the window.
  const { width } = useWindowDimensions();
  const keys = uniqueKeys(data.map((item, index) => keyExtractor(item, index)));

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
            keyExtractor={(_, index) => keys[index]}
            estimatedItemSize={estimatedItemSize}
            overscanCount={25}
          >
            {(info) => (
              <RNHostView matchContents={{ vertical: true }}>
                <View style={{ width }}>
                  {renderItem(info)}
                  {onEndReached && info.index === data.length - 1 ? (
                    <EndReached onReached={onEndReached} />
                  ) : null}
                </View>
              </RNHostView>
            )}
          </LazyVStack.ForEach>
          {footer ? (
            <RNHostView matchContents={{ vertical: true }}>
              <View style={{ width }}>{footer}</View>
            </RNHostView>
          ) : null}
        </LazyVStack>
      </ScrollView>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
