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
  currency: string;
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
  currency: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  paymentDay: string; // Day of the month, e.g., "15"
  category: string;
  currency: string;
}

export interface SpendingLimit {
  id: string;
  category: string;
  limitAmount: number;
  currency: string;
}

// FIX: Add the missing `Goal` interface.
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
}


export type Tab = 'dashboard' | 'accounts' | 'debts' | 'subscriptions' | 'limits' | 'history' | 'analysis' | 'settings' | 'calendar';

export type Language = 'en' | 'es';

export interface Notification {
    id: string;
    message: string;
    dueDate: string;
    type: 'debt' | 'credit_card' | 'subscription';
}

export interface CustomEvent {
  id:string;
  date: string;
  description: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  currency: string;
  type: 'debt' | 'credit_card' | 'subscription';
}

export type ColorTheme = 'default' | 'ocean' | 'sunset' | 'forest';