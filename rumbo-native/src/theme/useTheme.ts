import { useColorScheme } from 'react-native';
import { light, dark, Palette } from './colors';
import { useStore } from '../state/store';

export type ThemeMode = 'auto' | 'light' | 'dark';

export function useTheme(): { colors: Palette; scheme: 'light' | 'dark' } {
  const system = useColorScheme();
  const { state } = useStore();
  const mode = state.settings.theme;
  const scheme: 'light' | 'dark' = mode === 'auto' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return { colors: scheme === 'dark' ? dark : light, scheme };
}
