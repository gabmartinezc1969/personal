import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { StoreProvider } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <StoreProvider>
      <RootLayoutNav />
    </StoreProvider>
  );
}

function RootLayoutNav() {
  const { colors, scheme } = useTheme();

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.brand,
      background: colors.bg,
      card: colors.bgElev,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="list/[id]" options={{ title: 'Lista' }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Tarea' }} />
        <Stack.Screen name="spaces" options={{ title: 'Espacios' }} />
        <Stack.Screen name="space/[id]" options={{ title: 'Espacio' }} />
        <Stack.Screen name="board/[id]" options={{ title: 'Tablero' }} />
        <Stack.Screen name="board-task/[id]" options={{ title: 'Tarjeta' }} />
        <Stack.Screen name="search" options={{ title: 'Buscar', presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notificaciones', presentation: 'modal' }} />
        <Stack.Screen name="reports" options={{ title: 'Informes' }} />
        <Stack.Screen name="trash" options={{ title: 'Papelera' }} />
        <Stack.Screen name="settings" options={{ title: 'Ajustes' }} />
        <Stack.Screen name="about" options={{ title: 'Arquitectura', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
