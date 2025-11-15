import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { Tab, Transaction, Account, Debt, RecurringTransaction, SpendingLimit, Notification, Language, ColorTheme, TransactionType, AccountType, CoupleLink, LastTransactionAction, InitialInvestment, ShoppingListItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useColorTheme } from './hooks/useColorTheme';
import { useCurrentDate } from './contexts/CurrentDateContext';
import { translations } from './utils/translations';
import { avatars } from './utils/avatars';
import { playTone } from './utils/audio';

import Navigation from './components/Navigation';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import MobileMenu from './components/MobileMenu';
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import AccountForm from './components/AccountForm';
import DebtForm from './components/DebtForm';
import RecurringTransactionForm from './components/SubscriptionForm';
import LimitForm from './components/LimitForm';
import InversionInicialForm from './components/InversionInicialForm';
import ShoppingItemForm from './components/ShoppingItemForm';
import ConfirmationModal from './components/ConfirmationModal';
import OnboardingTour from './components/OnboardingTour';
import VoiceInputModal from './components/VoiceInputModal';
import VoiceTour from './components/VoiceTour';
import DynamicIsland from './components/DynamicIsland';
import TransactionDetailModal from './components/TransactionDetailModal';
import AccountSelectionModal from './components/AccountSelectionModal';
import CurrencyMismatchModal from './components/CurrencyMismatchModal';
import DebtPaymentModal from './components/DebtPaymentModal';

import Dashboard from './views/Dashboard';
import Accounts from './views/Accounts';
import Debts from './views/Debts';
import Recurring from './views/Subscriptions';
import Limits from './views/Limits';
import History from './views/History';
import Analysis from './views/Analysis';
import Calendar from './views/Calendar';
import Settings from './views/Settings';
import InversionInicial from './views/InversionInicial';
import ShoppingList from './views/ShoppingList';
import { MicIcon, PlusIcon } from './components/icons';
import DashboardSkeleton from './components/DashboardSkeleton';

type PendingTransaction = Omit<Transaction, 'id' | 'accountId'> & { currency: string };

const App: React.FC = () => {
    // Global Settings
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [primaryCurrency, setPrimaryCurrency] = useLocalStorage<string>('primary-currency', 'USD');
    const [userName, setUserName] = useLocalStorage<string>('user-name', 'Guest');
    const [avatar, setAvatar] = useLocalStorage<string>('user-avatar', avatars[0]);
    const [theme, toggleTheme] = useTheme();
    const [colorTheme, setColorTheme] = useColorTheme();
    const [isFinishedOnboarding, setIsFinishedOnboarding] = useLocalStorage('onboarding-finished', false);
    const [coupleLink, setCoupleLink] = useLocalStorage<CoupleLink>('couple-link', { linked: false, partnerName: null, linkId: null });

    // Main App State
    const [isNavCollapsed, setIsNavCollapsed] = useLocalStorage('nav-collapsed', false);
    const [activeTab, setActiveTab] = useLocalStorage<Tab>('active-tab', 'dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { currentDate } = useCurrentDate();


    // Data State
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
    const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurringTransactions', []);
    const [limits, setLimits] = useLocalStorage<SpendingLimit[]>('limits', []);
    const [initialInvestments, setInitialInvestments] = useLocalStorage<InitialInvestment[]>('initial-investments', []);
    const [shoppingListItems, setShoppingListItems] = useLocalStorage<ShoppingListItem[]>('shopping-list-items', []);
    const [lastAutoProcessDate, setLastAutoProcessDate] = useLocalStorage<string>('last-auto-process-date', '');


    // Modal & Editing State
    const [modal, setModal] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [itemToRemove, setItemToRemove] = useState<{ type: string, id: string } | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailModalContent, setDetailModalContent] = useState<{ title: string; transactions: Transaction[] }>({ title: '', transactions: [] });
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [accountFormSuccessCallback, setAccountFormSuccessCallback] = useState<((newAccount: Account) => void) | null>(null);
    const [debtToPay, setDebtToPay] = useState<Debt | null>(null);


    // Voice Input & Dynamic Island State
    const [isVoiceTourFinished, setIsVoiceTourFinished] = useLocalStorage('voice-tour-finished', false);
    const [isVoiceTourOpen, setIsVoiceTourOpen] = useState(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isAccountSelectionModalOpen, setIsAccountSelectionModalOpen] = useState(false);
    const [pendingVoiceTransactions, setPendingVoiceTransactions] = useState<PendingTransaction[] | null>(null);
    const [isCurrencyMismatchModalOpen, setIsCurrencyMismatchModalOpen] = useState(false);
    const [mismatchData, setMismatchData] = useState<{ transactions: PendingTransaction[], detectedCurrency: string } | null>(null);
    const [isIslandOpen, setIsIslandOpen] = useState(false);
    const [islandStatus, setIslandStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [islandMessage, setIslandMessage] = useState('');
    const [scrollToTransactionId, setScrollToTransactionId] = useState<string | null>(null);
    const [lastTransactionAction, setLastTransactionAction] = useState<LastTransactionAction | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
        let translation = translations[language][key] || key;
        if (params) {
            Object.keys(params).forEach(pKey => {
                translation = translation.replace(`{${pKey}}`, String(params[pKey]));
            });
        }
        return translation;
    }, [language]);

    const formatCurrency = useCallback((amount: number, currencyCode?: string) => {
        // Ensure currencyCode is a valid, non-empty string. Fallback chain: provided code -> primary currency -> USD.
        const code = (currencyCode && currencyCode.trim()) ? currencyCode : primaryCurrency;
        
        try {
            // This will throw an error if 'code' is not a valid ISO currency code.
            return new Intl.NumberFormat(language, { style: 'currency', currency: code }).format(amount);
        } catch (error) {
            // Catch the error and default to USD, preventing the app from crashing.
            console.warn(`Could not format currency for code "${code}". Defaulting to USD.`, error);
            return new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(amount);
        }
    }, [language, primaryCurrency]);

    // Data Migration: Ensure old data from localStorage has a currency field.
    const dataMigrationRan = useRef(false);
    useEffect(() => {
        if (dataMigrationRan.current) return;
    
        // General migration for adding 'currency' property
        const migrateCurrency = (items: any[], setter: React.Dispatch<React.SetStateAction<any[]>>, key: string) => {
            if (!primaryCurrency) return;
            let needsUpdate = false;
            const updatedItems = items.map(item => {
                if (item && typeof item === 'object' && !item.currency) {
                    needsUpdate = true;
                    return { ...item, currency: primaryCurrency };
                }
                return item;
            });
    
            if (needsUpdate) {
                console.log(`Running currency migration for '${key}'.`);
                setter(updatedItems);
            }
        };

        // Migration for 'subscriptions' to 'recurringTransactions'
        const oldSubscriptionsData = localStorage.getItem('subscriptions');
        if (oldSubscriptionsData) {
            console.log("Migrating 'subscriptions' to 'recurringTransactions'.");
            const oldSubscriptions = JSON.parse(oldSubscriptionsData);
            if (Array.isArray(oldSubscriptions)) {
                const migrated = oldSubscriptions.map((sub: any) => ({
                    ...sub,
                    type: TransactionType.EXPENSE, // Default old subscriptions to expenses
                    currency: sub.currency || primaryCurrency, // Ensure currency
                }));
                setRecurringTransactions(migrated);
                localStorage.removeItem('subscriptions');
            }
        }
        
        migrateCurrency(accounts, setAccounts, 'accounts');
        migrateCurrency(debts, setDebts, 'debts');
        migrateCurrency(limits, setLimits, 'limits');
    
        dataMigrationRan.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryCurrency]);

    // Automatic Monthly Processing
    useEffect(() => {
        const today = currentDate;
        const lastProcess = lastAutoProcessDate ? new Date(lastAutoProcessDate) : null;
    
        // Run if it's never been run, or if the last run was in a previous month/year
        if (!lastProcess || lastProcess.getMonth() !== today.getMonth() || lastProcess.getFullYear() !== today.getFullYear()) {
            console.log("Running automatic monthly processing...");
            
            let newTransactions = [...transactions];
            let newAccounts = [...accounts];
            let newDebts = [...debts];

            // 1. Process Recurring Transactions
            recurringTransactions.forEach(rec => {
                const dayOfMonth = parseInt(rec.paymentDay);
                if (isNaN(dayOfMonth)) return;

                const paymentDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
                const firstAccount = newAccounts.find(acc => acc.currency === rec.currency) || newAccounts[0];

                if (firstAccount) {
                    const newTransaction: Transaction = {
                        id: `auto-rec-${rec.id}-${paymentDate.toISOString()}`,
                        accountId: firstAccount.id,
                        amount: rec.amount,
                        description: t('auto_recurring_payment', { name: rec.name }),
                        category: rec.category,
                        type: rec.type,
                        date: paymentDate.toISOString().split('T')[0],
                    };
                    newTransactions.push(newTransaction);

                    // Update account balance
                    newAccounts = newAccounts.map(acc => {
                        if (acc.id === firstAccount.id) {
                            const newBalance = newTransaction.type === TransactionType.INCOME
                                ? acc.balance + newTransaction.amount
                                : acc.balance - newTransaction.amount;
                            return { ...acc, balance: newBalance };
                        }
                        return acc;
                    });
                }
            });

            // 2. Process Debt Payments
            newDebts = newDebts.map(debt => {
                const nextPaymentDate = new Date(debt.nextPaymentDate);
                if (nextPaymentDate <= today && debt.paidInstallments < debt.totalInstallments) {
                    const firstAccount = newAccounts.find(acc => acc.currency === debt.currency) || newAccounts[0];
                    if (firstAccount) {
                        const paymentTransaction: Transaction = {
                            id: `auto-debt-${debt.id}-${today.toISOString()}`,
                            accountId: firstAccount.id,
                            amount: debt.monthlyPayment,
                            description: t('auto_debt_payment', { name: debt.name }),
                            category: 'Housing', // Or a more generic "Debt" category could be used
                            type: TransactionType.EXPENSE,
                            date: today.toISOString().split('T')[0],
                        };
                        newTransactions.push(paymentTransaction);

                        // Update account balance
                        newAccounts = newAccounts.map(acc => {
                            if (acc.id === firstAccount.id) {
                                return { ...acc, balance: acc.balance - debt.monthlyPayment };
                            }
                            return acc;
                        });
                        
                        // Update debt
                        const newNextPaymentDate = new Date(nextPaymentDate);
                        newNextPaymentDate.setMonth(newNextPaymentDate.getMonth() + 1);
                        
                        return {
                            ...debt,
                            paidInstallments: debt.paidInstallments + 1,
                            nextPaymentDate: newNextPaymentDate.toISOString().split('T')[0]
                        };
                    }
                }
                return debt;
            });

            // Batch update state
            setTransactions(newTransactions);
            setAccounts(newAccounts);
            setDebts(newDebts);
            setLastAutoProcessDate(today.toISOString());
            console.log("Monthly processing complete.");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, lastAutoProcessDate, accounts, debts, recurringTransactions, transactions, setAccounts, setDebts, setLastAutoProcessDate, setTransactions, t]);


    // Notifications
    const notifications = useMemo<Notification[]>(() => {
        const today = currentDate;
        const upcoming: Notification[] = [];
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        debts.forEach(d => {
            const dueDate = new Date(d.nextPaymentDate);
            if (dueDate >= today && dueDate <= sevenDaysFromNow) {
                upcoming.push({ id: `debt-${d.id}`, message: `${t('paymentFor')} ${d.name}`, dueDate: d.nextPaymentDate, type: 'debt' });
            }
        });
        accounts.filter(a => a.type === 'credit' && a.paymentDueDate).forEach(a => {
            const dayOfMonth = parseInt(a.paymentDueDate!);
            if (isNaN(dayOfMonth)) return;
            const dueDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
            if (dueDate >= today && dueDate <= sevenDaysFromNow) {
                upcoming.push({ id: `cc-${a.id}`, message: `${t('paymentFor')} ${a.name}`, dueDate: dueDate.toISOString(), type: 'credit_card' });
            }
        });

        return upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [debts, accounts, t, currentDate]);

    // Transaction-specific CRUD handlers
    const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>): Transaction => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: uuidv4(),
        };
        
        setIsFormSubmitting(true);

        setTransactions(prev => [...prev, newTransaction]);

        setAccounts(prevAccounts => 
            prevAccounts.map(acc => {
                if (newTransaction.type === TransactionType.TRANSFER) {
                    if (acc.id === newTransaction.accountId) { // Source account
                        return { ...acc, balance: acc.balance - newTransaction.amount };
                    }
                    if (acc.id === newTransaction.destinationAccountId) { // Destination account
                        return { ...acc, balance: acc.balance + newTransaction.amount };
                    }
                } else {
                    if (acc.id === newTransaction.accountId) {
                        const newBalance = newTransaction.type === TransactionType.INCOME
                            ? acc.balance + newTransaction.amount
                            : acc.balance - newTransaction.amount;
                        return { ...acc, balance: newBalance };
                    }
                }
                return acc;
            })
        );
        
        setSelectedAccountId(null); // Reset dashboard filter to All Accounts
        setLastTransactionAction({ action: 'add', transaction: newTransaction });
        setIslandStatus('success');
        setIslandMessage(newTransaction.type === TransactionType.TRANSFER ? t('transfer_successful') : t('voice_success'));
        playTone('success');
        setIsIslandOpen(true);

        if (window.innerWidth < 768) {
            setScrollToTransactionId(newTransaction.id);
        }

        return newTransaction;
    };

    const handleUpdateTransaction = (updatedTransaction: Transaction, isUndo: boolean = false) => {
        const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (!originalTransaction) return;

        if (!isUndo) setIsFormSubmitting(true);

        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));

        setAccounts(prevAccounts => {
            let tempAccounts = [...prevAccounts];
    
            // Revert old transaction
            if (originalTransaction.type === TransactionType.TRANSFER) {
                tempAccounts = tempAccounts.map(acc => {
                    if (acc.id === originalTransaction.accountId) return { ...acc, balance: acc.balance + originalTransaction.amount };
                    if (acc.id === originalTransaction.destinationAccountId) return { ...acc, balance: acc.balance - originalTransaction.amount };
                    return acc;
                });
            } else { // Income or Expense
                tempAccounts = tempAccounts.map(acc => {
                    if (acc.id === originalTransaction.accountId) {
                        const newBalance = originalTransaction.type === TransactionType.INCOME
                            ? acc.balance - originalTransaction.amount
                            : acc.balance + originalTransaction.amount;
                        return { ...acc, balance: newBalance };
                    }
                    return acc;
                });
            }
    
            // Apply new transaction
            if (updatedTransaction.type === TransactionType.TRANSFER) {
                tempAccounts = tempAccounts.map(acc => {
                    if (acc.id === updatedTransaction.accountId) return { ...acc, balance: acc.balance - updatedTransaction.amount };
                    if (acc.id === updatedTransaction.destinationAccountId) return { ...acc, balance: acc.balance + updatedTransaction.amount };
                    return acc;
                });
            } else { // Income or Expense
                tempAccounts = tempAccounts.map(acc => {
                    if (acc.id === updatedTransaction.accountId) {
                        const newBalance = updatedTransaction.type === TransactionType.INCOME
                            ? acc.balance + updatedTransaction.amount
                            : acc.balance - updatedTransaction.amount;
                        return { ...acc, balance: newBalance };
                    }
                    return acc;
                });
            }
            return tempAccounts;
        });
        
        if (!isUndo) {
            setSelectedAccountId(null); // Reset dashboard filter
            setLastTransactionAction({ 
                action: 'update', 
                transaction: updatedTransaction, 
                originalTransaction: originalTransaction 
            });
            setIslandStatus('success');
            setIslandMessage(t('transaction_updated'));
            playTone('success');
            setIsIslandOpen(true);
        }
    };

    // Generic CRUD Handlers
    const handleAddOrUpdate = <T extends { id: string }>(items: T[], setItems: (items: T[]) => void, newItem: Omit<T, 'id'> | T): T => {
        let result: T;
        if ('id' in newItem && newItem.id) { // Update
            result = newItem as T;
            setItems(items.map(item => (item.id === result.id ? result : item)));
        } else { // Add
            result = { ...newItem, id: uuidv4() } as T;
            setItems([...items, result]);
        }
        return result;
    };

    const handleGenericSubmit = <T extends { id: string }>(
        items: T[],
        setItems: (items: T[]) => void,
        newItem: Omit<T, 'id'> | T,
        entityNameKey: 'account' | 'debt' | 'recurring_item' | 'limit' | 'inversion_inicial' | 'shopping_item'
    ): T => {
        setIsFormSubmitting(true);
        const isEditing = 'id' in newItem;
        
        const result = handleAddOrUpdate(items, setItems, newItem);

        setIslandStatus('success');
        const successMessageKey = isEditing ? 'item_updated_successfully' : 'item_added_successfully';
        setIslandMessage(t(successMessageKey, { item: t(entityNameKey) }));
        playTone('success');
        setIsIslandOpen(true);
        return result;
    };

    const handleInvestmentSubmit = (
        investment: Omit<InitialInvestment, 'id'> | InitialInvestment,
        debtDetails?: Omit<Debt, 'id'>
    ) => {
        setIsFormSubmitting(true);
        const isEditingInvestment = 'id' in investment;

        if (investment.status === 'loan' && debtDetails) {
            const newDebt = handleAddOrUpdate(debts, setDebts, debtDetails);
            const newInvestmentData = { ...investment, debtId: newDebt.id };
            handleAddOrUpdate(initialInvestments, setInitialInvestments, newInvestmentData);
        } else {
            handleAddOrUpdate(initialInvestments, setInitialInvestments, investment);
        }

        setIslandStatus('success');
        setIslandMessage(t(isEditingInvestment ? 'item_updated_successfully' : 'item_added_successfully', { item: t('inversion_inicial') }));
        playTone('success');
        setIsIslandOpen(true);
    };

    const handleToggleShoppingListItem = (id: string) => {
        setShoppingListItems(prev => prev.map(item =>
            item.id === id ? { ...item, purchased: !item.purchased } : item
        ));
    };

    const handleRemove = (type: string, id: string, silent = false) => {
        const setters: { [key: string]: React.Dispatch<any> } = {
            account: setAccounts,
            transaction: setTransactions,
            debt: setDebts,
            recurring: setRecurringTransactions,
            limit: setLimits,
            inversion_inicial: setInitialInvestments,
            shopping_item: setShoppingListItems,
        };
        const items: { [key: string]: any[] } = {
            account: accounts,
            transaction: transactions,
            debt: debts,
            recurring: recurringTransactions,
            limit: limits,
            inversion_inicial: initialInvestments,
            shopping_item: shoppingListItems,
        };
        
        if (type === 'transaction') {
            const transactionToRemove = transactions.find(t => t.id === id);
            if (transactionToRemove) {
                if (id === scrollToTransactionId) {
                    setScrollToTransactionId(null);
                }
                setAccounts(prevAccounts => prevAccounts.map(acc => {
                    if (transactionToRemove.type === TransactionType.TRANSFER) {
                        if (acc.id === transactionToRemove.accountId) return { ...acc, balance: acc.balance + transactionToRemove.amount };
                        if (acc.id === transactionToRemove.destinationAccountId) return { ...acc, balance: acc.balance - transactionToRemove.amount };
                    } else {
                        if (acc.id === transactionToRemove.accountId) {
                            const newBalance = transactionToRemove.type === TransactionType.INCOME
                                ? acc.balance - transactionToRemove.amount
                                : acc.balance + transactionToRemove.amount;
                            return { ...acc, balance: newBalance };
                        }
                    }
                    return acc;
                }));
                setTransactions(prev => prev.filter(t => t.id !== id));
            }
        } else if (setters[type]) {
            setters[type](items[type].filter((item: any) => item.id !== id));
            if (type === 'account') {
                setTransactions(transactions.filter(t => t.accountId !== id && t.destinationAccountId !== id));
            }
        }

        if (!silent) {
            setItemToRemove(null);
        }
    };

    // Modal Open/Close Handlers
    const openModal = (name: string, item: any = null) => {
        if (name !== 'account') {
            setAccountFormSuccessCallback(null);
        }
        setItemToEdit(item);
        setModal(name);
    };

    const closeModal = () => {
        setModal(null);
        setItemToEdit(null);
        setAccountFormSuccessCallback(null);
    };

    const handleModalExitComplete = () => {
        closeModal();
        setIsFormSubmitting(false);
    }

    const openConfirmation = (type: string, id: string) => {
        setItemToRemove({ type, id });
    };

    // Chart Drill-down Modal Handler
    const handleOpenDetailModal = (title: string, transactions: Transaction[]) => {
        setDetailModalContent({ title, transactions });
        setIsDetailModalOpen(true);
    };

    // Effect to scroll to a newly added transaction on mobile
    useEffect(() => {
        if (scrollToTransactionId) {
            // We need to be on the history tab to see the transaction list
            setActiveTab('history');
            
            // Allow time for the view to re-render before trying to find the element
            const scrollTimer = setTimeout(() => {
                const element = document.getElementById(`transaction-${scrollToTransactionId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                // Reset the scroll state after the action
                setScrollToTransactionId(null);
            }, 300);

            return () => clearTimeout(scrollTimer);
        }
    }, [scrollToTransactionId, setActiveTab]);
    
    const addBatchTransactions = (transactionsData: Omit<Transaction, 'id' | 'accountId'>[], accountId: string) => {
        let tempTransactions: Transaction[] = [];
        let updatedBalance = accounts.find(a => a.id === accountId)?.balance || 0;
    
        transactionsData.forEach(txData => {
            const newTransaction: Transaction = {
                ...txData,
                id: uuidv4(),
                accountId: accountId,
            };
            tempTransactions.push(newTransaction);
    
            updatedBalance = newTransaction.type === TransactionType.INCOME
                ? updatedBalance + newTransaction.amount
                : updatedBalance - newTransaction.amount;
        });
    
        setTransactions(prev => [...prev, ...tempTransactions]);
        setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, balance: updatedBalance } : acc));
    
        setSelectedAccountId(accountId); // Switch dashboard view to this account
        setLastTransactionAction({ action: 'add_batch', transactions: tempTransactions });
        setIslandStatus('success');
        setIslandMessage(t('voice_success_multi', { count: transactionsData.length }));
        playTone('success');
        setIsIslandOpen(true);
    };

    // Gemini API integration
    const expenseCategories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Gifts', 'Investments', 'Other'];
    const handleTranscriptReady = async (transcript: string) => {
        setIsVoiceModalOpen(false);
        setIslandStatus('processing');
        setIslandMessage(t('voice_processing'));
        setIsIslandOpen(true);

        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable not set.");
            setIslandStatus('error');
            setIslandMessage("API Key not configured.");
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    transactions: {
                        type: Type.ARRAY,
                        description: "A list of financial transactions parsed from the user's input.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                amount: { type: Type.NUMBER, description: "The transaction amount as a number." },
                                description: { type: Type.STRING, description: "A brief description of the transaction." },
                                category: { type: Type.STRING, description: "The category of the transaction." },
                                type: { type: Type.STRING, enum: ['income', 'expense'], description: "The type of transaction, either 'income' or 'expense'." },
                                currency: { type: Type.STRING, description: "The currency of the transaction as a 3-letter ISO code (e.g., USD, PEN, EUR). If not mentioned, use the user's primary currency." }
                            },
                            required: ['amount', 'description', 'category', 'type', 'currency'],
                        }
                    }
                },
                required: ['transactions']
            };

            const prompt = t('voice_prompt', {
                currency: primaryCurrency,
                date: currentDate.toLocaleDateString(language),
                transcript: transcript,
            });

            const systemInstruction = t('voice_system_instruction', {
                expense_categories: expenseCategories.join(', '),
                income_categories: incomeCategories.join(', '),
                primary_currency: primaryCurrency,
            });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema,
                    systemInstruction,
                },
            });

            const jsonStr = response.text.trim();
            const parsed = JSON.parse(jsonStr);
            const parsedTransactions = parsed.transactions || [];

            if (parsedTransactions.length > 0) {
                 const newTransactions: PendingTransaction[] = parsedTransactions.map((p: any) => ({
                    amount: Math.abs(p.amount),
                    description: p.description,
                    category: p.category,
                    type: p.type as TransactionType,
                    date: currentDate.toISOString().split('T')[0],
                    currency: p.currency,
                }));

                const detectedCurrency = newTransactions[0].currency;
                const existingCurrencies = [...new Set(accounts.map(a => a.currency))];
                
                if (accounts.length > 0 && !existingCurrencies.includes(detectedCurrency)) {
                    // Currency Mismatch Flow
                    setMismatchData({ transactions: newTransactions, detectedCurrency });
                    setIsCurrencyMismatchModalOpen(true);
                    setIsIslandOpen(false);
                } else if (accounts.length > 1) {
                    setPendingVoiceTransactions(newTransactions);
                    setIsAccountSelectionModalOpen(true);
                    setIsIslandOpen(false); // Hide island as modal is opening
                } else if (accounts.length === 1) {
                    setIsIslandOpen(false); // Hide "processing" island before success one shows
                    addBatchTransactions(newTransactions, accounts[0].id);
                } else {
                     throw new Error("No account available to add transaction to.");
                }
            } else {
                throw new Error('No transactions parsed from AI');
            }
        } catch (error) {
            console.error('Error processing transcript with AI:', error);
            setIslandStatus('error');
            setIslandMessage(t('voice_error'));
            playTone('error');
            setIsIslandOpen(true);
        }
    };
    
    const handleConvertTransaction = async (targetAccountId: string) => {
        if (!mismatchData) return;
    
        const targetAccount = accounts.find(acc => acc.id === targetAccountId);
        if (!targetAccount) return;
    
        const { transactions, detectedCurrency } = mismatchData;
        const targetCurrency = targetAccount.currency;
    
        setIsCurrencyMismatchModalOpen(false);
        setMismatchData(null);
        setIslandStatus('processing');
        setIslandMessage(t('voice_processing'));
        setIsIslandOpen(true);
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            // For simplicity, we'll convert the first transaction and open it for user review.
            // Batch conversion without confirmation is risky.
            const firstTransaction = transactions[0];
    
            const prompt = t('ai_conversion_prompt', {
                amount: String(firstTransaction.amount),
                from_currency: detectedCurrency,
                to_currency: targetCurrency,
            });
    
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const convertedAmountText = response.text.trim().replace(/[^0-9.,]/g, '').replace(',', '.');
            const convertedAmount = parseFloat(convertedAmountText);
    
            if (isNaN(convertedAmount)) {
                throw new Error('AI did not return a valid number for conversion.');
            }
    
            const transactionToConfirm = {
                ...firstTransaction,
                amount: convertedAmount,
                description: `${firstTransaction.description} (${t('conversion_prefix')}: ${firstTransaction.amount} ${detectedCurrency})`,
                accountId: targetAccountId,
                id: '', 
                destinationAccountId: undefined,
            };
    
            setIsIslandOpen(false);
            openModal('transaction', transactionToConfirm);
    
        } catch (error) {
            console.error('Error during currency conversion:', error);
            setIslandStatus('error');
            setIslandMessage(t('voice_error'));
            setIsIslandOpen(true);
        }
    };

    const handleCreateAccountForMismatch = () => {
        if (!mismatchData) return;
        const { transactions, detectedCurrency } = mismatchData;

        const successCb = (newAccount: Account) => {
            const transactionsToAdd = transactions.map(({ currency, ...rest }) => rest);
            addBatchTransactions(transactionsToAdd, newAccount.id);
        };
        setAccountFormSuccessCallback(() => successCb);

        setIsCurrencyMismatchModalOpen(false);
        setMismatchData(null);
        openModal('account', { currency: detectedCurrency });
    };


    const handleVoiceClick = () => {
        if (!isVoiceTourFinished) {
            setIsVoiceTourOpen(true);
        } else {
            setIsVoiceModalOpen(true);
        }
    };

    const handleFinishVoiceTour = () => {
        setIsVoiceTourFinished(true);
        setIsVoiceTourOpen(false);
        setIsVoiceModalOpen(true); // Open the real modal right after the tour.
    };

    // Dynamic Island Undo/Edit handlers
    const handleCloseIsland = () => {
        setIsIslandOpen(false);
        setLastTransactionAction(null);
    };
    
    const handleUndoAction = () => {
        if (!lastTransactionAction) return;
    
        if (lastTransactionAction.action === 'add_batch') {
            lastTransactionAction.transactions.forEach(tx => handleRemove('transaction', tx.id, true));
        } else if (lastTransactionAction.action === 'add') {
            handleRemove('transaction', lastTransactionAction.transaction.id);
        } else if (lastTransactionAction.action === 'update' && lastTransactionAction.originalTransaction) {
            handleUpdateTransaction(lastTransactionAction.originalTransaction, true);
        }
    
        setLastTransactionAction(null); // Must clear before setting new island state
        setIslandStatus('success');
        setIslandMessage(t('action_undone'));
        setIsIslandOpen(true); // Re-open or update island
    };
    
    const handleEditAction = () => {
        if (!lastTransactionAction) return;

        if (lastTransactionAction.action === 'add_batch') {
            openModal('transaction', lastTransactionAction.transactions[0]);
        } else if (lastTransactionAction.action === 'add' || lastTransactionAction.action === 'update') {
            openModal('transaction', lastTransactionAction.transaction);
        }
    };

    // Payment Handlers
    const handleOpenPayDebtModal = (debt: Debt) => {
        setDebtToPay(debt);
    };

    const handlePayDebtInstallment = (debtId: string, fromAccountId: string) => {
        const debt = debts.find(d => d.id === debtId);
        const account = accounts.find(a => a.id === fromAccountId);

        if (!debt || !account) return;

        // 1. Create expense transaction
        const paymentTransaction: Transaction = {
          id: uuidv4(),
          accountId: fromAccountId,
          amount: debt.monthlyPayment,
          description: t('auto_debt_payment', { name: debt.name }),
          category: 'Housing',
          type: TransactionType.EXPENSE,
          date: currentDate.toISOString().split('T')[0],
        };
        setTransactions(prev => [...prev, paymentTransaction]);

        // 2. Update account balance
        setAccounts(prev => prev.map(acc => 
            acc.id === fromAccountId ? { ...acc, balance: acc.balance - debt.monthlyPayment } : acc
        ));

        // 3. Update debt
        const newNextPaymentDate = new Date(debt.nextPaymentDate);
        newNextPaymentDate.setMonth(newNextPaymentDate.getMonth() + 1);
        
        setDebts(prev => prev.map(d =>
            d.id === debtId ? { 
                ...d, 
                paidInstallments: d.paidInstallments + 1,
                nextPaymentDate: newNextPaymentDate.toISOString().split('T')[0]
            } : d
        ));

        setDebtToPay(null); // Close modal
        
        // 4. Show success feedback
        setIslandStatus('success');
        setIslandMessage(t('payment_successful'));
        playTone('success');
        setIsIslandOpen(true);
    };

    const handleOpenCreditCardPayment = (account: Account) => {
        if (account.type !== 'credit') return;

        const sourceAccount = accounts.find(a => a.type !== 'credit' && a.currency === account.currency) || accounts.find(a => a.type !== 'credit');
        
        openModal('transaction', {
            type: TransactionType.TRANSFER,
            destinationAccountId: account.id,
            accountId: sourceAccount?.id || '',
            amount: account.balance < 0 ? Math.abs(account.balance) : undefined,
            description: t('paymentFor', { name: account.name }),
        });
    };


    const renderView = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} debts={debts} recurringTransactions={recurringTransactions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddRecurring={() => openModal('recurring')} primaryCurrency={primaryCurrency} onOpenDetailModal={handleOpenDetailModal} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />;
            case 'accounts': return <Accounts accounts={accounts} transactions={transactions} primaryCurrency={primaryCurrency} formatCurrency={formatCurrency} onAddAccount={() => openModal('account')} onEditAccount={(acc) => openModal('account', acc)} onRemoveAccount={(id) => openConfirmation('account', id)} t={t} onMakeCreditCardPayment={handleOpenCreditCardPayment} />;
            case 'debts': return <Debts debts={debts} formatCurrency={formatCurrency} onAddDebt={() => openModal('debt')} onEditDebt={(debt) => openModal('debt', debt)} onRemoveDebt={(id) => openConfirmation('debt', id)} t={t} onPayDebt={handleOpenPayDebtModal} />;
            case 'recurring': return <Recurring recurringTransactions={recurringTransactions} formatCurrency={formatCurrency} onAddRecurring={() => openModal('recurring')} onEditRecurring={(rec) => openModal('recurring', rec)} onRemoveRecurring={(id) => openConfirmation('recurring', id)} t={t} />;
            case 'limits': return <Limits limits={limits} transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onAddLimit={() => openModal('limit')} onEditLimit={(limit) => openModal('limit', limit)} onRemoveLimit={(id) => openConfirmation('limit', id)} t={t} />;
            case 'history': return <History transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onEditTransaction={(tr) => openModal('transaction', tr)} onRemoveTransaction={(id) => openConfirmation('transaction', id)} t={t} />;
            case 'analysis': return <Analysis transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} t={t} colorTheme={colorTheme} primaryCurrency={primaryCurrency} onOpenDetailModal={handleOpenDetailModal} />;
            case 'calendar': return <Calendar accounts={accounts} debts={debts} recurringTransactions={recurringTransactions} formatCurrency={formatCurrency} t={t} />;
            case 'settings': return <Settings theme={theme} toggleTheme={toggleTheme} currency={primaryCurrency} setCurrency={setPrimaryCurrency} language={language} setLanguage={setLanguage} colorTheme={colorTheme} setColorTheme={setColorTheme} avatar={avatar} setAvatar={setAvatar} userName={userName} setUserName={setUserName} t={t} accounts={accounts} transactions={transactions} debts={debts} coupleLink={coupleLink} setCoupleLink={setCoupleLink} onOpenModal={openModal} setActiveTab={setActiveTab} formatCurrency={formatCurrency} />;
            case 'inversion_inicial': return <InversionInicial initialInvestments={initialInvestments} debts={debts} formatCurrency={formatCurrency} onAddInversion={() => openModal('inversion_inicial')} onEditInversion={(inv) => openModal('inversion_inicial', inv)} onRemoveInversion={(id) => openConfirmation('inversion_inicial', id)} t={t} primaryCurrency={primaryCurrency} />;
            case 'lista_compras': return <ShoppingList items={shoppingListItems} onAddItem={() => openModal('shopping_item')} onEditItem={(item) => openModal('shopping_item', item)} onRemoveItem={(id) => openConfirmation('shopping_item', id)} onToggleItem={handleToggleShoppingListItem} formatCurrency={formatCurrency} primaryCurrency={primaryCurrency} t={t} />;
            default: return <Dashboard accounts={accounts} transactions={transactions} debts={debts} recurringTransactions={recurringTransactions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddRecurring={() => openModal('recurring')} primaryCurrency={primaryCurrency} onOpenDetailModal={handleOpenDetailModal} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />;
        }
    };
    
    if (!isFinishedOnboarding) {
        return <OnboardingTour 
            onFinish={() => setIsFinishedOnboarding(true)}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            onAddAccount={(acc) => handleAddOrUpdate(accounts, setAccounts, acc)}
            t={t}
            language={language}
            setLanguage={setLanguage}
            currency={primaryCurrency}
            setCurrency={setPrimaryCurrency}
            userName={userName}
            setUserName={setUserName}
            avatar={avatar}
            setAvatar={setAvatar}
        />
    }

    return (
        <div className={`flex h-screen bg-background dark:bg-background-dark text-text-main dark:text-text-main-dark font-sans`}>
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isNavCollapsed} toggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)} t={t} userName={userName} avatar={avatar} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader activeTab={activeTab} t={t} notifications={notifications} onAvatarClick={() => setIsMobileMenuOpen(true)} userName={userName} avatar={avatar} />
                <main key={activeTab} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 mt-16 md:mt-0 pb-20 md:pb-8 animate-view-fade-in">
                    {isLoading && activeTab === 'dashboard' ? <DashboardSkeleton t={t} /> : renderView()}
                </main>
                <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
            </div>

            {/* Modals */}
            <Modal 
                isOpen={modal === 'transaction'} 
                onClose={closeModal} 
                title={itemToEdit ? t('edit_transaction') : t('add_transaction')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <TransactionForm
                    accounts={accounts}
                    onAddTransaction={handleAddTransaction}
                    onUpdateTransaction={(tx) => handleUpdateTransaction(tx, false)}
                    onClose={closeModal}
                    transactionToEdit={itemToEdit}
                    t={t}
                    onOpenAccountModal={() => openModal('account')}
                    formatCurrency={formatCurrency}
                />
            </Modal>
            <Modal 
                isOpen={modal === 'account'} 
                onClose={closeModal} 
                title={itemToEdit?.id ? t('edit_account') : t('addAccount')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <AccountForm
                    onAddAccount={(acc) => {
                        const newAccount = handleGenericSubmit(accounts, setAccounts, acc, 'account');
                        if (accountFormSuccessCallback) {
                            accountFormSuccessCallback(newAccount);
                            setAccountFormSuccessCallback(null);
                        }
                    }}
                    onUpdateAccount={(acc) => handleGenericSubmit(accounts, setAccounts, acc, 'account')}
                    onClose={closeModal}
                    accountToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal 
                isOpen={modal === 'debt'} 
                onClose={closeModal} 
                title={itemToEdit ? t('edit_debt') : t('addDebt')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                 <DebtForm
                    onAddDebt={(debt) => handleGenericSubmit(debts, setDebts, debt, 'debt')}
                    onUpdateDebt={(debt) => handleGenericSubmit(debts, setDebts, debt, 'debt')}
                    onClose={closeModal}
                    debtToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal 
                isOpen={modal === 'recurring'} 
                onClose={closeModal} 
                title={itemToEdit ? t('edit_recurring') : t('addRecurring')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <RecurringTransactionForm
                    onAddRecurring={(rec) => handleGenericSubmit(recurringTransactions, setRecurringTransactions, rec, 'recurring_item')}
                    onUpdateRecurring={(rec) => handleGenericSubmit(recurringTransactions, setRecurringTransactions, rec, 'recurring_item')}
                    onClose={closeModal}
                    recurringToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
             <Modal 
                isOpen={modal === 'limit'} 
                onClose={closeModal} 
                title={itemToEdit ? t('edit_limit') : t('addLimit')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <LimitForm
                    onAddLimit={(limit) => handleGenericSubmit(limits, setLimits, limit, 'limit')}
                    onUpdateLimit={(limit) => handleGenericSubmit(limits, setLimits, limit, 'limit')}
                    onClose={closeModal}
                    limitToEdit={itemToEdit}
                    t={t}
                    existingCategories={limits.map(l => l.category)}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal
                isOpen={modal === 'inversion_inicial'}
                onClose={closeModal}
                title={itemToEdit ? t('edit_inversion') : t('add_inversion')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <InversionInicialForm
                    onSubmit={handleInvestmentSubmit}
                    onClose={closeModal}
                    investmentToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal
                isOpen={modal === 'shopping_item'}
                onClose={closeModal}
                title={itemToEdit ? t('edit_item') : t('add_item')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <ShoppingItemForm
                    onSubmit={(item) => {
                        handleGenericSubmit(shoppingListItems, setShoppingListItems, { ...item, purchased: false }, 'shopping_item');
                    }}
                    onUpdate={(item) => {
                        handleGenericSubmit(shoppingListItems, setShoppingListItems, item, 'shopping_item');
                    }}
                    onClose={closeModal}
                    itemToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <TransactionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={detailModalContent.title}
                transactions={detailModalContent.transactions}
                accounts={accounts}
                formatCurrency={formatCurrency}
                t={t}
            />


            <ConfirmationModal 
                isOpen={!!itemToRemove}
                onClose={() => setItemToRemove(null)}
                onConfirm={() => itemToRemove && handleRemove(itemToRemove.type, itemToRemove.id)}
                title={t('confirm_delete_title')}
                message={t('confirm_delete_message')}
                t={t}
            />

            <DebtPaymentModal
                isOpen={!!debtToPay}
                onClose={() => setDebtToPay(null)}
                onConfirm={handlePayDebtInstallment}
                debt={debtToPay}
                accounts={accounts}
                t={t}
                formatCurrency={formatCurrency}
            />
            
             <MobileMenu 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                t={t}
                userName={userName}
                avatar={avatar}
            />

            <VoiceTour 
                isOpen={isVoiceTourOpen}
                onFinish={handleFinishVoiceTour}
                t={t}
            />

            <VoiceInputModal 
                isOpen={isVoiceModalOpen}
                onClose={() => setIsVoiceModalOpen(false)}
                onTranscriptReady={handleTranscriptReady}
                t={t}
                lang={language}
            />

            <AccountSelectionModal
                isOpen={isAccountSelectionModalOpen}
                onClose={() => {
                    setIsAccountSelectionModalOpen(false);
                    setPendingVoiceTransactions(null);
                }}
                transactionsData={pendingVoiceTransactions}
                accounts={accounts}
                t={t}
                formatCurrency={formatCurrency}
                onAccountSelect={(accountId) => {
                    if (pendingVoiceTransactions) {
                        const transactionsToAdd = pendingVoiceTransactions.map(({ currency, ...rest }) => rest);
                        addBatchTransactions(transactionsToAdd, accountId);
                    }
                    setIsAccountSelectionModalOpen(false);
                    setPendingVoiceTransactions(null);
                }}
                onEdit={() => {
                    if (!pendingVoiceTransactions || pendingVoiceTransactions.length === 0) return;
                    setIsAccountSelectionModalOpen(false);
                    const { currency, ...rest } = pendingVoiceTransactions[0];
                    openModal('transaction', {
                        ...rest,
                        id: '', // New transaction
                        accountId: accounts[0]?.id || '', // Default account
                        destinationAccountId: undefined,
                    });
                    setPendingVoiceTransactions(null);
                }}
            />

            <CurrencyMismatchModal
                isOpen={isCurrencyMismatchModalOpen}
                onClose={() => {
                    setIsCurrencyMismatchModalOpen(false);
                    setMismatchData(null);
                }}
                detectedCurrency={mismatchData?.detectedCurrency || ''}
                accounts={accounts}
                onConvert={handleConvertTransaction}
                onCreateNew={handleCreateAccountForMismatch}
                t={t}
            />
            
            <DynamicIsland 
                isOpen={isIslandOpen}
                status={islandStatus}
                message={islandMessage}
                onClose={handleCloseIsland}
                showActions={!!lastTransactionAction}
                onUndo={handleUndoAction}
                onEdit={() => {
                    handleEditAction();
                    handleCloseIsland();
                }}
                t={t}
            />

            {/* FABs for adding transaction */}
            <div role="group" aria-label={t('quick_actions')}>
                {/* Voice Input FAB */}
                <button
                    onClick={handleVoiceClick}
                    className="fixed bottom-36 right-5 md:bottom-24 md:right-9 bg-accent hover:opacity-90 text-primary rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-transform transform active:scale-90"
                    title={t('voice_input_title')}
                >
                    <MicIcon className="w-6 h-6" />
                </button>
                {/* Add Transaction FAB */}
                <button
                    onClick={() => openModal('transaction')}
                    className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-primary hover:bg-primary-focus text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform transform active:scale-90"
                    title={t('add_transaction')}
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}

export default App;