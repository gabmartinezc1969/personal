import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { TxType } from './types';

type Ctx = {
  txEditorOpen: boolean;
  txEditorType: TxType;
  openTxEditor: (type?: TxType) => void;
  closeTxEditor: () => void;
};

const UIContext = createContext<Ctx | null>(null);

// Controla el sheet global "Agregar movimiento" para que se pueda abrir tanto
// desde el header, el FAB central de la barra inferior o el resumen mensual.
export function UIProvider({ children }: { children: React.ReactNode }) {
  const [txEditorOpen, setTxEditorOpen] = useState(false);
  const [txEditorType, setTxEditorType] = useState<TxType>('expense');

  const openTxEditor = useCallback((type: TxType = 'expense') => {
    setTxEditorType(type);
    setTxEditorOpen(true);
  }, []);

  const closeTxEditor = useCallback(() => setTxEditorOpen(false), []);

  const value = useMemo<Ctx>(() => ({ txEditorOpen, txEditorType, openTxEditor, closeTxEditor }), [txEditorOpen, txEditorType, openTxEditor, closeTxEditor]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): Ctx {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>');
  return ctx;
}
