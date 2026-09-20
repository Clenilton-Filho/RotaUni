import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppState } from '@/state/app-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout, resetLocalData } = useAppState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!currentUser) return null;

  function confirmLogout() {
    Alert.alert('Sair da conta', 'O usuário e a reserva atual serão removidos deste aparelho.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          await logout();
          router.replace('/cadastro');
        },
      },
    ]);
  }

  function confirmResetLocalData() {
    Alert.alert(
      'Resetar dados locais',
      'Isso removerá usuário, reserva, histórico e avaliações deste protótipo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            await resetLocalData();
            router.replace('/cadastro');
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="linkPrimary">‹ Voltar</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Perfil</ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.row}>
              <ThemedText type="smallBold">Nome</ThemedText>
              <ThemedText>{currentUser.name}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText type="smallBold">Faculdade</ThemedText>
              <ThemedText>{currentUser.university}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText type="smallBold">Campus</ThemedText>
              <ThemedText>{currentUser.campus}</ThemedText>
            </View>
          </ThemedView>
          <Pressable disabled={isLoggingOut} onPress={confirmLogout} style={styles.logoutButton}>
            <ThemedText style={styles.logoutText}>{isLoggingOut ? 'Saindo...' : 'Sair da conta'}</ThemedText>
          </Pressable>
          <ThemedView type="backgroundElement" style={styles.developmentSection}>
            <ThemedText style={styles.developmentTitle}>Desenvolvimento</ThemedText>
            <ThemedText themeColor="textSecondary">
              Ferramentas para limpar o estado local durante os testes.
            </ThemedText>
            <Pressable
              disabled={isResetting}
              onPress={confirmResetLocalData}
              style={styles.resetButton}>
              <ThemedText style={styles.resetText}>
                {isResetting ? 'Resetando...' : 'Resetar dados locais'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: 20, gap: 18 },
  card: { gap: 14, padding: 18, borderRadius: 10 },
  row: { gap: 4 },
  logoutButton: { alignItems: 'center', padding: 14 },
  logoutText: { color: '#B42318', fontWeight: '700' },
  developmentSection: { gap: 10, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#B42318' },
  developmentTitle: { color: '#B42318', fontWeight: '700' },
  resetButton: { alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#B42318' },
  resetText: { color: '#FFFFFF', fontWeight: '700' },
});