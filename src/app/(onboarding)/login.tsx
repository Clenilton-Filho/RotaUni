import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <ThemedText type="title">Entrar na RotaUni</ThemedText>
              <ThemedText themeColor="textSecondary">Acesse seu perfil e suas caronas.</ThemedText>
            </View>
            <View style={styles.form}>
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
              <Field label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry />
              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
              <Pressable disabled={isSubmitting} onPress={handleLogin} style={styles.button}>
                <ThemedText style={styles.buttonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</ThemedText>
              </Pressable>
              <Link href="/cadastro" asChild>
                <Pressable><ThemedText type="linkPrimary">Criar uma conta</ThemedText></Pressable>
              </Link>
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
    <ThemedText type="smallBold">{label}</ThemedText>
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize="none" placeholderTextColor="#737373" style={styles.input} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 }, safeArea: { flex: 1 }, keyboard: { flex: 1 },
  content: { flexGrow: 1, padding: 24, gap: 32 }, header: { gap: 12 }, form: { gap: 20 }, field: { gap: 8 },
  input: { borderWidth: 1, borderColor: '#A0A0A0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: '#000000', backgroundColor: '#FFFFFF' },
  error: { color: '#B42318' }, button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 15 }, buttonText: { color: '#FFFFFF', fontWeight: '700' },
});