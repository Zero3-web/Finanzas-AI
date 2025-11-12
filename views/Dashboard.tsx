import React, { useMemo, useState, useRef } from 'react';
import { Transaction, Account, TransactionType, Debt, Notification, ColorTheme, RecurringTransaction } from '../types';
import { Theme } from '../hooks/useTheme';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import { PlusIcon, ArrowUpIcon, VisaIcon, StripeIcon, PaypalIcon, ApplePayIcon, CalendarIcon, ArrowDownIcon, CollectionIcon, GripVerticalIcon } from '../components/icons';
import { AccountBalancePieChart, ActivityChart } from '../components/Charts';
import Notifications from '../components/Notifications';
import ThemeToggle from '../components/ThemeToggle';
import useLocalStorage from '../hooks/useLocalStorage';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  recurringTransactions: RecurringTransaction[];
  theme: Theme;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  notifications: Notification[];
  userName: string;
  avatar: string;
  onAddAccount: () => void;
  onAddDebt: () => void;
  onAddRecurring: () => void;
  primaryCurrency: string;
}

const Header: React.FC<{ t: (key: string, params?: { [key: string]: string | number }) => string; notifications: Notification[], userName: string, theme: Theme, toggleTheme: () => void }> = ({ t, notifications, userName, theme, toggleTheme }) => {
    return (
        <div className="hidden md:flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('welcome_back', { userName })}</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                <Notifications notifications={notifications} t={t} />
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
        </div>
    );
};

const CreditCardVisual: React.FC<{ 
    account: Account, 
    formatCurrency: (amount: number, currency: string) => string, 
    variant: 'purple' | 'dark' | 'cyan',
    isSelected: boolean,
    onClick: () => void
}> = ({ account, formatCurrency, variant, isSelected, onClick }) => {
    const getCardClasses = () => {
        switch(variant) {
            case 'purple': return 'bg-primary text-white';
            case 'cyan': return 'bg-accent text-text-main';
            case 'dark': return 'bg-surface-dark text-white';
            default: return 'bg-primary text-white';
        }
    }
    const fakeCardNumber = `**** **** **** ${account.id.slice(-4)}`;
    const selectionClasses = isSelected ? 'border-primary' : 'border-transparent';

    return (
        <div 
            className={`w-64 h-40 rounded-xl p-4 flex flex-col justify-between shrink-0 cursor-pointer transition-all border-2 ${getCardClasses()} ${selectionClasses}`}
            onClick={onClick}
        >
            <div>
                <span className="font-semibold">{account.name}</span>
                 <p className="text-xs opacity-80">Current Balance</p>
                 <p className="font-semibold text-lg">{formatCurrency(account.balance, account.currency)}</p>
            </div>
            <div>
                <p className="font-mono tracking-wider text-sm">{fakeCardNumber}</p>
            </div>
        </div>
    );
};

const AllAccountsCard: React.FC<{ isSelected: boolean; onClick: () => void; t: (key: string) => string }> = ({ isSelected, onClick, t }) => {
    const selectionClasses = isSelected ? 'border-primary' : 'border-transparent';
    return (
        <div
            className={`w-36 h-36 rounded-xl p-4 flex flex-col justify-center items-center shrink-0 cursor-pointer transition-all bg-surface dark:bg-surface-dark border-2 ${selectionClasses}`}
            onClick={onClick}
        >
            <CollectionIcon className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-base font-bold text-text-main dark:text-text-main-dark">{t('all_accounts')}</h3>
        </div>
    );
};


const RecentActivityItem: React.FC<{ transaction: Transaction, account: Account | undefined, formatCurrency: (amount: number, currency: string) => string }> = ({ transaction, account, formatCurrency }) => {
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
                    <p className="font-semibold text-text-main dark:text-text-main-dark">{transaction.description}</p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{transaction.category}</p>
                </div>
            </div>
            <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, account?.currency || 'USD')}
            </p>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, debts, recurringTransactions, theme, toggleTheme, colorTheme, formatCurrency, t, notifications, userName, onAddAccount, onAddDebt, onAddRecurring, primaryCurrency }) => {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);
    
    // Drag and Drop State
    const [sectionOrder, setSectionOrder] = useLocalStorage<string[]>(
        'dashboard-layout',
        ['balances', 'activity', 'summary']
    );
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, key: string) => {
        dragItem.current = key;
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnter = (key: string) => {
        if (key !== dragItem.current) {
            dragOverItem.current = key;
            setDragOverKey(key);
        }
    };

    const handleDrop = () => {
        if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
            const newSectionOrder = [...sectionOrder];
            const dragItemIndex = sectionOrder.indexOf(dragItem.current);
            const dragOverItemIndex = sectionOrder.indexOf(dragOverItem.current);

            const [reorderedItem] = newSectionOrder.splice(dragItemIndex, 1);
            newSectionOrder.splice(dragOverItemIndex, 0, reorderedItem);

            setSectionOrder(newSectionOrder);
        }
        dragItem.current = null;
        dragOverItem.current = null;
        setDragOverKey(null);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('dragging');
        dragItem.current = null;
        dragOverItem.current = null;
        setDragOverKey(null);
    };


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
        const accountCurrencyMap = new Map(accounts.map(acc => [acc.id, acc.currency]));

        const transactionsInPrimaryCurrency = displayedTransactions.filter(t => accountCurrencyMap.get(t.accountId) === primaryCurrency);

        const income = transactionsInPrimaryCurrency
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = transactionsInPrimaryCurrency
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        return { totalIncome: income, totalExpenses: expenses, profit: income - expenses };
    }, [displayedTransactions, primaryCurrency, accounts]);
    
    const upcomingRecurring = useMemo(() => {
        const today = new Date();
        return recurringTransactions
            .map(rec => {
                const dayOfMonth = parseInt(rec.paymentDay);
                if (isNaN(dayOfMonth)) return null;
                let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
                if (nextPaymentDate < today) {
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                }
                return { ...rec, nextPaymentDate: nextPaymentDate.toISOString().split('T')[0] };
            })
            .filter((rec): rec is RecurringTransaction & { nextPaymentDate: string } => rec !== null)
            .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
            .slice(0, 4);
    }, [recurringTransactions]);
    
    const getAccountGridClasses = (count: number) => {
        if (count === 1) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6";
        if (count === 2) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6";
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }

    const sections: { [key: string]: React.ReactNode } = {
        balances: (
            <div className={getAccountGridClasses(sortedAccounts.length)}>
                {sortedAccounts.length > 0 ? (
                    sortedAccounts.map((account, index) => (
                        <Card key={account.id} className={`${sortedAccounts.length === 1 ? 'md:col-span-2' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary-dark">{account.name}</p>
                                    <p className="text-3xl font-bold text-text-main dark:text-text-main-dark">{formatCurrency(account.balance, account.currency)}</p>
                                </div>
                                <div className="flex items-center text-sm text-income font-semibold"><ArrowUpIcon className="w-4 h-4 mr-1"/> {index % 2 === 0 ? '3.4%' : '2.0%'}</div>
                            </div>
                            <div className="-ml-6 -mb-6 mt-2"><AccountBalancePieChart balance={account.balance} color={index % 2 === 0 ? primaryColor : accentColor} /></div>
                        </Card>
                    ))
                ) : (
                    <Card className="flex items-center justify-center min-h-[140px] md:col-span-2 lg:col-span-3"><div className="text-center text-text-secondary dark:text-text-secondary-dark"><p>{t('add_account_prompt')}</p></div></Card>
                )}
            </div>
        ),
        activity: (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-4 dark:bg-surface-dark">
                         <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('your_accounts')}</h3>
                            <button onClick={onAddAccount} className="flex items-center bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3 py-1 text-sm font-semibold transition-colors">
                                <PlusIcon className="w-4 h-4 mr-1"/>
                                {t('add')}
                            </button>
                        </div>
                        <div className="flex items-center space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                            <AllAccountsCard isSelected={selectedAccountId === null} onClick={() => setSelectedAccountId(null)} t={t} />
                            {accounts.map((acc, index) => {
                                const cardVariants: Array<'purple' | 'cyan' | 'dark'> = ['purple', 'cyan', 'dark'];
                                const variant = cardVariants[index % cardVariants.length];
                                return <CreditCardVisual key={acc.id} account={acc} formatCurrency={formatCurrency} variant={variant} isSelected={selectedAccountId === acc.id} onClick={() => setSelectedAccountId(acc.id)} />;
                            })}
                        </div>
                         <style>{`.custom-scrollbar::-webkit-scrollbar{height:6px;}.custom-scrollbar::-webkit-scrollbar-track{background:transparent;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:10px;}.dark .custom-scrollbar::-webkit-scrollbar-thumb{background:#4b5563;}`}</style>
                    </Card>

                    <Card className="dark:bg-surface-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark">
                                {t('activity')} <span className="text-base font-medium text-text-secondary dark:text-text-secondary-dark">{selectedAccount ? `(${selectedAccount.name})` : `(${t('all')})`}</span>
                            </h3>
                            <div className="text-text-secondary dark:text-text-secondary-dark text-sm flex items-center border border-secondary dark:border-border-dark rounded-lg px-2 py-1"><CalendarIcon className="w-5 h-5 mr-2"/> Jan 6, 2024 - Jan 11, 2024</div>
                        </div>
                        <ActivityChart transactions={displayedTransactions} primaryColor={primaryColor} accentColor={accentColor} formatCurrency={(amount) => formatCurrency(amount, primaryCurrency)} />
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-text-main dark:text-text-main-dark">
                                 {t('recent_activity')} <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{selectedAccount ? `(${selectedAccount.name})` : ''}</span>
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map(transaction => (
                                <RecentActivityItem key={transaction.id} transaction={transaction} account={accountMap.get(transaction.accountId)} formatCurrency={formatCurrency} />
                            ))}
                            {recentActivity.length === 0 && <p className="text-sm text-center py-4 text-text-secondary dark:text-text-secondary-dark">{t('noTransactionsFound')}</p>}
                        </div>
                    </Card>
                     <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-text-main dark:text-text-main-dark">{t('debt_summary')}</h3>
                            <button onClick={onAddDebt} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary transition-colors">
                                <PlusIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {debts.length > 0 ? (
                                debts.slice(0, 3).map(debt => {
                                    const amountPaid = debt.paidInstallments * debt.monthlyPayment;
                                    const remainingAmount = debt.totalAmount - amountPaid;
                                    return (
                                        <div key={debt.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-text-main dark:text-text-main-dark">{debt.name}</p>
                                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('next_payment')}: {new Date(debt.nextPaymentDate).toLocaleDateString()}</p>
                                            </div>
                                            <p className="font-semibold text-expense">{formatCurrency(remainingAmount, debt.currency)}</p>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('no_debts')}</p>
                            )}
                        </div>
                    </Card>
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-text-main dark:text-text-main-dark">{t('recurring_summary')}</h3>
                            <button onClick={onAddRecurring} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary transition-colors">
                                <PlusIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {upcomingRecurring.length > 0 ? (
                                upcomingRecurring.map(rec => (
                                    <div key={rec.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-text-main dark:text-text-main-dark">{rec.name}</p>
                                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('next_payment')}: {new Date(rec.nextPaymentDate).toLocaleDateString()}</p>
                                        </div>
                                        <p className={`font-semibold ${rec.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                            {formatCurrency(rec.amount, rec.currency)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('no_recurring')}</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        ),
        summary: (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <p className="text-text-secondary dark:text-text-secondary-dark">{t('total_income')} <span className="text-xs">({t('summary_in_primary_currency', { currency: primaryCurrency })})</span></p>
                    <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome, primaryCurrency)}</p>
                </Card>
                <Card>
                    <p className="text-text-secondary dark:text-text-secondary-dark">{t('expense')} <span className="text-xs">({t('summary_in_primary_currency', { currency: primaryCurrency })})</span></p>
                    <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses, primaryCurrency)}</p>
                </Card>
                <Card>
                    <p className="text-text-secondary dark:text-text-secondary-dark">{t('net_profit')} <span className="text-xs">({t('summary_in_primary_currency', { currency: primaryCurrency })})</span></p>
                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(profit, primaryCurrency)}</p>
                </Card>
            </div>
        )
    };

    return (
        <>
            <style>{`
                .dragging { opacity: 0.4; }
                .drag-over-indicator::before {
                    content: '';
                    position: absolute;
                    top: -0.75rem;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background-color: rgb(var(--color-primary));
                    border-radius: 2px;
                }
            `}</style>
            <div className="space-y-6">
                <Header t={t} notifications={notifications} userName={userName} theme={theme} toggleTheme={toggleTheme} />
                
                {sectionOrder.map(key => {
                    const isDraggingOver = dragOverKey === key && dragItem.current !== key;
                    return (
                        <div
                            key={key}
                            draggable
                            onDragStart={e => handleDragStart(e, key)}
                            onDragEnter={() => handleDragEnter(key)}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            className="draggable-section group relative"
                        >
                            <div className={`relative ${isDraggingOver ? 'drag-over-indicator' : ''}`}>
                                <div className="absolute top-4 right-4 text-text-secondary cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 transition-opacity z-10">
                                    <GripVerticalIcon className="w-6 h-6" />
                                </div>
                                {sections[key]}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default Dashboard;