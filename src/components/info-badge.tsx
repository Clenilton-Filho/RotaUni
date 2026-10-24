import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type InfoBadgeProps = {
  label: string;
  tone?: 'success' | 'accent' | 'neutral';
};

const toneThemeKey = {
  success: { bgKey: 'positiveSoft' as const, textKey: 'positive' as const },
  accent: { bgKey: 'accentSoft' as const, textKey: 'accentStrong' as const },
  neutral: { bgKey: 'backgroundSelected' as const, textKey: 'textSecondary' as const },
} as const;

export function InfoBadge({ label, tone = 'neutral' }: InfoBadgeProps) {
  const theme = useTheme();
  const { bgKey, textKey } = toneThemeKey[tone];

  return (
    <View style={[styles.badge, { backgroundColor: theme[bgKey] }]}>
      <Text style={[styles.label, { color: theme[textKey] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
