import React, { useState, useMemo } from 'react';
import { useTheme } from './hooks/useTheme';
import { useColorTheme } from './hooks/useColorTheme';
import useLocalStorage from './hooks/useLocalStorage';
import { Transaction, Account, Debt, Tab, TransactionType, Language, Notification, Subscription } from './types';
import Navigation from './components/Navigation';
import Dashboard from './views/Dashboard';
import Accounts from './views/Accounts';
import Debts from './views/Debts';
import Subscriptions from './views/Subscriptions';
import History from './views/History';
import Settings from './views/Settings';
import Analysis from './views/Analysis';
import Calendar from './views/Calendar';
import Modal from './components/Modal';
import ConfirmationModal from './components/ConfirmationModal';
import TransactionForm from './components/TransactionForm';
import AccountForm from './components/AccountForm';
import DebtForm from './components/DebtForm';
import SubscriptionForm from './components/SubscriptionForm';
import OnboardingTour from './components/OnboardingTour';
import { translations } from './utils/translations';
import { avatars } from './utils/avatars';
import { PlusIcon } from './components/icons';
import MobileHeader from './components/MobileHeader';
import MobileMenu from './components/MobileMenu';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [colorTheme, setColorTheme] = useColorTheme();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalContent, setModalContent] = useState<'transaction' | 'account' | 'debt' | 'subscription' | null>(null);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', []);
  
  const [currency, setCurrency] = useLocalStorage<string>('currency', 'USD');
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  const [userName, setUserName] = useLocalStorage<string>('userName', 'Olivia');
  const [avatar, setAvatar] = useLocalStorage<string>('userAvatar', avatars[0]);
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>('onboardingCompleted', false);

  // Mobile Menu State
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Confirmation Modal State
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ onConfirm: () => void } | null>(null);
  const [confirmModalContent, setConfirmModalContent] = useState<{ title: string; message: string }>({ title: '', message: '' });

  const t = (key: keyof typeof translations.en) => {
      return translations[language]?.[key] || translations.en[key];
  }

  const formatCurrency = (amount: number) => {
    const locales: { [key: string]: string } = {
        'USD': 'en-US', 'EUR': 'de-DE', 'GBP': 'en-GB', 'JPY': 'ja-JP', 'PEN': 'es-PE', 'MXN': 'es-MX'
    }
    return new Intl.NumberFormat(locales[currency] || 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  const notifications = useMemo<Notification[]>(() => {
    const upcoming = [];
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    debts.forEach(debt => {
        const dueDate = new Date(debt.nextPaymentDate);
        if (dueDate >= today && dueDate <= sevenDaysFromNow) {
            upcoming.push({
                id: `debt-${debt.id}`,
                message: `${t('paymentFor')} ${debt.name}`,
                dueDate: debt.nextPaymentDate,
                type: 'debt'
            });
        }
    });

    accounts.filter(acc => acc.type === 'credit' && acc.paymentDueDate).forEach(acc => {
        const dayOfMonth = parseInt(acc.paymentDueDate!);
        if (isNaN(dayOfMonth)) return;
        
        let dueDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
        if(dueDate < today) {
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        if (dueDate >= today && dueDate <= sevenDaysFromNow) {
            upcoming.push({
                id: `credit-${acc.id}`,
                message: `${t('paymentFor')} ${acc.name}`,
                dueDate: dueDate.toISOString().split('T')[0],
                type: 'credit_card'
            });
        }
    });

    subscriptions.forEach(sub => {
        const dayOfMonth = parseInt(sub.paymentDay);
        if (isNaN(dayOfMonth)) return;
        
        let dueDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
        if(dueDate < today) {
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        if (dueDate >= today && dueDate <= sevenDaysFromNow) {
            upcoming.push({
                id: `sub-${sub.id}`,
                message: `${t('paymentFor')} ${sub.name}`,
                dueDate: dueDate.toISOString().split('T')[0],
                type: 'subscription'
            });
        }
    });

    return upcoming;
  }, [debts, accounts, subscriptions, t]);
  
  const requestConfirmation = (onConfirm: () => void, title: string, message: string) => {
    setConfirmAction({ onConfirm });
    setConfirmModalContent({ title, message });
    setConfirmModalOpen(true);
  };

  // CRUD Operations
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [...prev, newTransaction]);
    
    setAccounts(prevAccs => prevAccs.map(acc => {
      if (acc.id === transaction.accountId) {
        const newBalance = transaction.type === TransactionType.INCOME
          ? acc.balance + transaction.amount
          : acc.balance - transaction.amount;
        return { ...acc, balance: newBalance };
      }
      return acc;
    }));
  };
  
  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
      const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
      if (!originalTransaction) return;

      setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));

      setAccounts(prevAccs => prevAccs.map(acc => {
          let balanceChange = 0;
          if (acc.id === originalTransaction.accountId) {
              const originalAmount = originalTransaction.type === TransactionType.INCOME ? originalTransaction.amount : -originalTransaction.amount;
              balanceChange -= originalAmount;
          }
          if (acc.id === updatedTransaction.accountId) {
              const newAmount = updatedTransaction.type === TransactionType.INCOME ? updatedTransaction.amount : -updatedTransaction.amount;
              balanceChange += newAmount;
          }
          return { ...acc, balance: acc.balance + balanceChange };
      }));
      setEditingTransaction(null);
  };

  const handleRemoveTransaction = (transactionId: string) => {
      const transactionToRemove = transactions.find(t => t.id === transactionId);
      if (!transactionToRemove) return;
      
      const onConfirm = () => {
          setTransactions(prev => prev.filter(t => t.id !== transactionId));
          setAccounts(prevAccs => prevAccs.map(acc => {
              if (acc.id === transactionToRemove.accountId) {
                  const balanceAdjustment = transactionToRemove.type === TransactionType.INCOME
                      ? -transactionToRemove.amount
                      : +transactionToRemove.amount;
                  return { ...acc, balance: acc.balance + balanceAdjustment };
              }
              return acc;
          }));
      };

      requestConfirmation(
          onConfirm,
          t('confirmDeleteTransactionTitle'),
          t('confirmDeleteTransactionMessage')
      );
  };

  const handleAddAccount = (account: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...account, id: crypto.randomUUID() }]);
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
    setEditingAccount(null);
  };

  const handleRemoveAccount = (accountId: string) => {
      const onConfirm = () => {
          setAccounts(prev => prev.filter(acc => acc.id !== accountId));
          setTransactions(prev => prev.filter(t => t.accountId !== accountId));
      };
      
      requestConfirmation(
          onConfirm,
          t('confirmDeleteAccountTitle'),
          t('confirmDeleteAccountMessage')
      );
  };

  const handleAddDebt = (debt: Omit<Debt, 'id'>) => {
    setDebts(prev => [...prev, { ...debt, id: crypto.randomUUID() }]);
    setActiveTab('debts');
  };

  const handleRemoveDebt = (debtId: string) => {
     const onConfirm = () => {
        setDebts(prev => prev.filter(d => d.id !== debtId));
     };

     requestConfirmation(
        onConfirm,
        t('confirmDeleteDebtTitle'),
        t('confirmDeleteDebtMessage')
     );
  };
  
  const handleAddSubscription = (subscription: Omit<Subscription, 'id'>) => {
    setSubscriptions(prev => [...prev, { ...subscription, id: crypto.randomUUID() }]);
    setActiveTab('subscriptions');
  };

  const handleUpdateSubscription = (updatedSubscription: Subscription) => {
    setSubscriptions(prev => prev.map(sub => sub.id === updatedSubscription.id ? updatedSubscription : sub));
    setEditingSubscription(null);
  };

  const handleRemoveSubscription = (subscriptionId: string) => {
     const onConfirm = () => {
        setSubscriptions(prev => prev.filter(s => s.id !== subscriptionId));
     };

     requestConfirmation(
        onConfirm,
        t('confirmDeleteSubscriptionTitle'),
        t('confirmDeleteSubscriptionMessage')
     );
  };

  const openModal = (type: 'transaction' | 'account' | 'debt' | 'subscription', entityToEdit: Transaction | Account | Subscription | null = null) => {
      if (type === 'transaction') setEditingTransaction(entityToEdit as Transaction | null);
      if (type === 'account') setEditingAccount(entityToEdit as Account | null);
      if (type === 'subscription') setEditingSubscription(entityToEdit as Subscription | null);
      setModalContent(type);
  };

  const closeModal = () => {
    setModalContent(null);
    setEditingTransaction(null);
    setEditingAccount(null);
    setEditingSubscription(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                    accounts={accounts} 
                    transactions={transactions} 
                    debts={debts} 
                    subscriptions={subscriptions} 
                    theme={theme} 
                    toggleTheme={toggleTheme}
                    colorTheme={colorTheme} 
                    formatCurrency={formatCurrency} 
                    t={t} 
                    notifications={notifications}
                    userName={userName}
                    avatar={avatar}
                    onAddAccount={() => openModal('account')}
                    onAddDebt={() => openModal('debt')}
                    onAddSubscription={() => openModal('subscription')}
                />;
      case 'accounts':
        return <Accounts accounts={accounts} transactions={transactions} formatCurrency={formatCurrency} onAddAccount={() => openModal('account')} onEditAccount={(acc) => openModal('account', acc)} onRemoveAccount={handleRemoveAccount} t={t} />;
      case 'debts':
        return <Debts debts={debts} formatCurrency={formatCurrency} onAddDebt={() => openModal('debt')} onRemoveDebt={handleRemoveDebt} t={t} />;
      case 'subscriptions':
        return <Subscriptions subscriptions={subscriptions} formatCurrency={formatCurrency} onAddSubscription={() => openModal('subscription')} onEditSubscription={(sub) => openModal('subscription', sub)} onRemoveSubscription={handleRemoveSubscription} t={t} />;
      case 'history':
        return <History transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} onEditTransaction={(t) => openModal('transaction', t)} onRemoveTransaction={handleRemoveTransaction} t={t} />;
      case 'analysis':
        return <Analysis transactions={transactions} formatCurrency={formatCurrency} t={t} colorTheme={colorTheme} />;
      case 'settings':
        return <Settings theme={theme} toggleTheme={toggleTheme} currency={currency} setCurrency={setCurrency} language={language} setLanguage={setLanguage} colorTheme={colorTheme} setColorTheme={setColorTheme} avatar={avatar} setAvatar={setAvatar} t={t} />;
      case 'calendar':
        return <Calendar accounts={accounts} debts={debts} subscriptions={subscriptions} formatCurrency={formatCurrency} t={t} />;
      default:
        return <Dashboard 
                    accounts={accounts} 
                    transactions={transactions} 
                    debts={debts} 
                    subscriptions={subscriptions} 
                    theme={theme} 
                    toggleTheme={toggleTheme}
                    colorTheme={colorTheme} 
                    formatCurrency={formatCurrency} 
                    t={t} 
                    notifications={notifications}
                    userName={userName}
                    avatar={avatar}
                    onAddAccount={() => openModal('account')} 
                    onAddDebt={() => openModal('debt')}
                    onAddSubscription={() => openModal('subscription')}
                />;
    }
  };

  const getModalTitleKey = () => {
    if (!modalContent) return '';
    if (modalContent === 'transaction') return editingTransaction ? 'editTransactionTitle' : 'addTransactionTitle';
    if (modalContent === 'account') return editingAccount ? 'editAccountTitle' : 'addAccountTitle';
    if (modalContent === 'debt') return 'addDebtTitle';
    if (modalContent === 'subscription') return editingSubscription ? 'editSubscriptionTitle' : 'addSubscriptionTitle';
    return '';
  }

  const handleMobileTabSelect = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }

  return (
    <div className="flex h-screen bg-background dark:bg-brand-black">
      {!onboardingCompleted && (
        <OnboardingTour 
          onFinish={() => setOnboardingCompleted(true)}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          onAddAccount={handleAddAccount}
          t={t}
          language={language}
          setLanguage={setLanguage}
          currency={currency}
          setCurrency={setCurrency}
          userName={userName}
          setUserName={setUserName}
          avatar={avatar}
          setAvatar={setAvatar}
        />
      )}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
        t={t}
        userName={userName}
        avatar={avatar}
      />
      
      <MobileHeader 
        activeTab={activeTab}
        t={t}
        notifications={notifications}
        onAvatarClick={() => setMobileMenuOpen(true)}
        userName={userName}
        avatar={avatar}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        setActiveTab={handleMobileTabSelect}
        t={t}
        userName={userName}
        avatar={avatar}
      />

      <main className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-20 md:pt-8 pb-24 md:pb-8`}>
        {renderContent()}
      </main>

      <button onClick={() => openModal('transaction')} className="fixed bottom-20 md:bottom-8 right-6 md:right-8 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-110 z-40">
        <PlusIcon className="w-6 h-6" />
      </button>

      <Modal isOpen={!!modalContent} onClose={closeModal} title={t(getModalTitleKey() as any)}>
        {modalContent === 'transaction' && <TransactionForm accounts={accounts} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onClose={closeModal} transactionToEdit={editingTransaction} t={t} />}
        {modalContent === 'account' && <AccountForm onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onClose={closeModal} accountToEdit={editingAccount} t={t} />}
        {modalContent === 'debt' && <DebtForm onAddDebt={handleAddDebt} onClose={closeModal} t={t} />}
        {modalContent === 'subscription' && <SubscriptionForm onAddSubscription={handleAddSubscription} onUpdateSubscription={handleUpdateSubscription} onClose={closeModal} subscriptionToEdit={editingSubscription} t={t} />}
      </Modal>

      <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => {
              if (confirmAction) {
                  confirmAction.onConfirm();
              }
          }}
          title={confirmModalContent.title}
          message={confirmModalContent.message}
          confirmText={t('delete')}
          cancelText={t('cancel')}
      />
    </div>
  );
};

export default App;