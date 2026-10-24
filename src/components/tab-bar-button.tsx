import { Pressable, StyleSheet, Text, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type TabBarTopAccentButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: ((event: GestureResponderEvent) => void) | null;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  role?: string;
  'aria-label'?: string;
  'aria-selected'?: boolean;
};

/**
 * Botão textual da barra de abas com um filete laranja sobre a aba ativa
 * (ignora o conteúdo padrão de ícone + rótulo do bottom-tabs).
 */
export function TabBarTopAccentButton(props: TabBarTopAccentButtonProps) {
  const theme = useTheme();
  const selected = props['aria-selected'] ?? false;
  const label = props['aria-label'] ?? '';

  return (
    <View style={[props.style, styles.container]}>
      <View style={[styles.accent, { backgroundColor: selected ? theme.accent : 'transparent' }]} />
      <Pressable
        onPress={props.onPress}
        onLongPress={props.onLongPress ?? undefined}
        testID={props.testID}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        style={styles.pressable}>
        <Text style={[styles.label, { color: selected ? theme.accent : theme.textSecondary }]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 5,
  },
  accent: {
    height: 3,
    width: 40,
    borderRadius: 2,
    alignSelf: 'center',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
