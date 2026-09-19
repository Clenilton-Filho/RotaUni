import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { UserProfile } from '@/domain/user/user.types';
import { useAppState } from '@/state/app-provider';

export default function CadastroScreen() {
  const { saveUser } = useAppState();
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    const values = [name, university, campus].map((value) => value.trim());

    if (values.some((value) => value.length === 0)) {
      setError('Preencha nome, faculdade e campus.');
      return;
    }

    const user: UserProfile = {
      id: `${Date.now()}`,
      name: values[0],
      university: values[1],
      campus: values[2],
      createdAt: new Date().toISOString(),
    };

    await saveUser(user);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText type="title">Bem-vindo à RotaUni</ThemedText>
            <ThemedText themeColor="textSecondary">
              Crie seu perfil para começar a encontrar caronas universitárias.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

function Field({ label, value, placeholder, onChangeText }: FieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#737373"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 32 },
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