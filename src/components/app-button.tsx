import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
};

export function AppButton({ title, onPress, disabled = false, variant = 'primary' }: AppButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary'
          ? { backgroundColor: theme.accent }
          : { backgroundColor: theme.backgroundElement, borderWidth: 1.5, borderColor: theme.backgroundSelected },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Text
        style={[
          styles.text,
          variant === 'primary' ? { color: '#FFFFFF' } : { color: theme.primary },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
});
