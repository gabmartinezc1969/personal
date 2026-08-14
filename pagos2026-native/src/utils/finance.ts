import { Credit } from '../state/types';

// Amortización estándar de crédito con tasa fija (mismo modelo que la
// versión web): pago mensual constante, calculado a partir de la tasa
// anual nominal, el plazo en meses y el principal original.
export function monthlyPayment(credit: Credit): number {
  const r = credit.rate / 100 / 12;
  const n = credit.termMonths;
  if (n <= 0) return 0;
  if (r === 0) return credit.principal / n;
  return (credit.principal * r) / (1 - Math.pow(1 + r, -n));
}

function monthsElapsed(startDate: string, asOf: Date): number {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  let months = (asOf.getFullYear() - sy) * 12 + (asOf.getMonth() - (sm - 1));
  if (asOf.getDate() < sd) months -= 1;
  return months;
}

// Saldo insoluto estimado a la fecha `asOf`, asumiendo pagos puntuales
// desde `startDate`. Si el crédito ya reporta un `bankBalance` (saldo
// confirmado por el banco), se usa ese en su lugar por ser más preciso.
export function remainingBalance(credit: Credit, asOf: Date = new Date()): number {
  if (credit.bankBalance != null) return credit.bankBalance;
  const r = credit.rate / 100 / 12;
  const n = credit.termMonths;
  const k = Math.max(0, Math.min(n, monthsElapsed(credit.startDate, asOf)));
  if (n <= 0) return 0;
  if (r === 0) return Math.max(0, credit.principal - (credit.principal / n) * k);
  const A = monthlyPayment(credit);
  const balance = credit.principal * Math.pow(1 + r, k) - (A * (Math.pow(1 + r, k) - 1)) / r;
  return Math.max(0, balance);
}

export function monthsRemaining(credit: Credit, asOf: Date = new Date()): number {
  const k = Math.max(0, Math.min(credit.termMonths, monthsElapsed(credit.startDate, asOf)));
  return Math.max(0, credit.termMonths - k);
}

export function paidPercent(credit: Credit, asOf: Date = new Date()): number {
  if (credit.principal <= 0) return 0;
  const remaining = remainingBalance(credit, asOf);
  return Math.max(0, Math.min(100, ((credit.principal - remaining) / credit.principal) * 100));
}
