import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={8} style={styles.back}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 6,
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
    paddingRight: 8,
  },
  backText: { color: '#FFFFFF', fontSize: 16, lineHeight: 22 },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    flexShrink: 1,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
});
