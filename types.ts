export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
}

export type AccountType = 'checking' | 'savings' | 'credit';

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  creditLimit?: number;
  paymentDueDate?: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  amountPaid: number;
  interestRate: number;
  nextPaymentDate: string;
}

export type Tab = 'dashboard' | 'accounts' | 'debts' | 'history' | 'analysis' | 'settings' | 'calendar';

export type Language = 'en' | 'es';

export interface Notification {
    id: string;
    message: string;
    dueDate: string;
    type: 'debt' | 'credit_card';
}

export interface CustomEvent {
  id: string;
  date: string;
  description: string;
}
