import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';

type Props = {
  imageUrl: string;
  title: string;
  subtitle?: string;
  width: number;
  onPress: () => void;
};

export default function ArtworkCard({ imageUrl, title, subtitle, width, onPress }: Props) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: colors.surfaceHigh }} style={{ width }}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width, height: width }]}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle != null ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: radii.artwork,
    backgroundColor: colors.surfaceElevated,
  },
  textContainer: {
    marginTop: spacing.xs,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
