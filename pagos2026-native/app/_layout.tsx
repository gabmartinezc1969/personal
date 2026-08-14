import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { MovementEditorModal } from '@/src/components/MovementEditorModal';
import { StoreProvider } from '@/src/state/store';
import { ToastProvider } from '@/src/state/toast';
import { UIProvider } from '@/src/state/ui';
import { colors } from '@/src/theme/colors';
import '@/src/theme/textDefaults';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brand,
    background: colors.bg,
    card: colors.card,
    text: colors.ink,
    border: colors.line,
    notification: colors.danger,
  },
};

export default function RootLayout() {
  return (
    <StoreProvider>
      <ToastProvider>
        <UIProvider>
          <ThemeProvider value={navTheme}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerTintColor: colors.ink,
                headerStyle: { backgroundColor: colors.card },
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: '800' },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="creditos" options={{ title: 'Créditos y deudas' }} />
              <Stack.Screen name="inversiones" options={{ title: 'Inversiones' }} />
              <Stack.Screen name="configuracion" options={{ title: 'Configuración' }} />
              <Stack.Screen name="proximamente" options={{ title: '', presentation: 'card' }} />
            </Stack>
            <MovementEditorModal />
          </ThemeProvider>
        </UIProvider>
      </ToastProvider>
    </StoreProvider>
  );
}
