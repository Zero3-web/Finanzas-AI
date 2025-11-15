
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

export interface InitialInvestment {
  id: string;
  name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'loan';
  debtId?: string; 
}

export interface ShoppingListItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  purchased: boolean;
}

export type Tab = 'dashboard' | 'accounts' | 'debts' | 'recurring' | 'limits' | 'analysis' | 'settings' | 'calendar' | 'history' | 'inversion_inicial' | 'lista_compras';

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

export type Theme = 'light' | 'dark';

export interface CoupleLink {
  linked: boolean;
  partnerName: string | null;
  linkId: string | null;
}

export type LastTransactionAction = {
  action: 'add' | 'update';
  transaction: Transaction;
  originalTransaction?: Transaction; // For 'update' actions
} | {
  action: 'add_batch';
  transactions: Transaction[];
};