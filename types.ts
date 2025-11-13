export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  destinationAccountId?: string;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash';

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
  monthlyPayment: number;
  totalInstallments: number;
  paidInstallments: number;
  interestRate: number;
  nextPaymentDate: string;
  currency: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  paymentDay: string; // Day of the month, e.g., "15"
  category: string;
  currency: string;
  type: TransactionType;
}

export interface SpendingLimit {
  id: string;
  category: string;
  limitAmount: number;
  currency: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  currency: string;
}

export type Tab = 'dashboard' | 'accounts' | 'debts' | 'recurring' | 'limits' | 'analysis' | 'settings' | 'calendar' | 'goals' | 'wellness' | 'history';

export type Language = 'en' | 'es';

export interface Notification {
    id: string;
    message: string;
    dueDate: string;
    type: 'debt' | 'credit_card' | 'recurring';
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
  type: 'debt' | 'credit_card' | 'recurring';
  transactionType?: TransactionType;
}

export type ColorTheme = 'default' | 'ocean' | 'sunset' | 'forest';

// FIX: Added Theme type to centralize type definitions.
export type Theme = 'light' | 'dark';

export interface CoupleLink {
  linked: boolean;
  partnerName: string | null;
  linkId: string | null;
}

// FIX: Add missing FocusWidgetType and FocusModeConfig type definitions.
export type FocusWidgetType = 'goal' | 'limit' | 'upcoming' | 'quickAdd' | 'tip';

export interface FocusModeConfig {
  activeWidgets: FocusWidgetType[];
  selectedGoalId?: string | null;
  selectedLimitId?: string | null;
}

export type LastTransactionAction = {
  action: 'add' | 'update';
  transaction: Transaction;
  originalTransaction?: Transaction; // For 'update' actions
};