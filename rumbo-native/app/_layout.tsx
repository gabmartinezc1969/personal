import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { StoreProvider } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { FONTS } from '@/src/theme/fonts';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

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
          headerTitleStyle: { fontFamily: FONTS.extra, fontSize: 18 },
          headerShadowVisible: false,
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
