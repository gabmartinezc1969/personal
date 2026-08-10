// Paleta "Rumbo Dark" — dirección visual extraída de la referencia fintech/
// trading: negro-violeta profundo con resplandor degradado púrpura→azul,
// tarjetas oscuras de borde sutil (sin sombra pesada), CTA en degradado
// violeta-azul, verde menta para valores/estados positivos, tipografía
// geométrica con números tabulares. El tema claro es un hermano coherente
// (mismo acento) para cuando el usuario prefiera fondo claro.

export type Palette = {
  bg: string;
  bgElev: string;
  bgElev2: string;
  border: string;
  borderStrong: string;
  text: string;
  textDim: string;
  textFaint: string;
  brand: string; // acento violeta — iconos activos, focos, texto de marca
  brandDim: string; // superficie sutil de marca (chip seleccionado, etc.)
  brandStrong: string; // violeta más claro para texto sobre superficies oscuras
  gradientFrom: string; // inicio del degradado de CTA (violeta)
  gradientTo: string; // fin del degradado de CTA (azul)
  onBrand: string;
  glowTop: string; // resplandor superior ambiental (solo oscuro; transparente en claro)
  glowBottom: string;
  danger: string;
  dangerDim: string;
  warn: string;
  warnDim: string;
  info: string;
  infoDim: string;
  ok: string; // verde menta — positivo/completado
  okDim: string;
};

export const light: Palette = {
  bg: '#F3F1FB',
  bgElev: '#FFFFFF',
  bgElev2: '#F7F5FC',
  border: '#E6E1F5',
  borderStrong: '#D2C9EE',
  text: '#181425',
  textDim: '#5C5578',
  textFaint: '#948DB0',
  brand: '#6E4CF0',
  brandDim: '#EBE4FE',
  brandStrong: '#5A38D8',
  gradientFrom: '#8B5CF6',
  gradientTo: '#4C6FFF',
  onBrand: '#FFFFFF',
  glowTop: 'transparent',
  glowBottom: 'transparent',
  danger: '#E1483F',
  dangerDim: '#FBE7E5',
  warn: '#C97A00',
  warnDim: '#FBEDD6',
  info: '#2E72E0',
  infoDim: '#E6EFFD',
  ok: '#13A883',
  okDim: '#DFF6EE',
};

export const dark: Palette = {
  bg: '#0A0919',
  bgElev: '#14122A',
  bgElev2: '#1B1836',
  border: '#292450',
  borderStrong: '#3B3568',
  text: '#F6F4FF',
  textDim: '#A9A1CC',
  textFaint: '#726A96',
  brand: '#9A85FF',
  brandDim: '#241F49',
  brandStrong: '#B7A8FF',
  gradientFrom: '#8B5CF6',
  gradientTo: '#4C6FFF',
  onBrand: '#FFFFFF',
  glowTop: 'rgba(139,92,246,0.28)',
  glowBottom: 'rgba(76,111,255,0.22)',
  danger: '#FF6B6B',
  dangerDim: '#3A1E27',
  warn: '#FFB74D',
  warnDim: '#3A2C14',
  info: '#5FA8FF',
  infoDim: '#182A4A',
  ok: '#2DD9A8',
  okDim: '#123328',
};

export const LIST_COLORS = ['#9A85FF', '#5FA8FF', '#FFB74D', '#FF6B6B', '#D57BFF', '#2DD9A8', '#FF9F4A', '#7C7599'];
