import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { AppText as Text } from '../components/AppText';

type Ctx = { toast: (message: string) => void };

const ToastContext = createContext<Ctx | null>(null);

// Mensaje flotante no bloqueante, equivalente al #toast de la versión web.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback(
    (msg: string) => {
      setMessage(msg);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }, 1700);
    },
    [opacity]
  );

  const value = useMemo<Ctx>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast(): (message: string) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx.toast;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: 110,
    backgroundColor: '#111',
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  text: { color: '#fff', fontWeight: '700' },
});
