import React, { useState, useMemo } from 'react';
import { useTheme } from './hooks/useTheme';
import { useColorTheme } from './hooks/useColorTheme';
import useLocalStorage from './hooks/useLocalStorage';
import { getTranslator } from './utils/translations';
import { avatars } from './utils/avatars';
import { Account, Budget, ColorTheme, Debt, Goal, Language, Notification, Subscription, Tab, Transaction, TransactionType } from './types';

// Components
import Navigation from './components/Navigation';
import Modal from './components/Modal';
import ConfirmationModal from './components/ConfirmationModal';
import TransactionForm from './components/TransactionForm';
import AccountForm from './components/AccountForm';
import DebtForm from './components/DebtForm';
import SubscriptionForm from './components/SubscriptionForm';
import BudgetForm from './components/BudgetForm';
import GoalForm from './components/GoalForm';
import OnboardingTour from './components/OnboardingTour';
import MobileHeader from './components/MobileHeader';
import MobileMenu from './components/MobileMenu';

// Views
import Dashboard from './views/Dashboard';
import Accounts from './views/Accounts';
import Debts from './views/Debts';
import Subscriptions from './views/Subscriptions';
import History from './views/History';
import Analysis from './views/Analysis';
import Settings from './views/Settings';
import Calendar from './views/Calendar';
import Budgets from './views/Budgets';
import Goals from './views/Goals';


const App: React.FC = () => {
    const [theme, toggleTheme] = useTheme();
    const [colorTheme, setColorTheme] = useColorTheme();
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const t = useMemo(() => getTranslator(language), [language]);

    // Main App State
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', [
      { id: 'acc1', name: 'Main Checking', balance: 5240.50, type: 'checking' },
      { id: 'acc2', name: 'Savings Account', balance: 12800.00, type: 'savings' },
      { id: 'acc3', name: 'Visa Platinum', balance: -850.75, type: 'credit', creditLimit: 10000, paymentDueDate: '25' },
    ]);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', [
        { id: 't1', accountId: 'acc1', amount: 1500, description: 'Paycheck', category: 'Salario', type: TransactionType.INCOME, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
        { id: 't2', accountId: 'acc1', amount: 45.50, description: 'Groceries', category: 'Comida', type: TransactionType.EXPENSE, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString() },
        { id: 't3', accountId: 'acc3', amount: 120.00, description: 'New headphones', category: 'Entretenimiento', type: TransactionType.EXPENSE, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString() },
        { id: 't4', accountId: 'acc1', amount: 25, description: 'Stripe Deposit', category: 'Freelance', type: TransactionType.INCOME, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString() },
        { id: 't5', accountId: 'acc2', amount: 500, description: 'Monthly Savings Transfer', category: 'Inversiones', type: TransactionType.INCOME, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
        { id: 't6', accountId: 'acc3', amount: 15.99, description: 'Netflix Subscription', category: 'Entretenimiento', type: TransactionType.EXPENSE, date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString() },
    ]);
    const [debts, setDebts] = useLocalStorage<Debt[]>('debts', [
      { id: 'd1', name: 'Car Loan', totalAmount: 20000, amountPaid: 5000, interestRate: 4.5, nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString() },
    ]);
    const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', [
        { id: 'sub1', name: 'Netflix', amount: 15.99, paymentDay: '15', category: 'Entertainment' },
        { id: 'sub2', name: 'Spotify', amount: 9.99, paymentDay: '20', category: 'Entertainment' },
    ]);
    const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
    
    // UI State
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isNavCollapsed, setNavCollapsed] = useLocalStorage('nav-collapsed', false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<'transaction' | 'account' | 'debt' | 'subscription' | 'budget' | 'goal' | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<{ type: string, id: string } | null>(null);
    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    // User Profile & Onboarding
    const [userName, setUserName] = useLocalStorage('user-name', 'Olivia');
    const [avatar, setAvatar] = useLocalStorage('user-avatar', avatars[0]);
    const [currency, setCurrency] = useLocalStorage('currency', 'USD');
    const [isOnboarding, setOnboarding] = useLocalStorage('onboarding-complete', false);

    const notifications: Notification[] = useMemo(() => {
        const today = new Date();
        const upcoming: Notification[] = [];
        
        debts.forEach(d => {
            const dueDate = new Date(d.nextPaymentDate);
            const daysDiff = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
            if (daysDiff > 0 && daysDiff <= 7) {
                upcoming.push({ id: `d-${d.id}`, message: `${t('paymentFor')} ${d.name}`, dueDate: d.nextPaymentDate, type: 'debt' });
            }
        });

        accounts.filter(a => a.type === 'credit' && a.paymentDueDate).forEach(c => {
            const dueDate = new Date(today.getFullYear(), today.getMonth(), parseInt(c.paymentDueDate!));
             if(dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);
            const daysDiff = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
            if (daysDiff > 0 && daysDiff <= 7) {
                upcoming.push({ id: `c-${c.id}`, message: `${t('paymentFor')} ${c.name}`, dueDate: dueDate.toISOString(), type: 'credit_card' });
            }
        });
        
        return upcoming.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [debts, accounts, t]);
    
    const formatCurrency = useMemo(() => {
        return (amount: number) => new Intl.NumberFormat(language === 'es' ? 'es-PE' : 'en-US', { style: 'currency', currency }).format(amount);
    }, [currency, language]);

    // Handlers
    const openModal = (type: 'transaction' | 'account' | 'debt' | 'subscription' | 'budget' | 'goal', editItem: any = null) => {
        setModalContent(type);
        setItemToEdit(editItem);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setItemToEdit(null);
        setModalContent(null);
    };
    const openConfirmModal = (type: string, id: string) => {
        setItemToRemove({ type, id });
        setConfirmModalOpen(true);
    };

    const handleConfirmRemove = () => {
        if (!itemToRemove) return;
        const { type, id } = itemToRemove;

        switch (type) {
            case 'transaction': setTransactions(prev => prev.filter(t => t.id !== id)); break;
            case 'account': 
                setAccounts(prev => prev.filter(a => a.id !== id)); 
                setTransactions(prev => prev.filter(t => t.accountId !== id));
                break;
            case 'debt': setDebts(prev => prev.filter(d => d.id !== id)); break;
            case 'subscription': setSubscriptions(prev => prev.filter(s => s.id !== id)); break;
            case 'budget': setBudgets(prev => prev.filter(b => b.id !== id)); break;
            case 'goal': setGoals(prev => prev.filter(g => g.id !== id)); break;
        }
        setConfirmModalOpen(false);
        setItemToRemove(null);
    };
    
    // CRUD functions
    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: crypto.randomUUID() };
        setTransactions(prev => [newTransaction, ...prev]);
        setAccounts(prev => prev.map(acc => {
            if (acc.id === newTransaction.accountId) {
                const newBalance = newTransaction.type === TransactionType.INCOME
                    ? acc.balance + newTransaction.amount
                    : acc.balance - newTransaction.amount;
                return { ...acc, balance: newBalance };
            }
            return acc;
        }));
    };
    const updateTransaction = (updatedTransaction: Transaction) => {
        let originalTransaction: Transaction | undefined;
        setTransactions(prev => {
            originalTransaction = prev.find(t => t.id === updatedTransaction.id);
            return prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
        });
        if (originalTransaction) {
            setAccounts(prev => prev.map(acc => {
                let balanceChange = 0;
                // Revert original transaction
                if (acc.id === originalTransaction!.accountId) {
                    balanceChange = originalTransaction!.type === TransactionType.INCOME
                        ? -originalTransaction!.amount
                        : +originalTransaction!.amount;
                }
                // Apply new transaction
                if (acc.id === updatedTransaction.accountId) {
                    balanceChange += updatedTransaction.type === TransactionType.INCOME
                        ? +updatedTransaction.amount
                        : -updatedTransaction.amount;
                }
                return { ...acc, balance: acc.balance + balanceChange };
            }));
        }
    };
    const addAccount = (account: Omit<Account, 'id'>) => {
        setAccounts(prev => [{ ...account, id: crypto.randomUUID() }, ...prev]);
    };
    const updateAccount = (updatedAccount: Account) => setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
    
    const handleAddDebt = (debt: Omit<Debt, 'id'>) => {
        setDebts(prev => [{ ...debt, id: crypto.randomUUID() }, ...prev]);
        setActiveTab('debts');
    };
    const updateDebt = (updatedDebt: Debt) => setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));

    const handleAddSubscription = (subscription: Omit<Subscription, 'id'>) => {
        setSubscriptions(prev => [{ ...subscription, id: crypto.randomUUID() }, ...prev]);
        setActiveTab('subscriptions');
    };
    const updateSubscription = (updatedSubscription: Subscription) => setSubscriptions(prev => prev.map(s => s.id === updatedSubscription.id ? updatedSubscription : s));
    
    const addBudget = (budget: Omit<Budget, 'id'>) => setBudgets(prev => [{ ...budget, id: crypto.randomUUID() }, ...prev]);
    const updateBudget = (updatedBudget: Budget) => setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
    const addGoal = (goal: Omit<Goal, 'id'>) => setGoals(prev => [{ ...goal, id: crypto.randomUUID() }, ...prev]);
    const updateGoal = (updatedGoal: Goal) => setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));

    const renderContent = () => {
        switch (activeTab) {
            // FIX: Removed extra arguments from openModal calls for onAddDebt and onAddSubscription as they were causing errors. The tab switching logic is already handled in `handleAddDebt` and `handleAddSubscription`.
            case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} />;
            case 'accounts': return <Accounts accounts={accounts} transactions={transactions} formatCurrency={formatCurrency} onAddAccount={() => openModal('account')} onEditAccount={(acc) => openModal('account', acc)} onRemoveAccount={(id) => openConfirmModal('account', id)} t={t} />;
            case 'budgets': return <Budgets budgets={budgets} transactions={transactions} formatCurrency={formatCurrency} onAddBudget={() => openModal('budget')} onEditBudget={(b) => openModal('budget', b)} onRemoveBudget={(id) => openConfirmModal('budget', id)} t={t} />;
            case 'goals': return <Goals goals={goals} formatCurrency={formatCurrency} onAddGoal={() => openModal('goal')} onEditGoal={(g) => openModal('goal', g)} onRemoveGoal={(id) => openConfirmModal('goal', id)} t={t} />;
            case 'debts': return <Debts debts={debts} formatCurrency={formatCurrency} onAddDebt={() => openModal('debt')} onEditDebt={(debt) => openModal('debt', debt)} onRemoveDebt={(id) => openConfirmModal('debt', id)} t={t} />;
            case 'subscriptions': return <Subscriptions subscriptions={subscriptions} formatCurrency={formatCurrency} onAddSubscription={() => openModal('subscription')} onEditSubscription={(sub) => openModal('subscription', sub)} onRemoveSubscription={(id) => openConfirmModal('subscription', id)} t={t} />;
            case 'history': return <History transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onEditTransaction={(trx) => openModal('transaction', trx)} onRemoveTransaction={(id) => openConfirmModal('transaction', id)} t={t} />;
            case 'analysis': return <Analysis transactions={transactions} formatCurrency={formatCurrency} t={t} colorTheme={colorTheme} />;
            case 'calendar': return <Calendar accounts={accounts} debts={debts} subscriptions={subscriptions} formatCurrency={formatCurrency} t={t} />;
            case 'settings': return <Settings theme={theme} toggleTheme={toggleTheme} currency={currency} setCurrency={setCurrency} language={language} setLanguage={setLanguage} colorTheme={colorTheme} setColorTheme={setColorTheme} avatar={avatar} setAvatar={setAvatar} userName={userName} setUserName={setUserName} t={t} />;
            // FIX: Removed extra arguments from openModal calls for onAddDebt and onAddSubscription as they were causing errors. The tab switching logic is already handled in `handleAddDebt` and `handleAddSubscription`.
            default: return <Dashboard accounts={accounts} transactions={transactions} debts={debts} subscriptions={subscriptions} theme={theme} toggleTheme={toggleTheme} colorTheme={colorTheme} formatCurrency={formatCurrency} t={t} notifications={notifications} userName={userName} avatar={avatar} onAddAccount={() => openModal('account')} onAddDebt={() => openModal('debt')} onAddSubscription={() => openModal('subscription')} />;
        }
    };
    
    if (!isOnboarding) {
        return <OnboardingTour 
            onFinish={() => setOnboarding(true)}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            onAddAccount={addAccount}
            t={t}
            language={language}
            setLanguage={setLanguage}
            currency={currency}
            setCurrency={setCurrency}
            userName={userName}
            setUserName={setUserName}
            avatar={avatar}
            setAvatar={setAvatar}
        />;
    }

    return (
        <div className="flex h-screen bg-background dark:bg-background-dark font-sans">
            <Navigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={isNavCollapsed}
                toggleCollapse={() => setNavCollapsed(!isNavCollapsed)}
                t={t}
                userName={userName}
                avatar={avatar}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                 <MobileHeader 
                    activeTab={activeTab} 
                    t={t} 
                    notifications={notifications}
                    onAvatarClick={() => setMobileMenuOpen(true)}
                    userName={userName}
                    avatar={avatar}
                />
                <div className="md:mt-0 mt-16">
                    {renderContent()}
                </div>
            </main>

            <button
                onClick={() => openModal('transaction')}
                className="fixed bottom-20 right-6 md:bottom-6 md:right-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-focus transition-transform transform hover:scale-105 z-40"
                aria-label={t('addTransaction')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal} title={`${t(itemToEdit ? 'update' : 'add')} ${t(modalContent || '')}`}>
                    {modalContent === 'transaction' && <TransactionForm accounts={accounts} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onClose={closeModal} transactionToEdit={itemToEdit} t={t} />}
                    {modalContent === 'account' && <AccountForm onAddAccount={addAccount} onUpdateAccount={updateAccount} onClose={closeModal} accountToEdit={itemToEdit} t={t} />}
                    {modalContent === 'debt' && <DebtForm onAddDebt={handleAddDebt} onUpdateDebt={updateDebt} onClose={closeModal} debtToEdit={itemToEdit} t={t} />}
                    {modalContent === 'subscription' && <SubscriptionForm onAddSubscription={handleAddSubscription} onUpdateSubscription={updateSubscription} onClose={closeModal} subscriptionToEdit={itemToEdit} t={t} />}
                    {modalContent === 'budget' && <BudgetForm onAddBudget={addBudget} onUpdateBudget={updateBudget} onClose={closeModal} budgetToEdit={itemToEdit} t={t} />}
                    {modalContent === 'goal' && <GoalForm onAddGoal={addGoal} onUpdateGoal={updateGoal} onClose={closeModal} goalToEdit={itemToEdit} t={t} />}
                </Modal>
            )}

            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmRemove}
                title={t('confirm_delete_title')}
                message={t('confirm_delete_message')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
            
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                setActiveTab={setActiveTab}
                t={t}
                userName={userName}
                avatar={avatar}
            />

            <style>{`:root { --toastify-color-progress-light: var(--color-primary); }`}</style>
        </div>
    );
};

export default App;