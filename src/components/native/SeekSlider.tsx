import { Host, Slider } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type SeekSliderProps = {
  /** Playback position, in seconds. */
  value: number;
  /** Track length, in seconds. */
  max: number;
  /** Fires once, when the user lets go of the thumb. */
  onSeek: (seconds: number) => void;
  /** The thumb position while dragging, then `null` on release — for showing the scrub time. */
  onScrub?: (seconds: number | null) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * The player's seek bar: seeks once on release instead of on every drag tick — universal Slider
 * hides the release event. This file is Android (Material 3 Slider); iOS is `SeekSlider.ios.tsx`.
 *
 * Compose keeps the thumb under the finger while dragging and ignores `value` until it changes
 * again, so only the last drag value needs tracking (`onValueChangeFinished` carries none).
 */
export function SeekSlider({ value, max, onSeek, onScrub, style }: SeekSliderProps) {
  const target = useRef<number | null>(null);
  return (
    <Host matchContents={{ vertical: true }} style={style} colorScheme="dark">
      <Slider
        value={value}
        min={0}
        max={Math.max(max, 1)}
        onValueChange={(seconds) => {
          target.current = seconds;
          onScrub?.(seconds);
        }}
        onValueChangeFinished={() => {
          const seconds = target.current;
          target.current = null;
          onScrub?.(null);
          if (seconds !== null) onSeek(seconds);
        }}
        modifiers={[fillMaxWidth()]}
      />
    </Host>
  );
}
