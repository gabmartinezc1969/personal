import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { MovementType } from './types';

type Ctx = {
  editorOpen: boolean;
  editorType: MovementType;
  openEditor: (type?: MovementType) => void;
  closeEditor: () => void;
};

const UIContext = createContext<Ctx | null>(null);

// Controla el sheet global "Agregar movimiento" para que se pueda abrir
// desde el header, el FAB central de la barra inferior o el dashboard.
export function UIProvider({ children }: { children: React.ReactNode }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<MovementType>('E');

  const openEditor = useCallback((type: MovementType = 'E') => {
    setEditorType(type);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => setEditorOpen(false), []);

  const value = useMemo<Ctx>(() => ({ editorOpen, editorType, openEditor, closeEditor }), [editorOpen, editorType, openEditor, closeEditor]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): Ctx {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>');
  return ctx;
}
