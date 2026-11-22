import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppState } from '@/state/app-provider';

/**
 * Tela de boas-vindas (onboarding, exibicao unica): emblema + nome do app,
 * proposta de valor e entrada para o login. Marca @rotauni:welcomeSeen e
 * vai para o login; o fluxo raiz decide os proximos acessos.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { currentAccount, currentUser, markWelcomeSeen, dataSource, setDataSource } = useAppState();

  async function handleStart() {
    await markWelcomeSeen();
    router.replace((currentAccount && currentUser ? '/' : '/login') as unknown as Href);
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        {/* Bloco principal centralizado na area util; o botao fica fixo na
            base (rodape), como na referencia visual. */}
        <View style={styles.heroArea}>
          <View style={styles.heroBlock}>
            <View style={styles.emblem}>
              <Ionicons name="car-sport" size={34} color="#FFFFFF" />
            </View>
            <ThemedText type="title" style={styles.title}>
              RotaUni
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Caronas entre colegas do campus, de forma simples e transparente.
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <AppButton title="Começar" disabled={false} onPress={() => void handleStart()} />
          <Pressable accessibilityRole="button" onPress={() => void setDataSource(dataSource === 'http' ? 'mock' : 'http')} style={styles.sourceToggle}>
            <ThemedText style={styles.sourceLabel}>{dataSource === 'http' ? 'Modo: API (HTTP)' : 'Modo: Offline (Mock)'}</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B3C8B',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heroArea: {
    flex: 1,
    justifyContent: 'center',
  },
  heroBlock: {
    gap: 16,
  },
  emblem: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    // Respiro inferior do botao ancorado no rodape.
    paddingTop: 16,
    alignItems: 'center',
  },
  sourceToggle: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  sourceLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 12 },
});
