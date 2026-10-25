import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Rota usada quando não há navegação para voltar (acesso direto por URL). */
  fallbackHref?: string;
};

export function ScreenHeader({ title, subtitle, onBack, fallbackHref }: ScreenHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  const handlePress = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else if (fallbackHref) {
      router.replace(fallbackHref as unknown as Href);
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
      {onBack || fallbackHref ? (
        <Pressable accessibilityRole="button" onPress={handlePress} hitSlop={8} style={styles.back}>
          <Text style={[styles.backText, { color: theme.onStrongSurface }]}>‹ Voltar</Text>
        </Pressable>
      ) : null}
      <Text style={[styles.title, { color: theme.onStrongSurface }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.onStrongSurfaceMuted }]}>{subtitle}</Text> : null}
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
  backText: { fontSize: 16, lineHeight: 22 },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
});
