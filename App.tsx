import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
    Account, Transaction, Debt, Subscription, SpendingLimit, Goal, Tab, Language, 
    TransactionType, ColorTheme, Notification 
} from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useColorTheme } from './hooks/useColorTheme';
import { useLongPress } from './hooks/useLongPress';
import { translations } from './utils/translations';
import { avatars } from './utils/avatars';

import Navigation from './components/Navigation';
import Dashboard from './views/Dashboard';
import Accounts from './views/Accounts';
import Debts from './views/Debts';
import History from './views/History';
import Subscriptions from './views/Subscriptions';
import Limits from './views/Limits';
import Goals from './views/Goals';
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
import { PlusIcon, MicIcon } from './components/icons';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import MobileMenu from './components/MobileMenu';
import OnboardingTour from './components/OnboardingTour';
import Confetti from './components/Confetti';
import VoiceInputModal from './components/VoiceInputModal';

const App: React.FC = () => {
    // Basic hooks
    const [theme, toggleTheme] = useTheme();
    const [colorTheme, setColorTheme] = useColorTheme();
    const [isNavCollapsed, setIsNavCollapsed] = useLocalStorage('navCollapsed', false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // App Data State
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [primaryCurrency, setPrimaryCurrency] = useLocalStorage('primaryCurrency', 'USD');
    const [userName, setUserName] = useLocalStorage('userName', 'User');
    const [avatar, setAvatar] = useLocalStorage('userAvatar', avatars[0]);
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
    const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', []);
    const [limits, setLimits] = useLocalStorage<SpendingLimit[]>('limits', []);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);

    // UI State
    const [activeTab, setActiveTab] = useLocalStorage<Tab>('activeTab', 'dashboard');
    const [modal, setModal] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [itemToRemove, setItemToRemove] = useState<{ type: string; id: string } | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOnboarding, setIsOnboarding] = useLocalStorage('onboardingComplete', false);

    const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
        let translation = translations[language][key as keyof typeof translations.en] || key;
        if (params) {
            Object.keys(params).forEach(pKey => {
                translation = translation.replace(`{{${pKey}}}`, String(params[pKey]));
            });
        }
        return translation;
    }, [language]);

    const formatCurrency = useCallback((amount: number, currency: string) => {
        return new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    }, [language]);

    const notifications = useMemo((): Notification[] => {
        // Generate notifications for upcoming payments
        const upcoming: Notification[] = [];
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        debts.forEach(d => {
            const dueDate = new Date(d.nextPaymentDate);
            if (dueDate >= today && dueDate <= threeDaysFromNow) {
                upcoming.push({ id: `debt-${d.id}`, message: `Payment for ${d.name} is due soon.`, dueDate: d.nextPaymentDate, type: 'debt' });
            }
        });
        // Add more notification logic for subscriptions, credit cards, etc.
        return upcoming;
    }, [debts]);

    // Data Handlers
    const handleAddOrUpdate = <T extends { id: string }>(items: T[], setItems: (items: T[]) => void, newItem: Omit<T, 'id'> | T) => {
        if ('id' in newItem && newItem.id) {
            setItems(items.map(item => item.id === newItem.id ? newItem : item));
        } else {
            setItems([...items, { ...newItem, id: uuidv4() } as T]);
        }
        setModal(null);
        setEditingItem(null);
    };

    const handleRemove = () => {
        if (!itemToRemove) return;
        const { type, id } = itemToRemove;
        switch (type) {
            case 'transaction': setTransactions(transactions.filter(t => t.id !== id)); break;
            case 'account': 
                setTransactions(transactions.filter(t => t.accountId !== id));
                setAccounts(accounts.filter(a => a.id !== id));
                break;
            case 'debt': setDebts(debts.filter(d => d.id !== id)); break;
            case 'subscription': setSubscriptions(subscriptions.filter(s => s.id !== id)); break;
            case 'limit': setLimits(limits.filter(l => l.id !== id)); break;
            case 'goal': setGoals(goals.filter(g => g.id !== id)); break;
        }
        setItemToRemove(null);
    };

    // Modal Openers
    const openModal = (type: string, item: any | null = null) => {
        setEditingItem(item);
        setModal(type);
    };
    
    const openConfirmation = (type: string, id: string) => {
        setItemToRemove({ type, id });
    };

    const handleGoalUpdate = (updatedGoal: Goal) => {
        const originalGoal = goals.find(g => g.id === updatedGoal.id);
        if (originalGoal && originalGoal.savedAmount < originalGoal.targetAmount && updatedGoal.savedAmount >= updatedGoal.targetAmount) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
        }
        handleAddOrUpdate(goals, setGoals, updatedGoal);
    }
    
    // Long press for mobile FAB
    const longPressHandlers = useLongPress(
        () => openModal('voice'),
        () => openModal('transaction')
    );
    
    const renderView = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} primaryCurrency={primaryCurrency}/>;
            case 'accounts': return <Accounts accounts={accounts} formatCurrency={formatCurrency} onAddAccount={() => openModal('account')} onEditAccount={(acc) => openModal('account', acc)} onRemoveAccount={(id) => openConfirmation('account', id)} t={t} />;
            case 'debts': return <Debts debts={debts} formatCurrency={formatCurrency} onAddDebt={() => openModal('debt')} onEditDebt={(debt) => openModal('debt', debt)} onRemoveDebt={(id) => openConfirmation('debt', id)} t={t} />;
            case 'subscriptions': return <Subscriptions subscriptions={subscriptions} formatCurrency={formatCurrency} onAddSubscription={() => openModal('subscription')} onEditSubscription={(sub) => openModal('subscription', sub)} onRemoveSubscription={(id) => openConfirmation('subscription', id)} t={t} />;
            case 'limits': return <Limits limits={limits} transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onAddLimit={() => openModal('limit')} onEditLimit={(limit) => openModal('limit', limit)} onRemoveLimit={(id) => openConfirmation('limit', id)} t={t} />;
            case 'goals': return <Goals goals={goals} formatCurrency={formatCurrency} onAddGoal={() => openModal('goal')} onEditGoal={(goal) => openModal('goal', goal)} onRemoveGoal={(id) => openConfirmation('goal', id)} t={t} primaryCurrency={primaryCurrency} />;
            case 'history': return <History transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onEditTransaction={(tr) => openModal('transaction', tr)} onRemoveTransaction={(id) => openConfirmation('transaction', id)} t={t} />;
            case 'analysis': return <Analysis transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} t={t} colorTheme={colorTheme} primaryCurrency={primaryCurrency} />;
            case 'calendar': return <Calendar accounts={accounts} debts={debts} subscriptions={subscriptions} formatCurrency={formatCurrency} t={t} />;
            case 'export': return <Export transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} t={t} userName={userName} colorTheme={colorTheme}/>;
            case 'settings': return <Settings theme={theme} toggleTheme={toggleTheme} currency={primaryCurrency} setCurrency={setPrimaryCurrency} language={language} setLanguage={setLanguage} colorTheme={colorTheme} setColorTheme={setColorTheme} avatar={avatar} setAvatar={setAvatar} userName={userName} setUserName={setUserName} t={t} />;
            default: return <Dashboard accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} primaryCurrency={primaryCurrency}/>;
        }
    };

    if (!isOnboarding) {
        return <OnboardingTour 
            onFinish={() => setIsOnboarding(true)}
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
        <div className={`flex h-screen bg-background dark:bg-background-dark font-sans ${theme}`}>
            {showConfetti && <Confetti />}
            <Navigation 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isCollapsed={isNavCollapsed}
                toggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
                t={t}
                userName={userName}
                avatar={avatar}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader 
                    activeTab={activeTab}
                    t={t}
                    notifications={notifications}
                    onAvatarClick={() => setIsMobileMenuOpen(true)}
                    userName={userName}
                    avatar={avatar}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 pt-20 md:pt-6">
                    {renderView()}
                </main>
                <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
            </div>

            {/* Modals */}
            <Modal isOpen={modal === 'transaction'} onClose={() => setModal(null)} title={editingItem ? t('update') : t('add') + ' ' + t('transaction')}>
                <TransactionForm
                    accounts={accounts}
                    onAddTransaction={(tr) => handleAddOrUpdate(transactions, setTransactions, tr)}
                    onUpdateTransaction={(tr) => handleAddOrUpdate(transactions, setTransactions, tr)}
                    onClose={() => setModal(null)}
                    transactionToEdit={editingItem}
                    t={t}
                />
            </Modal>
            <Modal isOpen={modal === 'account'} onClose={() => setModal(null)} title={editingItem ? t('update') : t('add') + ' ' + t('account')}>
                <AccountForm
                    onAddAccount={(acc) => handleAddOrUpdate(accounts, setAccounts, acc)}
                    onUpdateAccount={(acc) => handleAddOrUpdate(accounts, setAccounts, acc)}
                    onClose={() => setModal(null)}
                    accountToEdit={editingItem}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal isOpen={modal === 'debt'} onClose={() => setModal(null)} title={editingItem ? t('update') : t('add') + ' ' + t('debt')}>
                <DebtForm
                    onAddDebt={(d) => handleAddOrUpdate(debts, setDebts, d)}
                    onUpdateDebt={(d) => handleAddOrUpdate(debts, setDebts, d)}
                    onClose={() => setModal(null)}
                    debtToEdit={editingItem}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal isOpen={modal === 'subscription'} onClose={() => setModal(null)} title={editingItem ? t('update') : t('add') + ' ' + t('subscription')}>
                <SubscriptionForm
                    onAddSubscription={(s) => handleAddOrUpdate(subscriptions, setSubscriptions, s)}
                    onUpdateSubscription={(s) => handleAddOrUpdate(subscriptions, setSubscriptions, s)}
                    onClose={() => setModal(null)}
                    subscriptionToEdit={editingItem}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal isOpen={modal === 'limit'} onClose={() => setModal(null)} title={editingItem ? t('update') : t('add') + ' ' + t('limit')}>
                <LimitForm
                    onAddLimit={(l) => handleAddOrUpdate(limits, setLimits, l)}
                    onUpdateLimit={(l) => handleAddOrUpdate(limits, setLimits, l)}
                    onClose={() => setModal(null)}
                    limitToEdit={editingItem}
                    t={t}
                    existingCategories={limits.map(l => l.category)}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
            <Modal isOpen={modal === 'goal'} onClose={() => setModal(null)} title={editingItem ? t('update') : t('add') + ' ' + t('goal')}>
                <GoalForm
                    onAddGoal={(g) => handleAddOrUpdate(goals, setGoals, g)}
                    onUpdateGoal={handleGoalUpdate}
                    onClose={() => setModal(null)}
                    goalToEdit={editingItem}
                    t={t}
                    primaryCurrency={primaryCurrency}
                />
            </Modal>
             <VoiceInputModal 
                isOpen={modal === 'voice'} 
                onClose={() => setModal(null)} 
                onAddTransaction={(tr) => handleAddOrUpdate(transactions, setTransactions, tr)} 
                accounts={accounts}
                t={t}
            />
            <ConfirmationModal
                isOpen={!!itemToRemove}
                onClose={() => setItemToRemove(null)}
                onConfirm={handleRemove}
                title={`Delete ${itemToRemove?.type}`}
                message={`Are you sure you want to delete this ${itemToRemove?.type}? This action cannot be undone.`}
            />
             <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)}
                setActiveTab={setActiveTab}
                t={t}
                userName={userName}
                avatar={avatar}
            />

            {/* Floating Action Buttons */}
            <div className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 flex flex-col items-center gap-4">
                {/* Desktop-only voice button */}
                <button
                    onClick={() => openModal('voice')}
                    className="hidden md:flex items-center justify-center bg-accent text-primary dark:bg-secondary-dark dark:text-accent rounded-full p-4 shadow-lg hover:bg-opacity-80 transition-transform hover:scale-105"
                    aria-label={t('voice_input_title')}
                >
                    <MicIcon className="w-6 h-6" />
                </button>
                {/* Main FAB: Click for transaction, Long press for voice (on mobile) */}
                <button
                    {...longPressHandlers}
                    className="flex items-center justify-center bg-primary hover:bg-primary-focus text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105"
                    aria-label={t('add') + ' ' + t('transaction')}
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default App;
