import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '@/src/theme/useTheme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={{ color: colors.brand, fontWeight: '600' }}>Ir a Mi Día</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  link: { marginTop: 15, paddingVertical: 15 },
});
