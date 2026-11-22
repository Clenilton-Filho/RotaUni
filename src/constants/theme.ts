/**
 * Below are the colors used by the app. RotaUni intentionally uses the light theme only.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#16213E',
    background: '#F5F7FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8EFFF',
    textSecondary: '#5B6785',
    primary: '#1E4FD8',
    accent: '#FF7A1A',
    accentStrong: '#E0600A',
    accentSoft: '#FFF1E6',
    positive: '#1F9D55',
    positiveSoft: '#E6F6EC',
    destructive: '#D64545',
    placeholder: '#9AA3B2',
    borderInput: '#E1E6F0',
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
