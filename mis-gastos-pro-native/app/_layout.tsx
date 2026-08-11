import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TransactionEditorModal } from '@/src/components/TransactionEditorModal';
import { StoreProvider } from '@/src/state/store';
import { ToastProvider } from '@/src/state/toast';
import { UIProvider } from '@/src/state/ui';
import { colors } from '@/src/theme/colors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.yellow2,
    background: colors.bg,
    card: colors.yellow,
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
                headerStyle: { backgroundColor: colors.yellow },
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: '800' },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="categories" options={{ title: 'Plantilla de categorías', presentation: 'modal' }} />
            </Stack>
            <TransactionEditorModal />
          </ThemeProvider>
        </UIProvider>
      </ToastProvider>
    </StoreProvider>
  );
}
