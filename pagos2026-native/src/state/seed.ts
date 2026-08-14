import { seedCredits, seedInvestments, seedMovements } from './seedData';
import { AppState, Category } from './types';

// Catálogo de categorías detectadas en el respaldo importado (pagos2026_data_v4_1.json).
// id === el valor exacto usado en Movement.category.
const egresoRaw: [string, string, string][] = [
  ['Tarjeta bancaria', '💳', '#8AD0D3'],
  ['Mantenimiento', '🛠️', '#BCE8C8'],
  ['Varios', '🧾', '#D6D6D6'],
  ['Hipotecario', '🏦', '#CAB8F1'],
  ['Credito Mazda', '🚗', '#F4B26E'],
  ['Credito Geely', '🚙', '#F3C991'],
  ['Credito automotriz', '🚘', '#E9D3AA'],
  ['Predial', '🏛️', '#C5D8F2'],
  ['Seguro', '🛡️', '#C9A8F5'],
  ['Servicios', '💡', '#FFE167'],
  ['Tenencia', '🚦', '#F3C2C2'],
  ['Arreglos Casa', '🔧', '#C8D9EA'],
  ['Gastos medicos', '🩺', '#FF9FB6'],
];

const ingresoRaw: [string, string, string][] = [
  ['Percepcion', '💰', '#73D08B'],
  ['Renta', '🏠', '#72B5E8'],
  ['Inversion', '📈', '#B995DC'],
];

const egresoCategories: Category[] = egresoRaw.map(([id, icon, color]) => ({ id, name: id, icon, color, type: 'E' }));
const ingresoCategories: Category[] = ingresoRaw.map(([id, icon, color]) => ({ id, name: id, icon, color, type: 'I' }));

export const defaultState: AppState = {
  currency: 'MXN',
  fontScale: 1,
  movements: seedMovements,
  credits: seedCredits,
  investments: seedInvestments,
  categories: [...egresoCategories, ...ingresoCategories],
};
