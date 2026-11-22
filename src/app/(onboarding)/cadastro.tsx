import { Link, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/state/app-provider';

export default function CadastroScreen() {
  const router = useRouter();
  const { register } = useAppState();
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState('');
  const [course, setCourse] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  function fillTestData() {
    const suffix = Date.now();
    setName('Rafael Albuquerque');
    setUniversity('Estácio');
    setCampus('Parangaba');
    setCourse('Engenharia de Software');
    setEmail(`passageiro.teste.${suffix}@rotauni.com.br`);
    setPassword('teste1234');
    setPasswordConfirmation('teste1234');
    setError('');
  }

  async function handleSubmit() {
    const values = [name, university, campus, course].map((value) => value.trim());
    const normalizedEmail = email.trim().toLowerCase();

    if (values.some((value) => value.length === 0) || !normalizedEmail || !password || !passwordConfirmation) {
      setError('Preencha todos os campos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setError('Informe um email válido.');
    if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.');
    if (password !== passwordConfirmation) return setError('As senhas não conferem.');

    try {
      await register({ email: normalizedEmail, password }, {
        name: values[0], university: values[1], campus: values[2], course: values[3], createdAt: new Date().toISOString(),
      });
      router.replace('/' as Href);
    } catch (registrationError) {
      setError(registrationError instanceof Error
        ? (registrationError.message === 'EMAIL_ALREADY_EXISTS' ? 'Este email já está cadastrado.' : registrationError.message)
        : 'Não foi possível criar a conta.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          <ScrollView
            contentContainerStyle={styles.contentWrapper}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled">
            <ScreenHeader title="Criar conta" />
            <View style={styles.content}>
              {process.env.EXPO_PUBLIC_ENABLE_TEST_DATA !== 'false' ? (
                <AppButton title="Preencher com dados de teste" variant="outline" onPress={fillTestData} />
              ) : null}
              <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
              <Field label="Senha" value={password} onChangeText={setPassword} placeholder="Mínimo de 8 caracteres" secureTextEntry />
              <Field label="Confirmar senha" value={passwordConfirmation} onChangeText={setPasswordConfirmation} placeholder="Repita sua senha" secureTextEntry />
              <Field
                label="Faculdade"
                value={university}
                onChangeText={setUniversity}
                placeholder="Nome da faculdade"
              />
              <Field
                label="Campus"
                value={campus}
                onChangeText={setCampus}
                placeholder="Seu campus"
              />
              <Field label="Curso" value={course} onChangeText={setCourse} placeholder="Seu curso" />

              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

              <AppButton title="Continuar" onPress={handleSubmit} />
              <View style={styles.signupRow}>
                <Text style={styles.signupLine}>Já tem uma conta?</Text>
                <Link href={'/login' as Href} asChild>
                  <Pressable accessibilityRole="link" hitSlop={8}>
                    <Text style={styles.signupLink}>Entrar</Text>
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

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address';
};

function Field({ label, value, placeholder, onChangeText, secureTextEntry, keyboardType }: FieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        placeholderTextColor={Colors.light.placeholder}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  contentWrapper: { flexGrow: 1, gap: 24 },
  content: { flex: 1, padding: 20, gap: 18 },
  field: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.borderInput,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 21,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundElement,
  },
  error: { color: Colors.light.destructive },
  signupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 8, gap: 5},
  signupLine: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 21 },
  signupLink: { color: Colors.light.primary, fontWeight: '700', fontSize: 15, lineHeight: 21 },
});
