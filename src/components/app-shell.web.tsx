import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/**
 * Web-only shell that keeps the whole application in a single,
 * centered, phone-width column on large screens.
 */
export function AppShell({ children }: PropsWithChildren) {
  const theme = useTheme();

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <View style={styles.column}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
  },
});
