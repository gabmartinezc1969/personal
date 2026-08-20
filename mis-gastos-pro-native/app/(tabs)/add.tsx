import { Redirect } from 'expo-router';

// El tab "add" nunca se navega de verdad: `tabBarButton` en `_layout.tsx`
// intercepta el toque y abre el sheet de "Agregar movimiento" en su lugar.
// Esta pantalla sólo existe para que la ruta del tab sea válida; si alguna
// vez se llega a ella (deep link, etc.) simplemente redirige a Registros.
export default function AddRedirect() {
  return <Redirect href="/" />;
}
