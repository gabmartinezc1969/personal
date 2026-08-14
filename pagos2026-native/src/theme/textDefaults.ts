import { Text, TextInput } from 'react-native';

// El diseño se portó 1:1 desde la versión web con tamaños de fuente fijos en
// píxeles. Por defecto, React Native deja que el tamaño de letra del sistema
// (Ajustes > Accesibilidad > Texto más grande, en iOS/Android) escale todos
// los <Text>/<TextInput> — si el usuario tiene esa opción activada, cada
// texto de la app crece y desborda las cajas de tamaño fijo (etiquetas que
// se cortan, montos que se parten en dos líneas, etc.). Se desactiva el
// escalado globalmente para que la app siempre respete el diseño, sin
// importar el ajuste de accesibilidad del teléfono.
type WithDefaultProps<P> = { defaultProps?: Partial<P> };

(Text as unknown as WithDefaultProps<Text['props']>).defaultProps = {
  ...(Text as unknown as WithDefaultProps<Text['props']>).defaultProps,
  allowFontScaling: false,
};

(TextInput as unknown as WithDefaultProps<TextInput['props']>).defaultProps = {
  ...(TextInput as unknown as WithDefaultProps<TextInput['props']>).defaultProps,
  allowFontScaling: false,
};
