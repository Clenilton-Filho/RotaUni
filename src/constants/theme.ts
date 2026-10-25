/**
 * Below are the colors used by the app. RotaUni intentionally uses the light theme only.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#233049',
    background: '#F4F7FC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DCE7F9',
    textSecondary: '#6E7A8A',
    primary: '#0B3C8B',
    accent: '#C2410C',
    accentStrong: '#95371F',
    accentSoft: '#FEEDDB',
    positive: '#18794E',
    positiveSoft: '#DEF3E7',
    destructive: '#B42318',
    placeholder: '#9AA3B2',
    borderInput: '#E5E8EE',
    ratingInactive: '#C7CEDB',
    onStrongSurface: '#FFFFFF',
    onStrongSurfaceMuted: 'rgba(255, 255, 255, 0.85)',
    link: '#3C87F7',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
