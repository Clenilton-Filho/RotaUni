import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/state/app-provider';
import { useTheme } from '@/hooks/use-theme';
import { confirmAlert } from '@/utils/confirm-alert';

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentAccount, currentUser, updateUser } = useAppState();
  const theme = useTheme();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [university, setUniversity] = useState(currentUser?.university ?? '');
  const [campus, setCampus] = useState(currentUser?.campus ?? '');
  const [course, setCourse] = useState(currentUser?.course ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const isDirty =
    name !== currentUser.name || university !== currentUser.university || campus !== currentUser.campus || course !== (currentUser.course ?? '');

  function leave() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil' as Href);
    }
  }

  function confirmDiscardChanges() {
    confirmAlert('Descartar alterações?', 'As mudanças no perfil não serão salvas.', [
      { text: 'Continuar editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: leave },
    ]);
  }

  function handleLeave() {
    if (!isDirty) {
      leave();
      return;
    }
    confirmDiscardChanges();
  }

  async function handleSave() {
    if (!currentUser) return;

    const values = [name, university, campus, course].map((value) => value.trim());

    if (values.some((value) => value.length === 0)) {
      setError('Preencha todos os campos.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await updateUser({
        ...currentUser,
        name: values[0],
        university: values[1],
        campus: values[2],
        course: values[3],
      });
    } catch (saveError) {
      // Falha na persistencia (ex.: 409 com reserva ativa): mantem o usuario
      // na tela com o erro visivel, sem fechar a edicao.
      setError(
        saveError instanceof Error && saveError.message
          ? saveError.message
          : 'Não foi possível salvar o perfil.',
      );
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    leave();
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
            <ScreenHeader title="Editar perfil" onBack={handleLeave} />
            <View style={styles.content}>
              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
                <View style={styles.row}>
                  <ThemedText type="smallBold">Email</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {currentAccount?.email ?? '—'}
                  </ThemedText>
                </View>
              </ThemedView>

              <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
              <Field
                label="Faculdade"
                value={university}
                onChangeText={setUniversity}
                placeholder="Nome da faculdade"
              />
              <Field label="Campus" value={campus} onChangeText={setCampus} placeholder="Seu campus" />
              <Field label="Curso" value={course} onChangeText={setCourse} placeholder="Seu curso" />

              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

              <AppButton
                title={isSaving ? 'Salvando...' : 'Salvar alterações'}
                disabled={isSaving}
                onPress={handleSave}
              />
              <AppButton title="Cancelar" variant="outline" disabled={isSaving} onPress={handleLeave} />
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
};

function Field({ label, value, placeholder, onChangeText }: FieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
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
  content: { padding: 20, gap: 18, paddingBottom: 32 },
  card: { gap: 8, padding: 16, borderRadius: 16, borderWidth: 1 },
  row: { gap: 4 },
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
});
