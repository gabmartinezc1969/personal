// Paleta "Rumbo Play" — dirección visual gamificada extraída de la referencia:
// verde lima vibrante como héroe, verde bosque profundo para tarjetas destacadas,
// fondos menta claros y acentos cálidos (ámbar/naranja) para racha y XP.

export type Palette = {
  bg: string;
  bgElev: string;
  bgElev2: string;
  border: string;
  borderStrong: string;
  text: string;
  textDim: string;
  textFaint: string;
  brand: string;      // verde lima vibrante (botones, activos)
  brandEdge: string;  // borde inferior 3D de los botones
  brandDim: string;   // fondo suave de marca
  brandStrong: string;
  onBrand: string;
  hero: string;       // verde bosque profundo (tarjetas destacadas)
  heroText: string;
  heroTextDim: string;
  accent: string;     // ámbar cálido (racha, XP)
  accentDim: string;
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
  bg: '#F1F8E8',
  bgElev: '#FFFFFF',
  bgElev2: '#F7FBEF',
  border: '#E3EDD6',
  borderStrong: '#CBDDB4',
  text: '#243B1C',
  textDim: '#5A7050',
  textFaint: '#8FA284',
  brand: '#58CC02',
  brandEdge: '#43A106',
  brandDim: '#E4F6D2',
  brandStrong: '#2E7D0F',
  onBrand: '#FFFFFF',
  hero: '#123B1F',
  heroText: '#FFFFFF',
  heroTextDim: '#A9CDA9',
  accent: '#F59E0B',
  accentDim: '#FEF0D8',
  danger: '#E5484D',
  dangerDim: '#FDE8E8',
  warn: '#E08600',
  warnDim: '#FCEFD8',
  info: '#1C9BF0',
  infoDim: '#E1F1FD',
  ok: '#2FA34C',
  okDim: '#E2F5E6',
};

export const dark: Palette = {
  bg: '#101D0F',
  bgElev: '#182A16',
  bgElev2: '#1E331B',
  border: '#284024',
  borderStrong: '#3A5734',
  text: '#EAF5E3',
  textDim: '#A9BFA0',
  textFaint: '#7A9070',
  brand: '#6FDD1D',
  brandEdge: '#4FA80E',
  brandDim: '#22421A',
  brandStrong: '#8BEE45',
  onBrand: '#0D2405',
  hero: '#0C2A13',
  heroText: '#F0FAEE',
  heroTextDim: '#8FB98F',
  accent: '#F6B23C',
  accentDim: '#3A2C10',
  danger: '#F2686C',
  dangerDim: '#3D1D1E',
  warn: '#F0A83C',
  warnDim: '#392A10',
  info: '#5FB8F5',
  infoDim: '#14293A',
  ok: '#5ECC7B',
  okDim: '#14311D',
};

export const LIST_COLORS = ['#58CC02', '#1C9BF0', '#F59E0B', '#E5484D', '#9F5FE8', '#0FA3A3', '#FF7A1A', '#5A7050'];
