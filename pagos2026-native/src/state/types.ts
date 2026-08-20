export type MovementType = 'I' | 'E'; // Ingreso | Egreso

export type Movement = {
  id: string;
  date: string; // YYYY-MM-DD
  type: MovementType;
  category: string;
  concept: string;
  budgeted: number; // monto presupuestado/planeado
  actual: number | null; // monto real; null = aún no ocurre
  paymentMethod: string;
  deductible: boolean;
};

export type Credit = {
  id: string;
  name: string;
  kind: string; // Hipotecario, Automotriz, etc.
  category: string;
  principal: number; // monto original
  rate: number; // tasa anual %
  termMonths: number; // plazo en meses
  startDate: string; // YYYY-MM-DD
  bankBalance: number | null; // saldo reportado por el banco, si se conoce
  notes: string;
};

export type Investment = {
  id: string;
  name: string;
  capital: number; // aportado
  value: number; // valor actual
};

export type Category = {
  id: string; // igual al nombre usado en Movement.category
  name: string;
  icon: string;
  color: string;
  type: MovementType;
};

export type Currency = 'MXN' | 'USD' | 'EUR';

// Multiplicador aplicado a los `fontSize` de la app (ver src/components/AppText.tsx).
export type FontScale = 0.9 | 1 | 1.15 | 1.3;

export type AppState = {
  currency: Currency;
  fontScale: FontScale;
  movements: Movement[];
  credits: Credit[];
  investments: Investment[];
  categories: Category[];
};
