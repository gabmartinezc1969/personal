import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { id } from '../utils/id';
import { defaultState } from './seed';
import { AppState, Category, Currency, FontScale, Movement } from './types';

const STORAGE_KEY = 'pagos2026-native-v1';

type Ctx = {
  state: AppState;
  ready: boolean;
  addMovement: (m: Omit<Movement, 'id'>) => void;
  deleteMovement: (movementId: string) => void;
  upsertCategory: (category: Category) => void;
  setCurrency: (currency: Currency) => void;
  setFontScale: (scale: FontScale) => void;
  restoreState: (next: AppState) => void;
  resetState: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

// Clon profundo vía JSON: el estado es puramente serializable, y
// structuredClone() no está disponible en Hermes.
function cloneDefaultState(): AppState {
  return JSON.parse(JSON.stringify(defaultState));
}

function mergeWithDefaults(raw: unknown): AppState {
  const parsed = (raw && typeof raw === 'object' ? raw : {}) as Partial<AppState>;
  return {
    ...cloneDefaultState(),
    ...parsed,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(mergeWithDefaults(JSON.parse(raw)));
      } catch {
        // datos corruptos o inaccesibles: seguimos con el estado por defecto
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const addMovement = useCallback((m: Omit<Movement, 'id'>) => {
    setState((prev) => ({ ...prev, movements: [...prev.movements, { ...m, id: id() }] }));
  }, []);

  const deleteMovement = useCallback((movementId: string) => {
    setState((prev) => ({ ...prev, movements: prev.movements.filter((m) => m.id !== movementId) }));
  }, []);

  const upsertCategory = useCallback((category: Category) => {
    setState((prev) => {
      const exists = prev.categories.some((c) => c.id === category.id);
      return {
        ...prev,
        categories: exists ? prev.categories.map((c) => (c.id === category.id ? category : c)) : [...prev.categories, category],
      };
    });
  }, []);

  const setCurrency = useCallback((currency: Currency) => {
    setState((prev) => ({ ...prev, currency }));
  }, []);

  const setFontScale = useCallback((scale: FontScale) => {
    setState((prev) => ({ ...prev, fontScale: scale }));
  }, []);

  const restoreState = useCallback((next: AppState) => {
    setState(mergeWithDefaults(next));
  }, []);

  const resetState = useCallback(() => {
    setState(cloneDefaultState());
  }, []);

  const value = useMemo<Ctx>(
    () => ({ state, ready, addMovement, deleteMovement, upsertCategory, setCurrency, setFontScale, restoreState, resetState }),
    [state, ready, addMovement, deleteMovement, upsertCategory, setCurrency, setFontScale, restoreState, resetState]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}

export function categoryByName(state: AppState, name: string): Category {
  return state.categories.find((c) => c.id === name) ?? { id: name, name, icon: '⚪', color: '#cccccc', type: 'E' };
}

export function movementAmount(m: Movement): number {
  return m.actual ?? m.budgeted ?? 0;
}

export function totals(list: Movement[]): { income: number; expense: number } {
  return {
    income: list.filter((m) => m.type === 'I').reduce((a, m) => a + movementAmount(m), 0),
    expense: list.filter((m) => m.type === 'E').reduce((a, m) => a + movementAmount(m), 0),
  };
}

export function movementsForMonth(state: AppState, monthKey: string): Movement[] {
  return state.movements.filter((m) => m.date.startsWith(monthKey));
}

export function movementsForYear(state: AppState, year: string): Movement[] {
  return state.movements.filter((m) => m.date.startsWith(year + '-'));
}
