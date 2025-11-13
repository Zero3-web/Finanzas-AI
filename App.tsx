import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Tab, Transaction, Account, Debt, RecurringTransaction, SpendingLimit, Goal, Notification, Language, ColorTheme, TransactionType, AccountType, CoupleLink } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useColorTheme } from './hooks/useColorTheme';
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
import GoalForm from './components/GoalForm';
import ConfirmationModal from './components/ConfirmationModal';
import OnboardingTour from './components/OnboardingTour';
import VoiceInputModal from './components/VoiceInputModal';
import VoiceTour from './components/VoiceTour';
import DynamicIsland from './components/DynamicIsland';
import Confetti from './components/Confetti';
import TransactionDetailModal from './components/TransactionDetailModal';
import VoiceTransactionConfirmationModal from './components/VoiceTransactionConfirmationModal';

import Dashboard from './views/Dashboard';
import Accounts from './views/Accounts';
import Debts from './views/Debts';
import Recurring from './views/Subscriptions';
import Limits from './views/Limits';
import Goals from './views/Goals';
import History from './views/History';
import Analysis from './views/Analysis';
import Calendar from './views/Calendar';
import Settings from './views/Settings';
import Wellness from './views/Wellness';
import FollowUpModal from './components/FollowUpModal';
import { MicIcon, PlusIcon } from './components/icons';
import DashboardSkeleton from './components/DashboardSkeleton';


const App: React.FC = () => {
    // Global Settings
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [primaryCurrency, setPrimaryCurrency] = useLocalStorage<string>('primary-currency', 'USD');
    const [userName, setUserName] = useLocalStorage<string>('user-name', 'Guest');
    const [avatar, setAvatar] = useLocalStorage<string>('user-avatar', avatars[0]);
    const [theme, toggleTheme] = useTheme();
    const [colorTheme, setColorTheme] = useColorTheme();
    const [isFinishedOnboarding, setIsFinishedOnboarding] = useLocalStorage('onboarding-finished', false);
    const [hasShownWelcomeConfetti, setHasShownWelcomeConfetti] = useLocalStorage('welcome-confetti-shown', false);
    const [coupleLink, setCoupleLink] = useLocalStorage<CoupleLink>('couple-link', { linked: false, partnerName: null, linkId: null });

    // Main App State
    const [isNavCollapsed, setIsNavCollapsed] = useLocalStorage('nav-collapsed', false);
    const [activeTab, setActiveTab] = useLocalStorage<Tab>('active-tab', 'dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    // Data State
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
    const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurringTransactions', []);
    const [limits, setLimits] = useLocalStorage<SpendingLimit[]>('limits', []);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
    const [lastAutoProcessDate, setLastAutoProcessDate] = useLocalStorage<string>('last-auto-process-date', '');


    // Modal & Editing State
    const [modal, setModal] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [itemToRemove, setItemToRemove] = useState<{ type: string, id: string } | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailModalContent, setDetailModalContent] = useState<{ title: string; transactions: Transaction[] }>({ title: '', transactions: [] });
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);


    // Voice Input State
    const [isVoiceTourFinished, setIsVoiceTourFinished] = useLocalStorage('voice-tour-finished', false);
    const [isVoiceTourOpen, setIsVoiceTourOpen] = useState(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isVoiceConfirmationModalOpen, setIsVoiceConfirmationModalOpen] = useState(false);
    const [pendingVoiceTransaction, setPendingVoiceTransaction] = useState<Omit<Transaction, 'id' | 'accountId'> | null>(null);
    const [isIslandOpen, setIsIslandOpen] = useState(false);
    const [islandStatus, setIslandStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [islandMessage, setIslandMessage] = useState('');
    const [scrollToTransactionId, setScrollToTransactionId] = useState<string | null>(null);


    // Goal Completion State
    const [showConfetti, setShowConfetti] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isFinishedOnboarding && !hasShownWelcomeConfetti) {
            setShowConfetti(true);
            setHasShownWelcomeConfetti(true);
            setTimeout(() => setShowConfetti(false), 8000); // Confetti lasts 8 seconds
        }
    }, [isFinishedOnboarding, hasShownWelcomeConfetti, setHasShownWelcomeConfetti]);

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
        migrateCurrency(goals, setGoals, 'goals');
    
        dataMigrationRan.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryCurrency]);

    // Automatic Monthly Processing
    useEffect(() => {
        const today = new Date();
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
    }, []);


    // Notifications
    const notifications = useMemo<Notification[]>(() => {
        const today = new Date();
        const upcoming: Notification[] = [];
        const sevenDaysFromNow = new Date();
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
    }, [debts, accounts, t]);

    // Transaction-specific CRUD handlers
    const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>): Transaction => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: `${new Date().toISOString()}-${Math.random().toString(36).substr(2, 9)}`,
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
        
        setIslandStatus('success');
        setIslandMessage(newTransaction.type === TransactionType.TRANSFER ? t('transfer_successful') : t('voice_success'));
        playTone('success');
        setIsIslandOpen(true);

        if (window.innerWidth < 768) {
            setScrollToTransactionId(newTransaction.id);
        }

        return newTransaction;
    };

    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
        const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (!originalTransaction) return;

        setIsFormSubmitting(true);

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
        
        setIslandStatus('success');
        setIslandMessage(t('transaction_updated'));
        playTone('success');
        setIsIslandOpen(true);
    };

    // Generic CRUD Handlers
    const handleAddOrUpdate = <T extends { id: string }>(items: T[], setItems: (items: T[]) => void, newItem: Omit<T, 'id'> | T): T => {
        let result: T;
        if ('id' in newItem) { // Update
            result = newItem as T;
            setItems(items.map(item => (item.id === result.id ? result : item)));
        } else { // Add
            result = { ...newItem, id: new Date().toISOString() } as T;
            setItems([...items, result]);
        }
        return result;
    };

    const handleGenericSubmit = <T extends { id: string }>(
        items: T[],
        setItems: (items: T[]) => void,
        newItem: Omit<T, 'id'> | T,
        entityNameKey: 'account' | 'debt' | 'recurring_item' | 'limit' | 'goal'
    ) => {
        setIsFormSubmitting(true);
        const isEditing = 'id' in newItem;
        
        handleAddOrUpdate(items, setItems, newItem);

        setIslandStatus('success');
        const successMessageKey = isEditing ? 'item_updated_successfully' : 'item_added_successfully';
        setIslandMessage(t(successMessageKey, { item: t(entityNameKey) }));
        playTone('success');
        setIsIslandOpen(true);
    };


    const handleRemove = (type: string, id: string) => {
        const setters: { [key: string]: React.Dispatch<any> } = {
            account: setAccounts,
            transaction: setTransactions,
            debt: setDebts,
            recurring: setRecurringTransactions,
            limit: setLimits,
            goal: setGoals
        };
        const items: { [key: string]: any[] } = {
            account: accounts,
            transaction: transactions,
            debt: debts,
            recurring: recurringTransactions,
            limit: limits,
            goal: goals
        };
        
        if (type === 'transaction') {
            const transactionToRemove = transactions.find(t => t.id === id);
            if (transactionToRemove) {
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
        setItemToRemove(null);
    };

    // Modal Open/Close Handlers
    const openModal = (name: string, item: any = null) => {
        setItemToEdit(item);
        setModal(name);
    };

    const closeModal = () => {
        setModal(null);
        setItemToEdit(null);
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


    // Goal Completion Effect
    useEffect(() => {
        goals.forEach(goal => {
            if (goal.savedAmount >= goal.targetAmount) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 8000); // Confetti lasts 8 seconds
            }
        });
    }, [goals]);

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
                    amount: { type: Type.NUMBER, description: "The transaction amount as a number." },
                    description: { type: Type.STRING, description: "A brief description of the transaction." },
                    category: { type: Type.STRING, description: "The category of the transaction." },
                    type: { type: Type.STRING, enum: ['income', 'expense'], description: "The type of transaction, either 'income' or 'expense'." },
                },
                required: ['amount', 'description', 'category', 'type'],
            };

            const prompt = t('voice_prompt', {
                currency: primaryCurrency,
                date: new Date().toLocaleDateString(language),
                transcript: transcript,
            });

            const systemInstruction = t('voice_system_instruction', {
                expense_categories: expenseCategories.join(', '),
                income_categories: incomeCategories.join(', '),
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

            if (parsed.amount && parsed.description && parsed.category && parsed.type) {
                if (!accounts.length) {
                    throw new Error("No account available to add transaction to.");
                }
                const pendingTransaction: Omit<Transaction, 'id' | 'accountId'> = {
                    amount: Math.abs(parsed.amount),
                    description: parsed.description,
                    category: parsed.category,
                    type: parsed.type as TransactionType,
                    date: new Date().toISOString().split('T')[0],
                };
                
                setPendingVoiceTransaction(pendingTransaction);
                setIsVoiceConfirmationModalOpen(true);
                setIsIslandOpen(false); // Hide island as modal is opening
            } else {
                throw new Error('Invalid transaction data from AI');
            }
        } catch (error) {
            console.error('Error processing transcript with AI:', error);
            setIslandStatus('error');
            setIslandMessage(t('voice_error'));
            playTone('error');
            setIsIslandOpen(true);
        }
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


    const renderView = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} debts={debts} recurringTransactions={recurringTransactions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddRecurring={() => openModal('recurring')} primaryCurrency={primaryCurrency} onOpenDetailModal={handleOpenDetailModal} />;
            case 'accounts': return <Accounts accounts={accounts} formatCurrency={formatCurrency} onAddAccount={() => openModal('account')} onEditAccount={(acc) => openModal('account', acc)} onRemoveAccount={(id) => openConfirmation('account', id)} t={t} />;
            case 'debts': return <Debts debts={debts} formatCurrency={formatCurrency} onAddDebt={() => openModal('debt')} onEditDebt={(debt) => openModal('debt', debt)} onRemoveDebt={(id) => openConfirmation('debt', id)} t={t} />;
            case 'recurring': return <Recurring recurringTransactions={recurringTransactions} formatCurrency={formatCurrency} onAddRecurring={() => openModal('recurring')} onEditRecurring={(rec) => openModal('recurring', rec)} onRemoveRecurring={(id) => openConfirmation('recurring', id)} t={t} />;
            case 'limits': return <Limits limits={limits} transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onAddLimit={() => openModal('limit')} onEditLimit={(limit) => openModal('limit', limit)} onRemoveLimit={(id) => openConfirmation('limit', id)} t={t} />;
            case 'goals': return <Goals goals={goals} formatCurrency={formatCurrency} onAddGoal={() => openModal('goal')} onEditGoal={(goal) => openModal('goal', goal)} onRemoveGoal={(id) => openConfirmation('goal', id)} t={t} primaryCurrency={primaryCurrency} />;
            case 'history': return <History transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onEditTransaction={(tr) => openModal('transaction', tr)} onRemoveTransaction={(id) => openConfirmation('transaction', id)} t={t} />;
            case 'analysis': return <Analysis transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} t={t} colorTheme={colorTheme} primaryCurrency={primaryCurrency} onOpenDetailModal={handleOpenDetailModal} />;
            case 'calendar': return <Calendar accounts={accounts} debts={debts} recurringTransactions={recurringTransactions} formatCurrency={formatCurrency} t={t} />;
            case 'settings': return <Settings theme={theme} toggleTheme={toggleTheme} currency={primaryCurrency} setCurrency={setPrimaryCurrency} language={language} setLanguage={setLanguage} colorTheme={colorTheme} setColorTheme={setColorTheme} avatar={avatar} setAvatar={setAvatar} userName={userName} setUserName={setUserName} t={t} accounts={accounts} transactions={transactions} debts={debts} coupleLink={coupleLink} setCoupleLink={setCoupleLink} onOpenModal={openModal} setActiveTab={setActiveTab} formatCurrency={formatCurrency} />;
            case 'wellness': return <Wellness transactions={transactions} accounts={accounts} debts={debts} t={t} colorTheme={colorTheme} />;
            default: return <Dashboard accounts={accounts} transactions={transactions} debts={debts} recurringTransactions={recurringTransactions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddRecurring={() => openModal('recurring')} primaryCurrency={primaryCurrency} onOpenDetailModal={handleOpenDetailModal} />;
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
            {showConfetti && <Confetti />}
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
                    onUpdateTransaction={handleUpdateTransaction}
                    onClose={closeModal}
                    transactionToEdit={itemToEdit}
                    t={t}
                    onOpenAccountModal={() => openModal('account')}
                />
            </Modal>
            <Modal 
                isOpen={modal === 'account'} 
                onClose={closeModal} 
                title={itemToEdit ? t('edit_account') : t('addAccount')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <AccountForm
                    onAddAccount={(acc) => handleGenericSubmit(accounts, setAccounts, acc, 'account')}
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
                isOpen={modal === 'goal'} 
                onClose={closeModal} 
                title={itemToEdit ? t('edit_goal') : t('addGoal')}
                isExiting={isFormSubmitting}
                onExitComplete={handleModalExitComplete}
            >
                <GoalForm
                    onAddGoal={(goal) => handleGenericSubmit(goals, setGoals, goal, 'goal')}
                    onUpdateGoal={(goal) => handleGenericSubmit(goals, setGoals, goal, 'goal')}
                    onClose={closeModal}
                    goalToEdit={itemToEdit}
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

            <VoiceTransactionConfirmationModal
                isOpen={isVoiceConfirmationModalOpen}
                onClose={() => {
                    setIsVoiceConfirmationModalOpen(false);
                    setPendingVoiceTransaction(null);
                }}
                transactionData={pendingVoiceTransaction}
                accounts={accounts}
                t={t}
                formatCurrency={formatCurrency}
                onConfirm={(transactionDataWithAccount) => {
                    setIsVoiceConfirmationModalOpen(false);
                    setPendingVoiceTransaction(null);
                    handleAddTransaction(transactionDataWithAccount);
                }}
                onEdit={() => {
                    if (!pendingVoiceTransaction) return;
                    setIsVoiceConfirmationModalOpen(false);
                    openModal('transaction', {
                        ...pendingVoiceTransaction,
                        id: '', // New transaction
                        accountId: accounts[0]?.id || '', // Default account
                        destinationAccountId: undefined,
                    });
                    setPendingVoiceTransaction(null);
                }}
            />
            
            <DynamicIsland 
                isOpen={isIslandOpen}
                status={islandStatus}
                message={islandMessage}
                onClose={() => setIsIslandOpen(false)}
            />

            <FollowUpModal
                isOpen={isFollowUpModalOpen}
                onClose={() => setIsFollowUpModalOpen(false)}
                onAsk={(q) => console.log('Follow up:', q)}
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