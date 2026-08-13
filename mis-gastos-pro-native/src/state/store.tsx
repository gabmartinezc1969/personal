import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { id } from '../utils/id';
import { defaultState } from './seed';
import { AppState, Budget, Category, Currency, FontScale, Transaction } from './types';

const STORAGE_KEY = 'mis-gastos-pro-native-v1';

type Ctx = {
  state: AppState;
  ready: boolean;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (txId: string) => void;
  upsertCategory: (category: Category) => void;
  setCurrency: (currency: Currency) => void;
  setFontScale: (scale: FontScale) => void;
  setGlobalBudget: (amount: number) => void;
  upsertCategoryBudget: (categoryId: string, amount: number) => void;
  deleteBudget: (budgetId: string) => void;
  restoreState: (next: AppState) => void;
  resetState: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

// Clon profundo vía JSON: el estado es puramente serializable (strings,
// números, arrays planos), y structuredClone() no está disponible en Hermes.
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

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setState((prev) => ({ ...prev, transactions: [...prev.transactions, { ...tx, id: id() }] }));
  }, []);

  const deleteTransaction = useCallback((txId: string) => {
    setState((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== txId) }));
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

  const setGlobalBudget = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, globalBudget: amount }));
  }, []);

  const upsertCategoryBudget = useCallback((categoryId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      budgets: [...prev.budgets.filter((b) => b.categoryId !== categoryId), { id: id(), categoryId, amount }],
    }));
  }, []);

  const deleteBudget = useCallback((budgetId: string) => {
    setState((prev) => ({ ...prev, budgets: prev.budgets.filter((b) => b.id !== budgetId) }));
  }, []);

  const restoreState = useCallback((next: AppState) => {
    setState(mergeWithDefaults(next));
  }, []);

  const resetState = useCallback(() => {
    setState(cloneDefaultState());
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      addTransaction,
      deleteTransaction,
      upsertCategory,
      setCurrency,
      setFontScale,
      setGlobalBudget,
      upsertCategoryBudget,
      deleteBudget,
      restoreState,
      resetState,
    }),
    [state, ready, addTransaction, deleteTransaction, upsertCategory, setCurrency, setFontScale, setGlobalBudget, upsertCategoryBudget, deleteBudget, restoreState, resetState]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}

export function categoryById(state: AppState, categoryId: string): Category {
  return state.categories.find((c) => c.id === categoryId) ?? { id: categoryId, name: 'Otros', icon: '⚪', color: '#cccccc', type: 'expense' };
}

export function totals(list: Transaction[]): { expense: number; income: number } {
  return {
    expense: list.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
    income: list.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0),
  };
}

export function transactionsForMonth(state: AppState, monthKey: string): Transaction[] {
  return state.transactions.filter((t) => t.date.startsWith(monthKey));
}
