export type TxType = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TxType;
};

export type Transaction = {
  id: string;
  type: TxType;
  categoryId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
  account: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
};

export type Currency = 'MXN' | 'USD' | 'EUR';

export type AppState = {
  currency: Currency;
  categories: Category[];
  transactions: Transaction[];
  globalBudget: number;
  budgets: Budget[];
};
