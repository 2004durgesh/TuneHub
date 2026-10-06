import { Host, Slider } from '@expo/ui/swift-ui';
import { tint } from '@expo/ui/swift-ui/modifiers';
import { useRef, useState } from 'react';

import { colors } from '@/theme';
import type { SeekSliderProps } from './SeekSlider';

/**
 * SwiftUI Slider: `onEditingChanged(false)` marks the release. SwiftUI applies every `value` prop,
 * so while dragging it gets the drag value — position reports would yank the thumb back.
 */
export function SeekSlider({ value, max, onSeek, onScrub, style }: SeekSliderProps) {
  const [drag, setDrag] = useState<number | null>(null);
  // The release can fire before React re-renders with the last drag value.
  const latest = useRef<number | null>(null);

  return (
    <Host matchContents={{ vertical: true }} style={style} colorScheme="dark">
      <Slider
        value={drag ?? value}
        min={0}
        max={Math.max(max, 1)}
        onValueChange={(seconds) => {
          latest.current = seconds;
          setDrag(seconds);
          onScrub?.(seconds);
        }}
        onEditingChanged={(editing) => {
          if (editing) return;
          const seconds = latest.current;
          latest.current = null;
          setDrag(null);
          onScrub?.(null);
          if (seconds !== null) onSeek(seconds);
        }}
        modifiers={[tint(colors.accent as string)]}
      />
    </Host>
  );
}
