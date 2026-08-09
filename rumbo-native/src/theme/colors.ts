// Paleta de Rumbo — misma identidad de marca que la versión web (verde "Rumbo"),
// adaptada a tokens de tema claro/oscuro para React Native.

export type Palette = {
  bg: string;
  bgElev: string;
  bgElev2: string;
  border: string;
  borderStrong: string;
  text: string;
  textDim: string;
  textFaint: string;
  brand: string;
  brandDim: string;
  brandStrong: string;
  onBrand: string;
  danger: string;
  dangerDim: string;
  warn: string;
  warnDim: string;
  info: string;
  infoDim: string;
  ok: string;
  okDim: string;
};

export const light: Palette = {
  bg: '#f4f6f9',
  bgElev: '#ffffff',
  bgElev2: '#fbfbfd',
  border: '#e2e6ea',
  borderStrong: '#cfd6dc',
  text: '#1c2226',
  textDim: '#5b6570',
  textFaint: '#8a95a0',
  brand: '#1f5e4b',
  brandDim: '#e7f1ed',
  brandStrong: '#164a3a',
  onBrand: '#ffffff',
  danger: '#b3261e',
  dangerDim: '#fbe9e7',
  warn: '#a2610a',
  warnDim: '#fdf0dc',
  info: '#2a5fa8',
  infoDim: '#e8f0fb',
  ok: '#1e7d45',
  okDim: '#e5f5ea',
};

export const dark: Palette = {
  bg: '#14181b',
  bgElev: '#1b2124',
  bgElev2: '#20272b',
  border: '#2b3338',
  borderStrong: '#3a4449',
  text: '#e9edf0',
  textDim: '#a9b3ba',
  textFaint: '#79838b',
  brand: '#3fa383',
  brandDim: '#173029',
  brandStrong: '#5cc4a2',
  onBrand: '#08130f',
  danger: '#e5786f',
  dangerDim: '#3a2020',
  warn: '#e0a252',
  warnDim: '#332711',
  info: '#7cabe8',
  infoDim: '#1c2a3a',
  ok: '#6fd196',
  okDim: '#132a1c',
};

export const LIST_COLORS = ['#1f5e4b', '#2a5fa8', '#7a5a00', '#b3261e', '#6b3fa0', '#0f7a7a', '#a2610a', '#4a5568'];
