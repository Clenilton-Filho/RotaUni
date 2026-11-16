import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Web-only shell that keeps the whole application in a single,
 * centered, phone-width column with a thin frame — the mobile framing
 * shown in the welcome/onboarding reference. Native builds use the
 * passthrough `app-shell.tsx` (edge-to-edge, no outer frame).
 */
export function AppShell({ children }: PropsWithChildren) {
  return (
    <View style={styles.shell}>
      <View style={styles.column}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    // Fundo externo neutro escuro (a area fora da moldura do dispositivo).
    backgroundColor: '#15171C',
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    // Moldura fina cinza-escura ao redor da viewport mobile.
    borderWidth: 1,
    borderColor: '#3A3F4B',
    backgroundColor: '#F4F7FC',
  },
});
