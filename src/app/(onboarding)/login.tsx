import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppState } from '@/state/app-provider';

export default function LoginScreen() {
  const { login } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Preencha email e senha.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Informe um email válido.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const authenticated = await login(normalizedEmail, password);
    setIsSubmitting(false);
    if (!authenticated) setError('Email ou senha inválidos.');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
          <ScrollView contentContainerStyle={styles.contentWrapper} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            <ScreenHeader title="Entrar" />
            <View style={styles.content}>
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
              <Field label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry />
              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
              <AppButton title={isSubmitting ? 'Entrando...' : 'Entrar'} onPress={handleLogin} disabled={isSubmitting} />
              <View style={styles.signupRow}>
                <Text style={styles.signupLine}>Ainda não tem conta?</Text>
                <Link href="/cadastro" asChild>
                  <Pressable accessibilityRole="link" hitSlop={8}>
                    <Text style={styles.signupLink}> Criar conta</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

type FieldProps = { label: string; value: string; placeholder: string; onChangeText: (value: string) => void; secureTextEntry?: boolean; keyboardType?: 'email-address' };
function Field({ label, value, placeholder, onChangeText, secureTextEntry, keyboardType }: FieldProps) {
  return <View style={styles.field}>
    <ThemedText themeColor="textSecondary">{label}</ThemedText>
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize="none" placeholderTextColor="#9AA3B2" style={styles.input} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  contentWrapper: { flexGrow: 1, gap: 24 },
  content: { flex: 1, padding: 20, gap: 18 },
  field: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E8EE',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 21,
    color: '#233049',
    backgroundColor: '#FFFFFF',
  },
  error: { color: '#B42318' },
  signupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  signupLine: { color: '#6E7A8A', fontSize: 15, lineHeight: 21 },
  signupLink: { color: '#C2410C', fontWeight: '700', fontSize: 15, lineHeight: 21 },
});
