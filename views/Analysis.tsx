import React, { useMemo, useState, Fragment } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { Transaction, Account, TransactionType, ColorTheme } from '../types';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { PencilIcon, TrashIcon, ShoppingCartIcon, BuildingStorefrontIcon, TruckIcon, BuildingOffice2Icon, HeartIcon, TicketIcon, BoltIcon, BriefcaseIcon, GiftIcon, ArrowTrendingUpIcon, GlobeAltIcon, ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, VisaIcon, StripeIcon, PaypalIcon, ApplePayIcon, CollectionIcon } from '../components/icons';

interface AnalysisProps {
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  colorTheme: ColorTheme;
  primaryCurrency: string;
  onOpenDetailModal: (title: string, transactions: Transaction[]) => void;
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

    const googleKeywords = ['google', 'youtube', 'gcp', 'gsuite'];
    if (googleKeywords.some(kw => desc.includes(kw))) {
        return GlobeAltIcon;
    }

    return expenseCategoryIcons[transaction.category] || ArrowDownIcon;
};


interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
    // FIX: Add missing properties passed by recharts Tooltip component to resolve destructuring error.
    active?: boolean;
    payload?: any[];
    label?: string;
    formatCurrency: (amount: number, currency: string) => string;
    currency: string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency, currency }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface dark:bg-secondary-dark p-2 border border-secondary dark:border-border-dark rounded-md shadow-lg text-sm">
          <p className="label text-text-main dark:text-text-main-dark font-semibold">{`${label}`}</p>
          {payload.map((pld, index) => (
             <p key={index} style={{ color: pld.color }} className="intro">{`${pld.name}: ${formatCurrency(pld.value as number, currency)}`}</p>
          ))}
        </div>
      );
    }
  
    return null;
};

const Analysis: React.FC<AnalysisProps> = ({ 
  transactions, 
  accounts, 
  formatCurrency, 
  t, 
  colorTheme, 
  primaryCurrency, 
  onOpenDetailModal
 }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const currentPalette = themes[colorTheme];
  const toHex = (rgb: string) => '#' + rgb.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
  const primaryColor = toHex(currentPalette['--color-primary']);
  const accentColor = toHex(currentPalette['--color-accent']);
  const categoryColors = [primaryColor, accentColor, '#FFC107', '#E91E63', '#4CAF50', '#9C27B0', '#00BCD4', '#FF5722'];

  const accountCurrencyMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc.currency])), [accounts]);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(tr => {
      const transactionMonth = tr.date.slice(0, 7);
      return transactionMonth === selectedMonth && accountCurrencyMap.get(tr.accountId) === primaryCurrency;
    });
  }, [transactions, selectedMonth, primaryCurrency, accountCurrencyMap]);

  const { currentMonthIncome, currentMonthExpenses } = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { currentMonthIncome: income, currentMonthExpenses: expense };
  }, [monthlyTransactions]);

  const currentMonthProfit = currentMonthIncome - currentMonthExpenses;

  const spendingByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);

  const filteredTransactionsByCategory = useMemo(() => {
    if (!selectedCategory) {
        return [];
    }
    return monthlyTransactions.filter(t => t.type === TransactionType.EXPENSE && t.category === selectedCategory).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCategory, monthlyTransactions]);

  const monthlyOverviewData = useMemo(() => {
    return [{ name: t('monthly_overview'), [t('income')]: currentMonthIncome, [t('expense')]: currentMonthExpenses }];
  }, [currentMonthIncome, currentMonthExpenses, t]);
  
  const availableMonths = useMemo(() => {
      const months = new Set<string>();
      transactions.forEach(t => months.add(t.date.slice(0, 7)));
      return Array.from(months).sort().reverse();
  }, [transactions]);
  
  const hasDataForCharts = monthlyTransactions.length > 0;

  const getCategoryTranslation = (category: string) => {
    const key = `category_${category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;
    return t(key);
  }
  
  const handleCategoryClick = (data: any) => {
    const category = data.name;
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const formattedMonth = new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleBarClick = (data: any, index: number) => {
      const barName = data.dataKey;
      const type = barName === t('income') ? TransactionType.INCOME : TransactionType.EXPENSE;
      const typeTransactions = monthlyTransactions.filter(t => t.type === type);
      const title = type === TransactionType.INCOME 
          ? t('income_for_month', { month: formattedMonth }) 
          : t('expense_for_month', { month: formattedMonth });
      onOpenDetailModal(title, typeTransactions);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('analysis_title')}</h1>
        <div className="flex items-center gap-2">
            <label htmlFor="month-select" className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('select_month')}:</label>
            <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-surface dark:bg-surface-dark border border-secondary dark:border-border-dark rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            >
                {availableMonths.map(month => (
                    <option key={month} value={month}>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                ))}
            </select>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('total_income')}</p>
                <p className="text-2xl font-bold text-income">{formatCurrency(currentMonthIncome, primaryCurrency)}</p>
            </Card>
            <Card>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('expense')}</p>
                <p className="text-2xl font-bold text-expense">{formatCurrency(currentMonthExpenses, primaryCurrency)}</p>
            </Card>
            <Card>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('net_profit')}</p>
                <p className={`text-2xl font-bold ${currentMonthProfit >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(currentMonthProfit, primaryCurrency)}</p>
            </Card>
        </div>

      {!hasDataForCharts ? (
          <Card className="flex items-center justify-center h-64">
              <p className="text-text-secondary dark:text-text-secondary-dark">{t('no_data_for_charts')}</p>
          </Card>
      ) : (
        <Fragment>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('spending_by_category')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={spendingByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label onClick={handleCategoryClick} style={{cursor: 'pointer'}}>
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} currency={primaryCurrency} />} />
                  <Legend iconSize={10} formatter={(value) => getCategoryTranslation(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('income_vs_expense')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyOverviewData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} currency={primaryCurrency} />} />
                  <Legend wrapperStyle={{fontSize: "14px"}}/>
                  <Bar dataKey={t('income')} fill={primaryColor} radius={[0, 10, 10, 0]} barSize={30} onClick={handleBarClick} style={{cursor: 'pointer'}} />
                  <Bar dataKey={t('expense')} fill={accentColor} radius={[0, 10, 10, 0]} barSize={30} onClick={handleBarClick} style={{cursor: 'pointer'}} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          {selectedCategory && (
            <Card className="animate-view-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">
                        {t('transactions_for_category', { category: getCategoryTranslation(selectedCategory) })}
                    </h2>
                    <button onClick={() => setSelectedCategory(null)} className="text-sm font-semibold text-primary hover:underline">{t('cancel')}</button>
                </div>
                <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                  {filteredTransactionsByCategory.length > 0 ? (
                    filteredTransactionsByCategory.map(transaction => {
                      const account = accountCurrencyMap.get(transaction.accountId);
                      return (
                        <div key={transaction.id} className="flex justify-between items-center p-2 bg-secondary dark:bg-secondary-dark rounded-md">
                          <p className="text-sm text-text-main dark:text-text-main-dark">{transaction.description}</p>
                          <p className="font-semibold text-expense text-sm">-{formatCurrency(transaction.amount, account?.currency || primaryCurrency)}</p>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-text-secondary dark:text-text-secondary-dark py-4">{t('noTransactionsFound')}</p>
                  )}
                </div>
            </Card>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default Analysis;