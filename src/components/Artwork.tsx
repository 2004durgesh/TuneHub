import { Image } from 'expo-image';
import type { ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';
import { colors, radii } from '@/theme';

type Props = {
  uri: string;
  size: number;
  borderRadius?: number;
  style?: StyleProp<ImageStyle>;
};

export function Artwork({ uri, size, borderRadius = radii.artwork, style }: Props) {
  return (
    <Image
      source={{ uri }}
      style={[
        { width: size, height: size, borderRadius, backgroundColor: colors.surfaceElevated },
        style,
      ]}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
    />
  );
}
