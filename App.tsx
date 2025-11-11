import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useColorTheme } from './hooks/useColorTheme';
import { translations } from './utils/translations';
import { Tab, Account, Transaction, Debt, Subscription, SpendingLimit, Goal, Notification, Language, ColorTheme, TransactionType } from './types';
import Navigation from './components/Navigation';
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
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import AccountForm from './components/AccountForm';
import DebtForm from './components/DebtForm';
import SubscriptionForm from './components/SubscriptionForm';
import LimitForm from './components/LimitForm';
import GoalForm from './components/GoalForm';
import ConfirmationModal from './components/ConfirmationModal';
import OnboardingTour from './components/OnboardingTour';
import { avatars } from './utils/avatars';
import Confetti from './components/Confetti';
import { PlusIcon } from './components/icons';
import useLongPress from './hooks/useLongPress';
import { playTone } from './utils/audio';
import VoiceInputModal from './components/VoiceInputModal';
import DynamicIsland from './components/DynamicIsland';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import MobileMenu from './components/MobileMenu';

const App: React.FC = () => {
    const [theme, toggleTheme] = useTheme();
    const [colorTheme, setColorTheme] = useColorTheme();
    const [isNavCollapsed, setIsNavCollapsed] = useLocalStorage('navCollapsed', false);
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [primaryCurrency, setPrimaryCurrency] = useLocalStorage('primaryCurrency', 'USD');
    const [userName, setUserName] = useLocalStorage('userName', 'Olivia');
    const [avatar, setAvatar] = useLocalStorage('userAvatar', avatars[0]);

    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
    const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', []);
    const [limits, setLimits] = useLocalStorage<SpendingLimit[]>('limits', []);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [activeTab, setActiveTab] = useLocalStorage<Tab>('activeTab', 'dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Modal States
    const [modal, setModal] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [itemToRemove, setItemToRemove] = useState<{ type: string; id: string } | null>(null);

    // Onboarding
    const [showOnboarding, setShowOnboarding] = useLocalStorage('showOnboarding', true);
    const [showConfetti, setShowConfetti] = useState(false);

    // Voice Input & Feedback
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [islandState, setIslandState] = useState<{ isOpen: boolean; status: 'processing' | 'success' | 'error'; message?: string }>({ isOpen: false, status: 'processing' });
    
    const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
        const lang = translations[language] || translations.en;
        let str = lang[key] || key;
        if (params) {
            Object.keys(params).forEach(pKey => {
                str = str.replace(`{${pKey}}`, String(params[pKey]));
            });
        }
        return str;
    }, [language]);
    
    const formatCurrency = useCallback((amount: number, currency: string) => {
        return new Intl.NumberFormat(language, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
    }, [language]);

    // Data Management Functions
    const addItem = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: Omit<T, 'id'>) => {
        setter(prev => [...prev, { ...item, id: crypto.randomUUID() } as T]);
    };
    const updateItem = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, updatedItem: T) => {
        setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    };
    const removeItem = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
        setter(prev => prev.filter(item => item.id !== id));
    };
    
    // Handlers
    const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
        addItem(setTransactions, transaction);
        setAccounts(prev => prev.map(acc => {
            if (acc.id === transaction.accountId) {
                const amount = transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount;
                return { ...acc, balance: acc.balance + amount };
            }
            return acc;
        }));
    };
    const handleUpdateTransaction = (transaction: Transaction) => updateItem(setTransactions, transaction); // Note: Recalculating balance on update is complex and omitted for brevity
    const handleRemoveTransaction = (id: string) => removeItem(setTransactions, id);

    const handleAddAccount = (account: Omit<Account, 'id'>) => addItem(setAccounts, account);
    const handleUpdateAccount = (account: Account) => updateItem(setAccounts, account);
    const handleRemoveAccount = (id: string) => removeItem(setAccounts, id);

    const handleAddDebt = (debt: Omit<Debt, 'id'>) => addItem(setDebts, debt);
    const handleUpdateDebt = (debt: Debt) => updateItem(setDebts, debt);
    const handleRemoveDebt = (id: string) => removeItem(setDebts, id);
    
    const handleAddSubscription = (sub: Omit<Subscription, 'id'>) => addItem(setSubscriptions, sub);
    const handleUpdateSubscription = (sub: Subscription) => updateItem(setSubscriptions, sub);
    const handleRemoveSubscription = (id: string) => removeItem(setSubscriptions, id);

    const handleAddLimit = (limit: Omit<SpendingLimit, 'id'>) => addItem(setLimits, limit);
    const handleUpdateLimit = (limit: SpendingLimit) => updateItem(setLimits, limit);
    const handleRemoveLimit = (id: string) => removeItem(setLimits, id);

    const handleAddGoal = (goal: Omit<Goal, 'id'>) => addItem(setGoals, goal);
    const handleUpdateGoal = (goal: Goal) => updateItem(setGoals, goal);
    const handleRemoveGoal = (id: string) => removeItem(setGoals, id);

    // Modal Openers
    const openModal = (type: string, item?: any) => {
        setItemToEdit(item);
        setModal(type);
    };

    const openConfirmationModal = (type: string, id: string) => {
        setItemToRemove({ type, id });
    };

    const handleConfirmRemove = () => {
        if (!itemToRemove) return;
        const { type, id } = itemToRemove;
        switch (type) {
            case 'transaction': handleRemoveTransaction(id); break;
            case 'account': handleRemoveAccount(id); break;
            case 'debt': handleRemoveDebt(id); break;
            case 'subscription': handleRemoveSubscription(id); break;
            case 'limit': handleRemoveLimit(id); break;
            case 'goal': handleRemoveGoal(id); break;
        }
        setItemToRemove(null);
    };

    const handleFinishOnboarding = () => {
        setShowOnboarding(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    }
    
    const longPressEvents = useLongPress(() => {
        playTone('start');
        setIsVoiceModalOpen(true);
    }, () => openModal('transaction'));

    useEffect(() => {
        const today = new Date();
        const upcomingNotifications: Notification[] = [];
        // Debts
        debts.forEach(d => {
            const dueDate = new Date(d.nextPaymentDate);
            const daysUntil = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
            if (daysUntil <= 7 && daysUntil >= 0) {
                upcomingNotifications.push({ id: `debt-${d.id}`, message: `${t('paymentFor')} ${d.name}`, dueDate: d.nextPaymentDate, type: 'debt' });
            }
        });
        setNotifications(upcomingNotifications);
    }, [debts, accounts, subscriptions, t]);
    
    const viewProps = { formatCurrency, t };

    const CurrentView = useMemo(() => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard {...viewProps} accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} primaryCurrency={primaryCurrency} />;
            case 'accounts': return <Accounts {...viewProps} accounts={accounts} onAddAccount={() => openModal('account')} onEditAccount={(acc) => openModal('account', acc)} onRemoveAccount={(id) => openConfirmationModal('account', id)} />;
            case 'debts': return <Debts {...viewProps} debts={debts} onAddDebt={() => openModal('debt')} onEditDebt={(debt) => openModal('debt', debt)} onRemoveDebt={(id) => openConfirmationModal('debt', id)} />;
            case 'subscriptions': return <Subscriptions {...viewProps} subscriptions={subscriptions} onAddSubscription={() => openModal('subscription')} onEditSubscription={(sub) => openModal('subscription', sub)} onRemoveSubscription={(id) => openConfirmationModal('subscription', id)} />;
            case 'limits': return <Limits {...viewProps} limits={limits} transactions={transactions} accounts={accounts} onAddLimit={() => openModal('limit')} onEditLimit={(limit) => openModal('limit', limit)} onRemoveLimit={(id) => openConfirmationModal('limit', id)} />;
            case 'goals': return <Goals {...viewProps} goals={goals} onAddGoal={() => openModal('goal')} onEditGoal={(goal) => openModal('goal', goal)} onRemoveGoal={(id) => openConfirmationModal('goal', id)} primaryCurrency={primaryCurrency} />;
            case 'history': return <History {...viewProps} transactions={transactions} accounts={accounts} onEditTransaction={(tr) => openModal('transaction', tr)} onRemoveTransaction={(id) => openConfirmationModal('transaction', id)} />;
            case 'analysis': return <Analysis {...viewProps} transactions={transactions} accounts={accounts} colorTheme={colorTheme} primaryCurrency={primaryCurrency} />;
            case 'calendar': return <Calendar {...viewProps} accounts={accounts} debts={debts} subscriptions={subscriptions} />;
            case 'export': return <Export {...viewProps} transactions={transactions} accounts={accounts} userName={userName} colorTheme={colorTheme} />;
            case 'settings': return <Settings {...viewProps} theme={theme} toggleTheme={toggleTheme} currency={primaryCurrency} setCurrency={setPrimaryCurrency} language={language} setLanguage={setLanguage} colorTheme={colorTheme} setColorTheme={setColorTheme} avatar={avatar} setAvatar={setAvatar} userName={userName} setUserName={setUserName} />;
            default: return <Dashboard {...viewProps} accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} primaryCurrency={primaryCurrency} />;
        }
    }, [activeTab, viewProps, accounts, transactions, debts, subscriptions, limits, goals, theme, toggleTheme, colorTheme, notifications, userName, avatar, primaryCurrency, language, setPrimaryCurrency, setLanguage, setColorTheme, setAvatar, setUserName]);

    if (showOnboarding) {
        return <OnboardingTour
            onFinish={handleFinishOnboarding}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            onAddAccount={handleAddAccount}
            t={t}
            language={language}
            setLanguage={setLanguage}
            currency={primaryCurrency}
            setCurrency={setPrimaryCurrency}
            userName={userName}
            setUserName={setUserName}
            avatar={avatar}
            setAvatar={setAvatar}
        />;
    }

    return (
        <div className={`flex h-screen bg-background dark:bg-background-dark text-text-main dark:text-text-main-dark`}>
            {showConfetti && <Confetti />}
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isNavCollapsed} toggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)} t={t} userName={userName} avatar={avatar} />
            <MobileHeader activeTab={activeTab} t={t} notifications={notifications} userName={userName} avatar={avatar} onAvatarClick={() => setIsMobileMenuOpen(true)} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 md:p-6 p-4 pt-20 md:pt-6 pb-24 md:pb-6 ${!isNavCollapsed && 'md:ml-64'}`}>
                {CurrentView}
            </main>

            <div className="fixed bottom-6 right-6 z-30 md:hidden">
                <button {...longPressEvents} className="bg-primary hover:bg-primary-focus text-white rounded-full p-4 shadow-lg flex items-center justify-center">
                    <PlusIcon className="w-8 h-8"/>
                </button>
            </div>
            <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} t={t}/>

            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} setActiveTab={setActiveTab} t={t} userName={userName} avatar={avatar} />

            {/* Modals */}
            <Modal isOpen={!!modal} onClose={() => setModal(null)} title={t(`modal_title_${modal}`)}>
                {modal === 'transaction' && <TransactionForm accounts={accounts} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onClose={() => setModal(null)} transactionToEdit={itemToEdit} t={t} />}
                {modal === 'account' && <AccountForm onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onClose={() => setModal(null)} accountToEdit={itemToEdit} t={t} primaryCurrency={primaryCurrency} />}
                {modal === 'debt' && <DebtForm onAddDebt={handleAddDebt} onUpdateDebt={handleUpdateDebt} onClose={() => setModal(null)} debtToEdit={itemToEdit} t={t} primaryCurrency={primaryCurrency} />}
                {modal === 'subscription' && <SubscriptionForm onAddSubscription={handleAddSubscription} onUpdateSubscription={handleUpdateSubscription} onClose={() => setModal(null)} subscriptionToEdit={itemToEdit} t={t} primaryCurrency={primaryCurrency}/>}
                {modal === 'limit' && <LimitForm onAddLimit={handleAddLimit} onUpdateLimit={handleUpdateLimit} onClose={() => setModal(null)} limitToEdit={itemToEdit} t={t} existingCategories={limits.map(l => l.category)} primaryCurrency={primaryCurrency} />}
                {modal === 'goal' && <GoalForm onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onClose={() => setModal(null)} goalToEdit={itemToEdit} t={t} primaryCurrency={primaryCurrency} />}
            </Modal>
            
            <ConfirmationModal 
                isOpen={!!itemToRemove}
                onClose={() => setItemToRemove(null)}
                onConfirm={handleConfirmRemove}
                title={t('confirm_delete_title')}
                message={t('confirm_delete_message')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />

            <VoiceInputModal 
                isOpen={isVoiceModalOpen}
                onClose={() => setIsVoiceModalOpen(false)}
                onSuccess={(transaction) => {
                    handleAddTransaction(transaction);
                    setIslandState({ isOpen: true, status: 'success', message: t('transaction_added') });
                }}
                onError={(error) => {
                     setIslandState({ isOpen: true, status: 'error', message: error });
                }}
                accounts={accounts}
                t={t}
            />
            
            <DynamicIsland 
                isOpen={islandState.isOpen}
                status={islandState.status}
                message={islandState.message}
                onClose={() => setIslandState(prev => ({...prev, isOpen: false}))}
            />
        </div>
    );
};

export default App;
