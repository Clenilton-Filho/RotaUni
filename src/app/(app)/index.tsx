import { SafeAreaView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppState } from '@/state/app-provider';

export default function HomeScreen() {
  const { currentUser } = useAppState();

  if (!currentUser) return null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Olá, {currentUser.name}</ThemedText>
          <ThemedText themeColor="textSecondary">
            Este é o início da sua experiência na RotaUni.
          </ThemedText>

          <View style={styles.profile}>
            <ThemedText type="smallBold">Seu perfil</ThemedText>
            <ThemedText>Faculdade: {currentUser.university}</ThemedText>
            <ThemedText>Campus: {currentUser.campus}</ThemedText>
          </View>

          <ThemedText themeColor="textSecondary">
            As caronas serão implementadas na próxima etapa.
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, padding: 24, gap: 16 },
  profile: { gap: 8, padding: 20, borderRadius: 8, backgroundColor: '#F0F0F3' },
});