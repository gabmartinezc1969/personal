import { Currency } from '../state/types';

export function formatMoney(amount: number, currency: Currency = 'MXN'): string {
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(amount) || 0);
  } catch {
    return `$${(Number(amount) || 0).toFixed(2)}`;
  }
}
