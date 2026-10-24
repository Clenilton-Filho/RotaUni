import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { TabBarTopAccentButton } from '@/components/tab-bar-button';

export type PersistentTabKey = 'caronas' | 'historico' | 'perfil';

const TABS: { key: PersistentTabKey; label: string; href: string }[] = [
  { key: 'caronas', label: 'Caronas', href: '/' },
  { key: 'historico', label: 'Histórico', href: '/historico' },
  { key: 'perfil', label: 'Perfil', href: '/perfil' },
];

type PersistentTabBarProps = {
  /** Aba de origem destacada na tela atual (no acesso direto por URL, o fallback documentado da tela). */
  activeTab: PersistentTabKey;
  /**
   * Intercepta a troca de aba (ex.: formulário com alterações não salvas).
   * Chame `proceed()` para confirmar a navegação; omiti-lo mantém o usuário na tela.
   */
  onBeforeSwitch?: (proceed: () => void) => void;
};

/**
 * Barra inferior persistente das telas secundárias autenticadas.
 * Apresentacional: ocupa espaço no layout, navega com `replace` (sem novas
 * entradas de histórico) e reutiliza o visual da barra de abas real.
 */
export function PersistentTabBar({ activeTab, onBeforeSwitch }: PersistentTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  function switchTo(href: string) {
    router.replace(href as unknown as Href);
  }

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.backgroundSelected,
          // Os 49 px espelham a altura da barra nativa observada na versão
          // instalada do Expo Router (TABBAR_HEIGHT_UIKIT em BottomTabBar.js,
          // constante interna não pública) + a safe area do Android.
          height: 49 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}>
      {TABS.map((tab) => (
        <TabBarTopAccentButton
          key={tab.key}
          aria-label={tab.label}
          aria-selected={tab.key === activeTab}
          onPress={() => {
            if (onBeforeSwitch) {
              onBeforeSwitch(() => switchTo(tab.href));
              return;
            }
            switchTo(tab.href);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
