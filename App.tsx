import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Tab, Transaction, Account, Debt, Subscription, SpendingLimit, Goal, Notification, Language, ColorTheme, TransactionType, AccountType } from './types';
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
import SubscriptionForm from './components/SubscriptionForm';
import LimitForm from './components/LimitForm';
import GoalForm from './components/GoalForm';
import ConfirmationModal from './components/ConfirmationModal';
import OnboardingTour from './components/OnboardingTour';
import VoiceInputModal from './components/VoiceInputModal';
import DynamicIsland from './components/DynamicIsland';
import Confetti from './components/Confetti';

import Dashboard from './views/Dashboard';
import Accounts from './views/Accounts';
import Debts from './views/Debts';
import Subscriptions from './views/Subscriptions';
import Limits from './views/Limits';
import Goals from './views/Goals';
import History from './views/History';
import Analysis from './views/Analysis';
import Calendar from './views/Calendar';
import Export from './views/Export';
import Settings from './views/Settings';
import FollowUpModal from './components/FollowUpModal';
import { MicIcon, PlusIcon } from './components/icons';


const App: React.FC = () => {
    // Global Settings
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [primaryCurrency, setPrimaryCurrency] = useLocalStorage<string>('primary-currency', 'USD');
    const [userName, setUserName] = useLocalStorage<string>('user-name', 'Guest');
    const [avatar, setAvatar] = useLocalStorage<string>('user-avatar', avatars[0]);
    const [theme, toggleTheme] = useTheme();
    const [colorTheme, setColorTheme] = useColorTheme();
    const [isFinishedOnboarding, setIsFinishedOnboarding] = useLocalStorage('onboarding-finished', false);

    // Main App State
    const [isNavCollapsed, setIsNavCollapsed] = useLocalStorage('nav-collapsed', false);
    const [activeTab, setActiveTab] = useLocalStorage<Tab>('active-tab', 'dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data State
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
    const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', []);
    const [limits, setLimits] = useLocalStorage<SpendingLimit[]>('limits', []);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);

    // Modal & Editing State
    const [modal, setModal] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [itemToRemove, setItemToRemove] = useState<{ type: string, id: string } | null>(null);

    // Voice Input State
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isIslandOpen, setIsIslandOpen] = useState(false);
    const [islandStatus, setIslandStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [islandMessage, setIslandMessage] = useState('');
    const [scrollToTransactionId, setScrollToTransactionId] = useState<string | null>(null);


    // Goal Completion State
    const [showConfetti, setShowConfetti] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

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
        if (dataMigrationRan.current || !primaryCurrency) return;
    
        const migrate = (items: any[], setter: React.Dispatch<React.SetStateAction<any[]>>, key: string) => {
            let needsUpdate = false;
            const updatedItems = items.map(item => {
                if (item && typeof item === 'object' && !item.currency) {
                    needsUpdate = true;
                    return { ...item, currency: primaryCurrency };
                }
                return item;
            });
    
            if (needsUpdate) {
                console.log(`Running data migration for '${key}': setting missing currency.`);
                setter(updatedItems);
            }
        };
        
        migrate(accounts, setAccounts, 'accounts');
        migrate(debts, setDebts, 'debts');
        migrate(subscriptions, setSubscriptions, 'subscriptions');
        migrate(limits, setLimits, 'limits');
        migrate(goals, setGoals, 'goals');
    
        dataMigrationRan.current = true;
    // We only want this to run once when the app loads and has the primary currency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryCurrency, accounts, debts, subscriptions, limits, goals]);

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

    // CRUD Handlers
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

    const handleRemove = (type: string, id: string) => {
        const setters: { [key: string]: React.Dispatch<any> } = {
            account: setAccounts,
            transaction: setTransactions,
            debt: setDebts,
            subscription: setSubscriptions,
            limit: setLimits,
            goal: setGoals
        };
        const items: { [key: string]: any[] } = {
            account: accounts,
            transaction: transactions,
            debt: debts,
            subscription: subscriptions,
            limit: limits,
            goal: goals
        };
        if (setters[type]) {
            setters[type](items[type].filter((item: any) => item.id !== id));
            // Cascade delete transactions if account is removed
            if (type === 'account') {
                setTransactions(transactions.filter(t => t.accountId !== id));
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

    const openConfirmation = (type: string, id: string) => {
        setItemToRemove({ type, id });
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

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Parse the following text into a transaction. The user's primary currency is ${primaryCurrency}. Today is ${new Date().toLocaleDateString()}. Text: "${transcript}"`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema,
                    systemInstruction: `You are a financial assistant. Parse the user's voice input into a structured JSON transaction. Available expense categories: Food, Transport, Housing, Entertainment, Health, Shopping, Utilities, Other. Available income categories: Salary, Freelance, Gifts, Investments, Other. Infer the category. Default to 'Other' if unsure.`,
                },
            });

            const jsonStr = response.text.trim();
            const parsed = JSON.parse(jsonStr);

            if (parsed.amount && parsed.description && parsed.category && parsed.type) {
                const newTransaction: Omit<Transaction, 'id'> = {
                    amount: Math.abs(parsed.amount),
                    description: parsed.description,
                    category: parsed.category,
                    type: parsed.type as TransactionType,
                    accountId: accounts[0]?.id || '',
                    date: new Date().toISOString().split('T')[0],
                };
                if (!accounts.length) {
                    throw new Error("No account available to add transaction to.");
                }
                const newTransactionWithId = handleAddOrUpdate(transactions, setTransactions, newTransaction);
                setIslandStatus('success');
                setIslandMessage(t('voice_success'));
                playTone('success');

                if (window.innerWidth < 768) {
                    setScrollToTransactionId(newTransactionWithId.id);
                }
            } else {
                throw new Error('Invalid transaction data from AI');
            }
        } catch (error) {
            console.error('Error processing transcript with AI:', error);
            setIslandStatus('error');
            setIslandMessage(t('voice_error'));
            playTone('error');
        }
    };


    const renderView = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} primaryCurrency={primaryCurrency} />;
            case 'accounts': return <Accounts accounts={accounts} formatCurrency={formatCurrency} onAddAccount={() => openModal('account')} onEditAccount={(acc) => openModal('account', acc)} onRemoveAccount={(id) => openConfirmation('account', id)} t={t} />;
            case 'debts': return <Debts debts={debts} formatCurrency={formatCurrency} onAddDebt={() => openModal('debt')} onEditDebt={(debt) => openModal('debt', debt)} onRemoveDebt={(id) => openConfirmation('debt', id)} t={t} />;
            case 'subscriptions': return <Subscriptions subscriptions={subscriptions} formatCurrency={formatCurrency} onAddSubscription={() => openModal('subscription')} onEditSubscription={(sub) => openModal('subscription', sub)} onRemoveSubscription={(id) => openConfirmation('subscription', id)} t={t} />;
            case 'limits': return <Limits limits={limits} transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onAddLimit={() => openModal('limit')} onEditLimit={(limit) => openModal('limit', limit)} onRemoveLimit={(id) => openConfirmation('limit', id)} t={t} />;
            case 'goals': return <Goals goals={goals} formatCurrency={formatCurrency} onAddGoal={() => openModal('goal')} onEditGoal={(goal) => openModal('goal', goal)} onRemoveGoal={(id) => openConfirmation('goal', id)} t={t} primaryCurrency={primaryCurrency} />;
            case 'history': return <History transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onEditTransaction={(tr) => openModal('transaction', tr)} onRemoveTransaction={(id) => openConfirmation('transaction', id)} t={t} />;
            case 'analysis': return <Analysis transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} t={t} colorTheme={colorTheme} primaryCurrency={primaryCurrency} />;
            case 'calendar': return <Calendar accounts={accounts} debts={debts} subscriptions={subscriptions} formatCurrency={formatCurrency} t={t} />;
            case 'export': return <Export transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} t={t} userName={userName} colorTheme={colorTheme} />;
            case 'settings': return <Settings theme={theme} toggleTheme={toggleTheme} currency={primaryCurrency} setCurrency={setPrimaryCurrency} language={language} setLanguage={setLanguage} colorTheme={colorTheme} setColorTheme={setColorTheme} avatar={avatar} setAvatar={setAvatar} userName={userName} setUserName={setUserName} t={t} />;
            default: return <Dashboard accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} primaryCurrency={primaryCurrency} />;
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
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 mt-16 md:mt-0 pb-20 md:pb-8">
                    {renderView()}
                </main>
                <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
            </div>

            {/* Modals */}
            <Modal isOpen={modal === 'transaction'} onClose={closeModal} title={itemToEdit ? t('edit_transaction') : t('add_transaction')}>
                <TransactionForm
                    accounts={accounts}
                    onAddTransaction={(tr) => handleAddOrUpdate(transactions, setTransactions, tr)}
                    onUpdateTransaction={(tr) => handleAddOrUpdate(transactions, setTransactions, tr)}
                    onClose={closeModal}
                    transactionToEdit={itemToEdit}
                    t={t}
                />
            </Modal>
            <Modal isOpen={modal === 'account'} onClose={closeModal} title={itemToEdit ? t('edit_account') : t('addAccount')}>
                <AccountForm
                    onAddAccount={(acc) => handleAddOrUpdate(accounts, setAccounts, acc)}
                    onUpdateAccount={(acc) => handleAddOrUpdate(accounts, setAccounts, acc)}
                    onClose={closeModal}
                    accountToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal isOpen={modal === 'debt'} onClose={closeModal} title={itemToEdit ? t('edit_debt') : t('addDebt')}>
                 <DebtForm
                    onAddDebt={(debt) => handleAddOrUpdate(debts, setDebts, debt)}
                    onUpdateDebt={(debt) => handleAddOrUpdate(debts, setDebts, debt)}
                    onClose={closeModal}
                    debtToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal isOpen={modal === 'subscription'} onClose={closeModal} title={itemToEdit ? t('edit_subscription') : t('addSubscription')}>
                <SubscriptionForm
                    onAddSubscription={(sub) => handleAddOrUpdate(subscriptions, setSubscriptions, sub)}
                    onUpdateSubscription={(sub) => handleAddOrUpdate(subscriptions, setSubscriptions, sub)}
                    onClose={closeModal}
                    subscriptionToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
             <Modal isOpen={modal === 'limit'} onClose={closeModal} title={itemToEdit ? t('edit_limit') : t('addLimit')}>
                <LimitForm
                    onAddLimit={(limit) => handleAddOrUpdate(limits, setLimits, limit)}
                    onUpdateLimit={(limit) => handleAddOrUpdate(limits, setLimits, limit)}
                    onClose={closeModal}
                    limitToEdit={itemToEdit}
                    t={t}
                    existingCategories={limits.map(l => l.category)}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
             <Modal isOpen={modal === 'goal'} onClose={closeModal} title={itemToEdit ? t('edit_goal') : t('addGoal')}>
                <GoalForm
                    onAddGoal={(goal) => handleAddOrUpdate(goals, setGoals, goal)}
                    onUpdateGoal={(goal) => handleAddOrUpdate(goals, setGoals, goal)}
                    onClose={closeModal}
                    goalToEdit={itemToEdit}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>

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

            <VoiceInputModal 
                isOpen={isVoiceModalOpen}
                onClose={() => setIsVoiceModalOpen(false)}
                onTranscriptReady={handleTranscriptReady}
                t={t}
                lang={language}
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
                    onClick={() => setIsVoiceModalOpen(true)}
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