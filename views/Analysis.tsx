import React, { useMemo, useState, Fragment } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps, LineChart, Line, CartesianGrid } from 'recharts';
import { Transaction, Account, TransactionType, ColorTheme } from '../types';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { ShoppingCartIcon, BuildingStorefrontIcon, TruckIcon, BuildingOffice2Icon, HeartIcon, TicketIcon, BoltIcon, BriefcaseIcon, GiftIcon, ArrowTrendingUpIcon, GlobeAltIcon, ArrowUpIcon, CollectionIcon } from '../components/icons';

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


interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
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
  const [viewMode, setViewMode] = useState<'monthly' | 'allTime'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const currentPalette = themes[colorTheme];
  const toHex = (rgb: string) => '#' + rgb.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
  const primaryColor = toHex(currentPalette['--color-primary']);
  const accentColor = toHex(currentPalette['--color-accent']);
  const categoryColors = [primaryColor, accentColor, '#FFC107', '#E91E63', '#4CAF50', '#9C27B0', '#00BCD4', '#FF5722'];

  const accountCurrencyMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc.currency])), [accounts]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tr => {
      const isInMonth = viewMode === 'allTime' || tr.date.slice(0, 7) === selectedMonth;
      return isInMonth && accountCurrencyMap.get(tr.accountId) === primaryCurrency;
    });
  }, [transactions, selectedMonth, primaryCurrency, accountCurrencyMap, viewMode]);

  const { totalIncome, totalExpenses } = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: income, totalExpenses: expense };
  }, [filteredTransactions]);

  const netProfit = totalIncome - totalExpenses;

  const spendingByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);
  
  const cashFlowData = useMemo(() => {
    const data: { [month: string]: { name: string; Ingresos: number; Gastos: number } } = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.toISOString().slice(0, 7);
        const monthName = d.toLocaleString('default', { month: 'short' });
        data[monthKey] = { name: monthName, Ingresos: 0, Gastos: 0 };
    }

    transactions.forEach(t => {
        const monthKey = t.date.slice(0, 7);
        if (data[monthKey] && accountCurrencyMap.get(t.accountId) === primaryCurrency) {
            if (t.type === TransactionType.INCOME) {
                data[monthKey].Ingresos += t.amount;
            } else if (t.type === TransactionType.EXPENSE) {
                data[monthKey].Gastos += t.amount;
            }
        }
    });

    return Object.values(data);
}, [transactions, primaryCurrency, accountCurrencyMap]);


  const filteredTransactionsByCategory = useMemo(() => {
    if (!selectedCategory) {
        return [];
    }
    return filteredTransactions.filter(t => t.type === TransactionType.EXPENSE && t.category === selectedCategory).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCategory, filteredTransactions]);

  const availableMonths = useMemo(() => {
      const months = new Set<string>();
      transactions.forEach(t => months.add(t.date.slice(0, 7)));
      return Array.from(months).sort().reverse();
  }, [transactions]);
  
  const hasDataForCharts = filteredTransactions.length > 0;

  const getCategoryTranslation = (category: string) => {
    const key = `category_${category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;
    return t(key);
  }
  
  const handleCategoryClick = (data: any) => {
    const category = data.name;
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const formattedMonth = new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('analysis_title')}</h1>
        <div className="flex items-center gap-2 bg-secondary dark:bg-secondary-dark p-1 rounded-lg">
            <button onClick={() => setViewMode('monthly')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'monthly' ? 'bg-surface dark:bg-surface-dark shadow' : ''}`}>{t('monthly')}</button>
            <button onClick={() => setViewMode('allTime')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'allTime' ? 'bg-surface dark:bg-surface-dark shadow' : ''}`}>{t('all_time')}</button>
            {viewMode === 'monthly' && (
                <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0"
                >
                    {availableMonths.map(month => (
                        <option key={month} value={month}>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                    ))}
                </select>
            )}
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('total_income')}</p>
                <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome, primaryCurrency)}</p>
            </Card>
            <Card>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('expense')}</p>
                <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses, primaryCurrency)}</p>
            </Card>
            <Card>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('net_profit')}</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(netProfit, primaryCurrency)}</p>
            </Card>
        </div>

      {!hasDataForCharts ? (
          <Card className="flex items-center justify-center h-64">
              <p className="text-text-secondary dark:text-text-secondary-dark">{t('no_data_for_charts')}</p>
          </Card>
      ) : (
        <Fragment>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('cash_flow_over_time')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-border-dark" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} className="dark:stroke-text-secondary-dark" />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => formatCurrency(Number(value), primaryCurrency).replace(/(\.\d*|,\d*)/, '')} className="dark:stroke-text-secondary-dark"/>
                    <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} currency={primaryCurrency} />} />
                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                    <Line type="monotone" dataKey="Ingresos" stroke={primaryColor} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Gastos" stroke={accentColor} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('top_spending_categories')}</h2>
              <div className="space-y-3">
                  {spendingByCategory.slice(0, 5).map(cat => {
                      const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
                      const Icon = expenseCategoryIcons[cat.name] || CollectionIcon;
                      return (
                          <div key={cat.name} onClick={() => handleCategoryClick(cat)} className="cursor-pointer">
                              <div className="flex justify-between items-center mb-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
                                  <span className="font-semibold text-text-main dark:text-text-main-dark">{getCategoryTranslation(cat.name)}</span>
                                </div>
                                  <span>{formatCurrency(cat.value, primaryCurrency)}</span>
                              </div>
                              <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2">
                                  <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                          </div>
                      )
                  })}
              </div>
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
                          <div>
                            <p className="text-sm text-text-main dark:text-text-main-dark">{transaction.description}</p>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
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