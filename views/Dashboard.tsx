import React, { useMemo, useState } from 'react';
import { Transaction, Account, TransactionType, Debt, Notification, ColorTheme, Subscription } from '../types';
import { Theme } from '../hooks/useTheme';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import { PlusIcon, ArrowUpIcon, VisaIcon, StripeIcon, PaypalIcon, ApplePayIcon, CalendarIcon, ArrowDownIcon, CollectionIcon } from '../components/icons';
import { AccountBalancePieChart, ActivityChart } from '../components/Charts';
import Notifications from '../components/Notifications';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  subscriptions: Subscription[];
  theme: Theme;
  colorTheme: ColorTheme;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
  notifications: Notification[];
  onAddAccount: () => void;
}

const Header: React.FC<{ t: (key: string) => string; notifications: Notification[] }> = ({ t, notifications }) => {
    return (
        <div className="hidden md:flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-text-main dark:text-brand-white">{t('welcome_back')} Olivia!</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                <Notifications notifications={notifications} t={t} />
                <img 
                    src="https://i.pravatar.cc/40?u=a042581f4e29026704d" 
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full"
                />
            </div>
        </div>
    );
};

const CreditCardVisual: React.FC<{ 
    account: Account, 
    formatCurrency: (amount: number) => string, 
    variant: 'purple' | 'dark',
    isSelected: boolean,
    onClick: () => void,
}> = ({ account, formatCurrency, variant, isSelected, onClick }) => {
    const cardClasses = variant === 'purple' ? 'bg-primary text-white' : 'bg-gray-800 text-white';
    const fakeCardNumber = `**** **** **** ${account.id.slice(-4)}`;
    const selectionClasses = isSelected ? 'ring-2 ring-primary' : '';

    return (
        <div 
            className={`w-64 h-40 rounded-xl p-4 flex flex-col justify-between shrink-0 cursor-pointer transition-all ${cardClasses} ${selectionClasses}`}
            onClick={onClick}
        >
            <div>
                <span className="font-semibold">{account.name}</span>
                 <p className="text-xs opacity-80">Current Balance</p>
                 <p className="font-semibold text-lg">{formatCurrency(account.balance)}</p>
            </div>
            <div>
                <p className="text-sm opacity-80">OLIVIA RHYE</p>
                <p className="font-mono tracking-wider text-sm">{fakeCardNumber}</p>
            </div>
        </div>
    );
};

const AllAccountsCard: React.FC<{ isSelected: boolean; onClick: () => void; t: (key: string) => string }> = ({ isSelected, onClick, t }) => {
    const selectionClasses = isSelected ? 'ring-2 ring-primary' : '';
    return (
        <div
            className={`w-40 h-40 rounded-xl p-4 flex flex-col justify-center items-center shrink-0 cursor-pointer transition-all bg-surface dark:bg-gray-800 ${selectionClasses}`}
            onClick={onClick}
        >
            <CollectionIcon className="w-10 h-10 text-primary mb-2" />
            <h3 className="text-lg font-bold text-text-main dark:text-brand-white">{t('all_accounts')}</h3>
        </div>
    );
};


const RecentActivityItem: React.FC<{ transaction: Transaction, formatCurrency: (amount: number) => string }> = ({ transaction, formatCurrency }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const iconKey = transaction.description.split(' ')[0].toLowerCase();
    
    const depositIcons: { [key: string]: React.ReactNode } = {
        'visa': <VisaIcon className="w-8 h-8" />, 'stripe': <StripeIcon className="w-8 h-8" />,
        'paypal': <PaypalIcon className="w-8 h-8" />, 'apple': <ApplePayIcon className="w-8 h-8" />,
    };

    const getIcon = () => {
        if (isIncome) return depositIcons[iconKey] || <ArrowUpIcon className="w-6 h-6 text-income"/>
        return <ArrowDownIcon className="w-6 h-6 text-expense"/>
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-4 ${isIncome ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>{getIcon()}</div>
                <div>
                    <p className="font-semibold text-text-main dark:text-gray-200">{transaction.description}</p>
                    <p className="text-sm text-text-secondary dark:text-gray-400">{transaction.category}</p>
                </div>
            </div>
            <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, debts, subscriptions, colorTheme, formatCurrency, t, notifications, onAddAccount }) => {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const currentPalette = themes[colorTheme];
    const toHex = (rgb: string) => '#' + rgb.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
    
    const primaryColor = toHex(currentPalette['--color-primary']);
    const accentColor = toHex(currentPalette['--color-accent']);

    const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => b.balance - a.balance), [accounts]);
    
    const selectedAccount = useMemo(() => {
        return accounts.find(acc => acc.id === selectedAccountId) || null;
    }, [accounts, selectedAccountId]);

    const displayedTransactions = useMemo(() => {
        if (!selectedAccountId) return transactions;
        return transactions.filter(t => t.accountId === selectedAccountId);
    }, [transactions, selectedAccountId]);

    const recentActivity = useMemo(() => [...displayedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [displayedTransactions]);
    
    const { totalIncome, totalExpenses, profit } = useMemo(() => {
        const income = displayedTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const expenses = displayedTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses, profit: income - expenses };
    }, [displayedTransactions]);
    
    const upcomingSubscriptions = useMemo(() => {
        const today = new Date();
        return subscriptions
            .map(sub => {
                const dayOfMonth = parseInt(sub.paymentDay);
                if (isNaN(dayOfMonth)) return null;
                let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
                if (nextPaymentDate < today) {
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                }
                return { ...sub, nextPaymentDate: nextPaymentDate.toISOString().split('T')[0] };
            })
            .filter((sub): sub is Subscription & { nextPaymentDate: string } => sub !== null)
            .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
            .slice(0, 4);
    }, [subscriptions]);

    const getAccountGridClasses = (count: number) => {
        if (count === 1) {
             return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6";
        }
        if (count === 2) {
            return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6";
        }
        // Default for 0 or 3+
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }

  return (
    <div className="space-y-6">
      <Header t={t} notifications={notifications} />
      
      <div className={getAccountGridClasses(sortedAccounts.length)}>
        {sortedAccounts.length > 0 ? (
          sortedAccounts.map((account, index) => (
            <Card key={account.id} className={`${sortedAccounts.length === 1 ? 'md:col-span-2' : ''}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-text-secondary dark:text-gray-400">{account.name}</p>
                        <p className="text-3xl font-bold text-text-main dark:text-brand-white">{formatCurrency(account.balance)}</p>
                    </div>
                    <div className="flex items-center text-sm text-income font-semibold"><ArrowUpIcon className="w-4 h-4 mr-1"/> {index % 2 === 0 ? '3.4%' : '2.0%'}</div>
                </div>
                <div className="-ml-6 -mb-6 mt-2"><AccountBalancePieChart balance={account.balance} color={index % 2 === 0 ? primaryColor : accentColor} /></div>
            </Card>
          ))
        ) : (
             <Card className="flex items-center justify-center min-h-[140px] md:col-span-2 lg:col-span-3"><div className="text-center text-text-secondary dark:text-gray-400"><p>{t('add_account_prompt')}</p></div></Card>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 dark:bg-gray-800">
                 <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{t('your_cards')}</h3>
                    <button onClick={onAddAccount} className="flex items-center bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3 py-1 text-sm font-semibold transition-colors">
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        {t('add')}
                    </button>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                    <AllAccountsCard isSelected={selectedAccountId === null} onClick={() => setSelectedAccountId(null)} t={t} />
                    {accounts.map((acc, index) => <CreditCardVisual key={acc.id} account={acc} formatCurrency={formatCurrency} variant={index % 2 === 0 ? 'purple' : 'dark'} isSelected={selectedAccountId === acc.id} onClick={() => setSelectedAccountId(acc.id)} /> )}
                </div>
                 <style>{`.custom-scrollbar::-webkit-scrollbar{height:6px;}.custom-scrollbar::-webkit-scrollbar-track{background:transparent;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:10px;}.dark .custom-scrollbar::-webkit-scrollbar-thumb{background:#4b5563;}`}</style>
            </Card>

            <Card className="dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-main dark:text-brand-white">
                        {t('activity')} <span className="text-base font-medium text-text-secondary dark:text-gray-400">{selectedAccount ? `(${selectedAccount.name})` : `(${t('all')})`}</span>
                    </h3>
                    <div className="text-text-secondary dark:text-gray-400 text-sm flex items-center border border-secondary dark:border-gray-700 rounded-lg px-2 py-1"><CalendarIcon className="w-5 h-5 mr-2"/> Jan 6, 2024 - Jan 11, 2024</div>
                </div>
                <ActivityChart transactions={displayedTransactions} primaryColor={primaryColor} accentColor={accentColor} />
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-text-main dark:text-brand-white">
                         {t('recent_activity')} <span className="text-sm font-medium text-text-secondary dark:text-gray-400">{selectedAccount ? `(${selectedAccount.name})` : ''}</span>
                    </h3>
                    <button className="text-text-secondary dark:text-gray-400"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    {recentActivity.map(transaction => (
                        <RecentActivityItem key={transaction.id} transaction={transaction} formatCurrency={formatCurrency} />
                    ))}
                    {recentActivity.length === 0 && <p className="text-sm text-center py-4 text-text-secondary dark:text-gray-400">{t('noTransactionsFound')}</p>}
                </div>
            </Card>
             <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-text-main dark:text-brand-white">{t('debt_summary')}</h3>
                    <button className="text-text-secondary dark:text-gray-400"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    {debts.length > 0 ? (
                        debts.slice(0, 3).map(debt => (
                            <div key={debt.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-text-main dark:text-gray-200">{debt.name}</p>
                                    <p className="text-sm text-text-secondary dark:text-gray-400">{t('next_payment')}: {new Date(debt.nextPaymentDate).toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-expense">{formatCurrency(debt.totalAmount - debt.amountPaid)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary dark:text-gray-400">{t('no_debts')}</p>
                    )}
                </div>
            </Card>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-text-main dark:text-brand-white">{t('subscription_summary')}</h3>
                    <button className="text-text-secondary dark:text-gray-400"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    {upcomingSubscriptions.length > 0 ? (
                        upcomingSubscriptions.map(sub => (
                            <div key={sub.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-text-main dark:text-gray-200">{sub.name}</p>
                                    <p className="text-sm text-text-secondary dark:text-gray-400">{t('next_payment')}: {new Date(sub.nextPaymentDate).toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-text-main dark:text-gray-200">{formatCurrency(sub.amount)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary dark:text-gray-400">{t('no_subscriptions')}</p>
                    )}
                </div>
            </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <p className="text-text-secondary dark:text-gray-400">{t('total_income')} {selectedAccount ? `(${selectedAccount.name})` : `(${t('all')})`}</p>
                <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
            </Card>
            <Card>
                <p className="text-text-secondary dark:text-gray-400">{t('expense')} {selectedAccount ? `(${selectedAccount.name})` : `(${t('all')})`}</p>
                <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses)}</p>
            </Card>
            <Card>
                <p className="text-text-secondary dark:text-gray-400">{t('net_profit')} {selectedAccount ? `(${selectedAccount.name})` : `(${t('all')})`}</p>
                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(profit)}</p>
            </Card>
      </div>

    </div>
  );
};

export default Dashboard;