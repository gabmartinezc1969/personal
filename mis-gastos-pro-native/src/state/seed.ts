import { AppState, Category } from './types';

// Misma plantilla de categorías por defecto que la versión web (mis-gastos-pro.html).
const baseExpenseRaw: [string, string, string, string][] = [
  ['shopping', 'Compras', '🛒', '#FFE167'],
  ['food', 'Alimento', '🍽️', '#FF9FB6'],
  ['phone', 'Teléfono', '📱', '#73D3D8'],
  ['entertainment', 'Entretenimiento', '🎤', '#F4B26E'],
  ['education', 'Educación', '📚', '#D8D8D8'],
  ['beauty', 'Belleza', '💇', '#C9A8F5'],
  ['sport', 'Deporte', '🏊', '#C8D983'],
  ['social', 'Social', '👥', '#F3C991'],
  ['transport', 'Transportación', '🚌', '#8AD0D3'],
  ['clothing', 'Ropa', '👕', '#DDE5A1'],
  ['car', 'Coche', '🚗', '#C8D9EA'],
  ['wine', 'Vino', '🍷', '#E9D3AA'],
  ['cigarette', 'Cigarrillo', '🚬', '#B8D7D5'],
  ['electronics', 'Electrónica', '💻', '#F6E58D'],
  ['travel', 'Viaje', '✈️', '#C7E7D3'],
  ['health', 'Salud', '🧰', '#F3C2C2'],
  ['pet', 'Mascota', '🐶', '#6DCCCF'],
  ['repair', 'Reparar', '🛠️', '#BCE8C8'],
  ['lodging', 'Alojamiento', '🛏️', '#C5D8F2'],
  ['homecat', 'Hogar', '🏠', '#CAB8F1'],
  ['gift', 'Regalo', '🎁', '#F4D8D8'],
  ['donation', 'Donar', '💗', '#F0D4E2'],
  ['lottery', 'Lotería', '🎱', '#D2E2D2'],
  ['snacks', 'Aperitivos', '🧁', '#FFF3A8'],
  ['baby', 'Bebé', '👶', '#E7D5D5'],
  ['vegetable', 'Verdura', '🥕', '#D7EDCC'],
  ['fruit', 'Fruta', '🍇', '#D8D3F2'],
  ['other', 'Ajuste', '⚙️', '#D6D6D6'],
];

const baseIncomeRaw: [string, string, string, string][] = [
  ['salary', 'Salario', '💰', '#73D08B'],
  ['freelance', 'Freelance', '💻', '#72B5E8'],
  ['investment', 'Inversiones', '📈', '#B995DC'],
  ['refund', 'Reembolso', '↩️', '#74D4C1'],
  ['incomeGift', 'Regalo', '🎁', '#F49A9A'],
  ['otherIncome', 'Otros', '➕', '#BFC5C9'],
];

export const baseExpense: Category[] = baseExpenseRaw.map(([id, name, icon, color]) => ({
  id,
  name,
  icon,
  color,
  type: 'expense',
}));

export const baseIncome: Category[] = baseIncomeRaw.map(([id, name, icon, color]) => ({
  id,
  name,
  icon,
  color,
  type: 'income',
}));

export const defaultState: AppState = {
  currency: 'MXN',
  categories: [...baseExpense, ...baseIncome],
  transactions: [],
  globalBudget: 5000,
  budgets: [],
  fontScale: 1,
};
