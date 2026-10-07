import { Platform, TextStyle } from 'react-native';

const systemFont = Platform.select({
  ios: 'system-ui',
  default: undefined, // RN default (Roboto on Android)
});

type Variant =
  'screenTitle' | 'lyric' | 'sectionHeader' | 'body' | 'bodyStrong' | 'metadata' | 'caption';

export const typography: Record<Variant, TextStyle> = {
  screenTitle: { fontFamily: systemFont, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  lyric: {
    fontFamily: systemFont,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 31,
  },
  sectionHeader: { fontFamily: systemFont, fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  body: { fontFamily: systemFont, fontSize: 16, fontWeight: '400' },
  bodyStrong: { fontFamily: systemFont, fontSize: 16, fontWeight: '600' },
  metadata: { fontFamily: systemFont, fontSize: 14, fontWeight: '400' },
  caption: { fontFamily: systemFont, fontSize: 12, fontWeight: '400' },
};
