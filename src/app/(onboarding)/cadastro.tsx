import { Link, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppState } from '@/state/app-provider';

export default function CadastroScreen() {
  const router = useRouter();
  const { register } = useAppState();
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    const values = [name, university, campus].map((value) => value.trim());
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
        name: values[0], university: values[1], campus: values[2], createdAt: new Date().toISOString(),
      });
      router.replace('/login' as Href);
    } catch (registrationError) {
      setError(registrationError instanceof Error && registrationError.message === 'EMAIL_ALREADY_EXISTS'
        ? 'Este email já está cadastrado.'
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
            contentContainerStyle={styles.content}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText type="title">Bem-vindo à RotaUni</ThemedText>
            <ThemedText themeColor="textSecondary">
              Crie seu perfil para começar a encontrar caronas universitárias.
            </ThemedText>
          </View>

          <View style={styles.form}>
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

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

            <Pressable style={styles.button} onPress={handleSubmit}>
              <ThemedText style={styles.buttonText}>Continuar</ThemedText>
            </Pressable>
            <Link href={'/login' as Href} asChild>
              <Pressable><ThemedText type="linkPrimary">Já tenho uma conta</ThemedText></Pressable>
            </Link>
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
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        placeholderTextColor="#737373"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  content: { flexGrow: 1, padding: 24, gap: 32 },
  header: { gap: 12 },
  form: { gap: 20 },
  field: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#A0A0A0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  error: { color: '#B42318' },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 15 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});