import React, { useMemo, useState, useRef, useEffect } from 'react';
// FIX: Consolidate type imports and get Theme from the central types file.
import { Transaction, Account, TransactionType, Debt, Notification, ColorTheme, RecurringTransaction, Theme } from '../types';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import { PlusIcon, ArrowUpIcon, VisaIcon, StripeIcon, PaypalIcon, ApplePayIcon, CalendarIcon, ArrowDownIcon, CollectionIcon, GripVerticalIcon, ArrowPathIcon, CogIcon, XIcon, ShoppingCartIcon, BuildingStorefrontIcon, TruckIcon, BuildingOffice2Icon, HeartIcon, TicketIcon, BoltIcon, BriefcaseIcon, GiftIcon, ArrowTrendingUpIcon, GlobeAltIcon } from '../components/icons';
import { AccountBalancePieChart, ActivityChart, WeeklySpendingChart } from '../components/Charts';
import Notifications from '../components/Notifications';
import ThemeToggle from '../components/ThemeToggle';
import useLocalStorage from '../hooks/useLocalStorage';
import Switch from '../components/Switch';

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
  onOpenDetailModal: (title: string, transactions: Transaction[]) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
}

const expenseCategoryIcons: { [key: string]: React.FC<{ className?: string }> } = {
    'Food': BuildingStorefrontIcon,
    'Transport': TruckIcon,
    'Housing': BuildingOffice2Icon,
    'Entertainment': TicketIcon,
    'Health': HeartIcon,
    'Shopping': ShoppingCartIcon,
    'Utilities': BoltIcon,
    'Software': GlobeAltIcon,
    'Other': CollectionIcon,
};

const incomeCategoryIcons: { [key: string]: React.FC<{ className?: string }> } = {
    'Salary': BriefcaseIcon,
    'Freelance': BriefcaseIcon,
    'Gifts': GiftIcon,
    'Investments': ArrowTrendingUpIcon,
    'Other': ArrowUpIcon,
};

const getIconForTransaction = (transaction: Transaction): React.FC<{ className?: string }> => {
    const desc = transaction.description.toLowerCase();
    
    if (transaction.type === TransactionType.TRANSFER) return ArrowPathIcon;

    if (transaction.type === TransactionType.INCOME) {
        const depositIcons: { [key: string]: React.FC<{ className?: string }> } = {
            'visa': VisaIcon, 'stripe': StripeIcon,
            'paypal': PaypalIcon, 'apple': ApplePayIcon,
        };
        const lowerDesc = desc.toLowerCase();
        for (const keyword in depositIcons) {
            if (lowerDesc.includes(keyword)) {
                return depositIcons[keyword];
            }
        }
        return incomeCategoryIcons[transaction.category] || ArrowUpIcon;
    }

    // Expense
    const googleKeywords = ['google', 'youtube', 'gcp', 'gsuite'];
    if (googleKeywords.some(kw => desc.includes(kw))) {
        return GlobeAltIcon;
    }

    return expenseCategoryIcons[transaction.category] || ArrowDownIcon;
};


const Header: React.FC<{ t: (key: string, params?: { [key: string]: string | number }) => string; notifications: Notification[], userName: string, theme: Theme, toggleTheme: () => void, onCustomize: () => void }> = ({ t, notifications, userName, theme, toggleTheme, onCustomize }) => {
    const [isShimmering, setIsShimmering] = useState(true);

    useEffect(() => {
        setIsShimmering(true);
        const timer = setTimeout(() => setIsShimmering(false), 2000);
        return () => clearTimeout(timer);
    }, [userName]);

    const welcomeString = t('welcome_back');
    const parts = welcomeString.split('{userName}');
    const welcomeTextStart = parts[0];
    const welcomeTextEnd = parts[1];

    return (
        <div className="hidden md:flex justify-between items-center mb-6">
            <div>
                 <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">
                    {welcomeTextStart}
                    <span className={isShimmering ? 'shimmer-text-anim' : 'text-primary'}>
                        {userName}
                    </span>
                    {welcomeTextEnd}
                </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                <button onClick={onCustomize} className="p-2 rounded-full text-text-secondary dark:text-gray-400 hover:bg-secondary dark:hover:bg-gray-700" title={t('customize_dashboard')}>
                    <CogIcon className="w-6 h-6" />
                </button>
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


const RecentActivityItem: React.FC<{ transaction: Transaction, accounts: Map<string, Account>, formatCurrency: (amount: number, currency: string) => string, t: (key: string) => string }> = ({ transaction, accounts, formatCurrency, t }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const isTransfer = transaction.type === TransactionType.TRANSFER;
    const Icon = getIconForTransaction(transaction);

    const account = accounts.get(transaction.accountId);
    const destAccount = isTransfer ? accounts.get(transaction.destinationAccountId!) : null;
    
    const getCategoryTranslation = (category: string) => {
        if (!category) return '';
        const key = `category_${category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;
        return t(key);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-4 ${isIncome ? 'bg-green-100 dark:bg-green-900/50' : isTransfer ? 'bg-primary/10 dark:bg-primary/20' : 'bg-red-100 dark:bg-red-900/50'}`}>
                    <Icon className={`w-6 h-6 ${isIncome ? 'text-income' : isTransfer ? 'text-primary' : 'text-expense'}`} />
                </div>
                <div>
                    <p className="font-semibold text-text-main dark:text-text-main-dark">{transaction.description}</p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        {isTransfer ? `${account?.name} → ${destAccount?.name}` : getCategoryTranslation(transaction.category)}
                    </p>
                </div>
            </div>
            <p className={`font-semibold ${isIncome ? 'text-income' : isTransfer ? 'text-text-main dark:text-text-main-dark' : 'text-expense'}`}>
                {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(transaction.amount, account?.currency || 'USD')}
            </p>
        </div>
    );
};

const defaultSectionOrder = ['accountBalances', 'accountSelector', 'recentActivity', 'activityChart', 'debtSummary', 'recurringSummary', 'overallSummary', 'weeklySpending'];
const defaultVisibleSections = ['accountBalances', 'accountSelector', 'activityChart', 'recentActivity', 'debtSummary', 'recurringSummary', 'overallSummary', 'weeklySpending'];

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, debts, recurringTransactions, theme, toggleTheme, colorTheme, formatCurrency, t, notifications, userName, onAddAccount, onAddDebt, onAddRecurring, primaryCurrency, onOpenDetailModal, selectedAccountId, setSelectedAccountId }) => {
    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);
    
    const [sectionOrder, setSectionOrder] = useLocalStorage<string[]>('dashboard-layout-v3', defaultSectionOrder);
    const [visibleSections, setVisibleSections] = useLocalStorage<string[]>('dashboard-visible-sections-v3', defaultVisibleSections);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSettingsOpen && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSettingsOpen]);

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

    const handleVisibilityChange = (sectionKey: string, isVisible: boolean) => {
        if (isVisible) {
            setVisibleSections(prev => [...prev, sectionKey]);
        } else {
            setVisibleSections(prev => prev.filter(key => key !== sectionKey));
        }
    };
    
    const handleResetLayout = () => {
        setSectionOrder(defaultSectionOrder);
        setVisibleSections(defaultVisibleSections);
        setIsSettingsOpen(false);
    };

    const currentPalette = themes[colorTheme];
    const toHex = (rgb: string) => '#' + rgb.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
    
    const primaryColor = toHex(currentPalette['--color-primary']);
    const accentColor = toHex(currentPalette['--color-accent']);
    
    const selectedAccount = useMemo(() => {
        return accounts.find(acc => acc.id === selectedAccountId) || null;
    }, [accounts, selectedAccountId]);

    const displayedTransactions = useMemo(() => {
        if (!selectedAccountId) return transactions;
        return transactions.filter(t => t.accountId === selectedAccountId || t.destinationAccountId === selectedAccountId);
    }, [transactions, selectedAccountId]);
    
    const nonTransferTransactionsForChart = useMemo(() => displayedTransactions.filter(t => t.type !== TransactionType.TRANSFER), [displayedTransactions]);

    const accountBalanceChanges = useMemo(() => {
        const changes = new Map<string, number>();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
        accounts.forEach(account => {
            const relevantTransactions = transactions.filter(t => 
                (t.accountId === account.id || t.destinationAccountId === account.id) && new Date(t.date) >= thirtyDaysAgo
            );
    
            const netChange = relevantTransactions.reduce((acc, t) => {
                if (t.type === TransactionType.INCOME && t.accountId === account.id) return acc + t.amount;
                if (t.type === TransactionType.EXPENSE && t.accountId === account.id) return acc - t.amount;
                if (t.type === TransactionType.TRANSFER) {
                    if (t.accountId === account.id) return acc - t.amount; // Source
                    if (t.destinationAccountId === account.id) return acc + t.amount; // Destination
                }
                return acc;
            }, 0);
    
            const balance30DaysAgo = account.balance - netChange;
    
            if (balance30DaysAgo === 0) {
                changes.set(account.id, netChange > 0 ? 100.0 : 0);
            } else {
                const percentageChange = (netChange / Math.abs(balance30DaysAgo)) * 100;
                changes.set(account.id, isFinite(percentageChange) ? percentageChange : 0);
            }
        });
        return changes;
    }, [accounts, transactions]);

    const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => b.balance - a.balance), [accounts]);
    
    const displayedBalanceCards = useMemo(() => {
        if (selectedAccountId) {
            const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
            return selectedAccount ? [selectedAccount] : [];
        }
        return sortedAccounts;
    }, [selectedAccountId, accounts, sortedAccounts]);

    const dateRangeText = useMemo(() => {
        if (displayedTransactions.length < 1) {
            return null;
        }

        const dates = displayedTransactions.map(t => new Date(t.date).getTime());
        const minTimestamp = Math.min(...dates);
        const maxTimestamp = Math.max(...dates);
        
        if (!isFinite(minTimestamp) || !isFinite(maxTimestamp)) {
            return null;
        }

        const minDate = new Date(minTimestamp);
        const maxDate = new Date(maxTimestamp);
        
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const formatter = new Intl.DateTimeFormat(undefined, options);

        if (minDate.toDateString() === maxDate.toDateString()) {
            return formatter.format(minDate);
        }
        
        return `${formatter.format(minDate)} - ${formatter.format(maxDate)}`;
    }, [displayedTransactions]);

    const recentActivity = useMemo(() => 
        [...displayedTransactions].sort((a, b) => {
            const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComparison !== 0) return dateComparison;
            return b.id.localeCompare(a.id);
        }).slice(0, 5), 
    [displayedTransactions]);
    
    const { totalIncome, totalExpenses, profit } = useMemo(() => {
        const accountCurrencyMap = new Map(accounts.map(acc => [acc.id, acc.currency]));

        const transactionsInPrimaryCurrency = displayedTransactions
            .filter(t => t.type !== TransactionType.TRANSFER)
            .filter(t => accountCurrencyMap.get(t.accountId) === primaryCurrency);

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

    const handleChartDayClick = (dateString: string, filterType?: TransactionType) => { // dateString is 'YYYY-MM-DD'
        let dailyTransactions = transactions.filter(t => t.date === dateString);
        
        const displayDate = new Date(dateString + 'T00:00:00').toLocaleDateString(t.length > 0 ? 'en' : 'en', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        });

        let modalTitle = t('transactions_on_date', { date: displayDate });

        if (filterType === TransactionType.EXPENSE) {
            dailyTransactions = dailyTransactions.filter(t => t.type === TransactionType.EXPENSE);
            modalTitle = t('expenses_on_date', { date: displayDate });
        }
    
        onOpenDetailModal(modalTitle, dailyTransactions);
    };
    
    const getAccountGridClasses = (count: number) => {
        if (count === 1) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6";
        if (count === 2) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6";
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }

    const sections: { [key: string]: { nameKey: string, content: React.ReactNode } } = {
        accountBalances: {
            nameKey: 'section_accountBalances',
            content: (
                <div className={getAccountGridClasses(displayedBalanceCards.length)}>
                    {accounts.length > 0 ? (
                        displayedBalanceCards.map((account) => {
                            const change = accountBalanceChanges.get(account.id) ?? 0;
                            const isPositive = change >= 0;
                            const originalIndex = sortedAccounts.findIndex(a => a.id === account.id);
                            return (
                                <Card key={account.id} className={`${displayedBalanceCards.length === 1 ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-text-secondary dark:text-text-secondary-dark">{account.name}</p>
                                            <p className="text-3xl font-bold text-text-main dark:text-text-main-dark">{formatCurrency(account.balance, account.currency)}</p>
                                        </div>
                                        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-income' : 'text-expense'}`}>
                                            {isPositive ? <ArrowUpIcon className="w-4 h-4 mr-1"/> : <ArrowDownIcon className="w-4 h-4 mr-1"/>}
                                            {Math.abs(change).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="-ml-6 -mb-6 mt-2"><AccountBalancePieChart balance={account.balance} color={originalIndex % 2 === 0 ? primaryColor : accentColor} /></div>
                                </Card>
                            )
                        })
                    ) : (
                        <Card className="flex items-center justify-center min-h-[140px] md:col-span-2 lg:col-span-3"><div className="text-center text-text-secondary dark:text-text-secondary-dark"><p>{t('add_account_prompt')}</p></div></Card>
                    )}
                </div>
            )
        },
        accountSelector: {
            nameKey: 'section_accountSelector',
            content: (
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
            )
        },
        activityChart: {
            nameKey: 'section_activityChart',
            content: (
                 <Card className="dark:bg-surface-dark">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark">
                            {t('activity')} <span className="text-base font-medium text-text-secondary dark:text-text-secondary-dark">{selectedAccount ? `(${selectedAccount.name})` : `(${t('all')})`}</span>
                        </h3>
                        {dateRangeText && (
                            <div className="text-text-secondary dark:text-text-secondary-dark text-sm flex items-center border border-secondary dark:border-border-dark rounded-lg px-2 py-1">
                                <CalendarIcon className="w-5 h-5 mr-2"/>
                                {dateRangeText}
                            </div>
                        )}
                    </div>
                    <ActivityChart transactions={nonTransferTransactionsForChart} primaryColor={primaryColor} accentColor={accentColor} formatCurrency={(amount) => formatCurrency(amount, primaryCurrency)} onDayClick={handleChartDayClick} />
                </Card>
            )
        },
        recentActivity: {
            nameKey: 'section_recentActivity',
            content: (
                 <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text-main dark:text-text-main-dark">
                                {t('recent_activity')} <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{selectedAccount ? `(${selectedAccount.name})` : ''}</span>
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map(transaction => (
                            <RecentActivityItem key={transaction.id} transaction={transaction} accounts={accountMap} formatCurrency={formatCurrency} t={t} />
                        ))}
                        {recentActivity.length === 0 && <p className="text-sm text-center py-4 text-text-secondary dark:text-text-secondary-dark">{t('noTransactionsFound')}</p>}
                    </div>
                </Card>
            )
        },
        debtSummary: {
            nameKey: 'section_debtSummary',
            content: (
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
            )
        },
        recurringSummary: {
            nameKey: 'section_recurringSummary',
            content: (
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
            )
        },
        overallSummary: {
            nameKey: 'section_overallSummary',
            content: (
             <Card>
                <div className="space-y-4">
                     <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('overall_summary')}</h2>
                    <div>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('total_income')} <span className="text-xs">({t('summary_in_primary_currency', { currency: primaryCurrency })})</span></p>
                        <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome, primaryCurrency)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('expense')} <span className="text-xs">({t('summary_in_primary_currency', { currency: primaryCurrency })})</span></p>
                        <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses, primaryCurrency)}</p>
                    </div>
                </div>
             </Card>
            )
        },
        weeklySpending: {
            nameKey: 'section_weeklySpending',
            content: (
                <Card>
                     <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark mb-2">{t('weekly_spending')}</h3>
                    <WeeklySpendingChart 
                        transactions={transactions}
                        accounts={accounts}
                        primaryCurrency={primaryCurrency}
                        accentColor={accentColor}
                        formatCurrency={formatCurrency}
                        t={t}
                        onBarClick={(date) => handleChartDayClick(date, TransactionType.EXPENSE)}
                    />
                </Card>
            )
        }
    };
    
    const renderDraggableSection = (key: string) => {
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
                className="draggable-section group relative transition-all duration-300"
            >
                <div className={`relative ${isDraggingOver ? 'drag-over-indicator' : ''}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 p-2 text-text-secondary cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 transition-opacity z-10 bg-surface/50 dark:bg-surface-dark/50 rounded-full">
                        <GripVerticalIcon className="w-5 h-5" />
                    </div>
                    {sections[key].content}
                </div>
            </div>
        );
    };

    const mainColKeys = ['accountSelector', 'activityChart', 'overallSummary'];
    const sideColKeys = ['recentActivity', 'debtSummary', 'recurringSummary', 'weeklySpending'];
    const sectionsToRender = sectionOrder.filter(key => visibleSections.includes(key) && sections[key]);
    
    const layout = useMemo(() => sectionsToRender.reduce((acc, key) => {
        const isColumnItem = mainColKeys.includes(key) || sideColKeys.includes(key);
        const lastBlock = acc[acc.length - 1];

        if (isColumnItem) {
            if (lastBlock && lastBlock.type === 'columns') {
                if (mainColKeys.includes(key)) lastBlock.main.push(key);
                else lastBlock.side.push(key);
            } else {
                acc.push({
                    type: 'columns',
                    main: mainColKeys.includes(key) ? [key] : [],
                    side: sideColKeys.includes(key) ? [key] : []
                });
            }
        } else {
            acc.push({ type: 'full', key: key });
        }
        return acc;
    }, [] as Array<{ type: 'full', key: string } | { type: 'columns', main: string[], side: string[] }>), [sectionsToRender]);


    return (
        <>
            <style>{`
                .dragging { opacity: 0.4; border: 2px dashed rgb(var(--color-primary)); }
                .drag-over-indicator::before {
                    content: '';
                    position: absolute;
                    top: -0.5rem;
                    left: 0.5rem;
                    right: 0.5rem;
                    height: 4px;
                    background-color: rgb(var(--color-primary));
                    border-radius: 2px;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                 @keyframes pulse {
                    0% { transform: scaleX(0.95); opacity: 0.7; }
                    50% { transform: scaleX(1); opacity: 1; }
                    100% { transform: scaleX(0.95); opacity: 0.7; }
                }
            `}</style>
            <div>
                <Header t={t} notifications={notifications} userName={userName} theme={theme} toggleTheme={toggleTheme} onCustomize={() => setIsSettingsOpen(true)} />

                {isSettingsOpen && (
                    <div ref={settingsRef} className="absolute top-20 right-8 bg-surface dark:bg-surface-dark p-4 rounded-lg shadow-lg border border-secondary dark:border-border-dark z-20 w-72">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">{t('customize_dashboard')}</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full hover:bg-secondary dark:hover:bg-secondary-dark"><XIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-2">
                            {Object.keys(sections).map(key => (
                                <div key={key} className="flex items-center justify-between">
                                    <label htmlFor={`switch-${key}`} className="text-sm">{t(sections[key].nameKey)}</label>
                                    <Switch
                                        id={`switch-${key}`}
                                        checked={visibleSections.includes(key)}
                                        onChange={(isChecked) => handleVisibilityChange(key, isChecked)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-secondary dark:border-border-dark">
                            <button onClick={handleResetLayout} className="text-sm text-primary hover:underline w-full text-left">
                                {t('reset_layout')}
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="space-y-6">
                    {layout.map((block, index) => {
                        if (block.type === 'full') {
                            return renderDraggableSection(block.key);
                        }
                        if (block.type === 'columns') {
                            return (
                                <div key={`col-grid-${index}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        {block.main.map(renderDraggableSection)}
                                    </div>
                                    <div className="lg:col-span-1 space-y-6">
                                        {block.side.map(renderDraggableSection)}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </>
    );
};

export default Dashboard;