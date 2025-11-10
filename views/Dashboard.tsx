import React, { useMemo } from 'react';
import { Transaction, Account, TransactionType, Debt, Notification } from '../types';
import { Theme } from '../hooks/useTheme';
import Card from '../components/Card';
import { DotsHorizontalIcon, ArrowUpIcon, VisaIcon, StripeIcon, PaypalIcon, ApplePayIcon, CalendarIcon, ArrowDownIcon } from '../components/icons';
import { AccountBalancePieChart, ActivityChart, SpendingBarChart } from '../components/Charts';
import Notifications from '../components/Notifications';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  theme: Theme;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
  notifications: Notification[];
}

const Header: React.FC<{ t: (key: string) => string; notifications: Notification[] }> = ({ t, notifications }) => {
    return (
        <div className="flex justify-between items-center mb-6">
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

const CreditCardVisual: React.FC<{ account: Account, formatCurrency: (amount: number) => string, variant: 'purple' | 'dark' }> = ({ account, formatCurrency, variant }) => {
    const cardClasses = variant === 'purple' ? 'bg-brand-purple text-white' : 'bg-gray-800 text-white';
    const fakeCardNumber = `**** **** **** ${account.id.slice(-4)}`;

    return (
        <div className={`w-64 h-40 rounded-xl p-4 flex flex-col justify-between shrink-0 ${cardClasses}`}>
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

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, debts, formatCurrency, t, notifications }) => {
    const topAccounts = useMemo(() => [...accounts].sort((a, b) => b.balance - a.balance).slice(0, 2), [accounts]);
    const primaryAccount = topAccounts.length > 0 ? topAccounts[0] : null;
    const secondaryAccount = topAccounts.length > 1 ? topAccounts[1] : null;

    const recentActivity = useMemo(() => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [transactions]);
    
    const { totalIncome, totalExpenses, profit } = useMemo(() => {
        const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses, profit: income - expenses };
    }, [transactions]);

  return (
    <div className="space-y-6">
      <Header t={t} notifications={notifications} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {primaryAccount ? (
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-text-secondary dark:text-gray-400">{primaryAccount.name}</p>
                        <p className="text-3xl font-bold text-text-main dark:text-brand-white">{formatCurrency(primaryAccount.balance)}</p>
                    </div>
                    <div className="flex items-center text-sm text-income font-semibold"><ArrowUpIcon className="w-4 h-4 mr-1"/> 3.4%</div>
                </div>
                <div className="-ml-6 -mb-6 mt-2"><AccountBalancePieChart balance={primaryAccount.balance} color="#723FEB" /></div>
            </Card>
        ) : (
             <Card className="flex items-center justify-center"><div className="text-center text-text-secondary dark:text-gray-400"><p>{t('add_account_prompt')}</p></div></Card>
        )}
        {secondaryAccount && (
             <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-text-secondary dark:text-gray-400">{secondaryAccount.name}</p>
                        <p className="text-3xl font-bold text-text-main dark:text-brand-white">{formatCurrency(secondaryAccount.balance)}</p>
                    </div>
                     <div className="flex items-center text-sm text-income font-semibold"><ArrowUpIcon className="w-4 h-4 mr-1"/> 2.0%</div>
                </div>
                <div className="-ml-6 -mb-6 mt-2"><AccountBalancePieChart balance={secondaryAccount.balance} color="#97E0F7" /></div>
            </Card>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 dark:bg-gray-800">
                 <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{t('your_cards')}</h3>
                    <button className="text-text-secondary dark:text-gray-400"><DotsHorizontalIcon className="w-6 h-6"/></button>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                    {accounts.map((acc, index) => <CreditCardVisual key={acc.id} account={acc} formatCurrency={formatCurrency} variant={index % 2 === 0 ? 'purple' : 'dark'}/> )}
                </div>
                 <style>{`.custom-scrollbar::-webkit-scrollbar{height:6px;}.custom-scrollbar::-webkit-scrollbar-track{background:transparent;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:10px;}.dark .custom-scrollbar::-webkit-scrollbar-thumb{background:#4b5563;}`}</style>
            </Card>

            <Card className="dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{t('activity')}</h3>
                    <div className="text-text-secondary dark:text-gray-400 text-sm flex items-center border border-secondary dark:border-gray-700 rounded-lg px-2 py-1"><CalendarIcon className="w-5 h-5 mr-2"/> Jan 6, 2024 - Jan 11, 2024</div>
                </div>
                <ActivityChart transactions={transactions}/>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-2 dark:bg-gray-800">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{formatCurrency(totalExpenses)}</h3>
                        <button className="text-text-secondary dark:text-gray-400 border border-secondary dark:border-gray-700 rounded-lg p-1"><DotsHorizontalIcon className="w-5 h-5"/></button>
                    </div>
                    <SpendingBarChart transactions={transactions} />
                </Card>
                 <Card className="dark:bg-gray-800"><p className="text-text-secondary dark:text-gray-400">{t('total_income')}</p><p className="text-2xl font-bold text-text-main dark:text-brand-white">{formatCurrency(totalIncome)}</p></Card>
                 <Card className="dark:bg-gray-800"><p className="text-text-secondary dark:text-gray-400">{t('net_profit')}</p><p className={`text-2xl font-bold ${profit >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(profit)}</p></Card>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card className="dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{t('recent_activity')}</h3>
                    <button className="text-text-secondary dark:text-gray-400"><DotsHorizontalIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                    {recentActivity.map(t => <RecentActivityItem key={t.id} transaction={t} formatCurrency={formatCurrency} /> )}
                </div>
            </Card>
            
            <Card className="dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{t('debt_summary')}</h3>
                    <button className="text-text-secondary dark:text-gray-400"><DotsHorizontalIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                    {debts.length > 0 ? ( debts.slice(0, 4).map(debt => (
                        <div key={debt.id} className="flex justify-between items-center pb-2 border-b border-secondary dark:border-gray-700 last:border-b-0">
                            <div>
                                <p className="font-semibold text-text-main dark:text-gray-200">{debt.name}</p>
                                <p className="text-sm text-text-secondary dark:text-gray-400">{t('next_payment')}: {new Date(debt.nextPaymentDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-expense">{formatCurrency(debt.totalAmount - debt.amountPaid)}</p>
                                <p className="text-xs text-text-secondary dark:text-gray-400">{t('remaining')}</p>
                            </div>
                        </div>
                    ))) : ( <div className="text-center py-4"><p className="text-text-secondary dark:text-gray-400">{t('no_debts')}</p></div> )}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
