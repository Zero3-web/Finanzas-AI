import React, { useMemo, useState, Fragment } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { Transaction, Account, TransactionType, ColorTheme } from '../types';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { PencilIcon, TrashIcon } from '../components/icons';

interface AnalysisProps {
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  colorTheme: ColorTheme;
  primaryCurrency: string;
  onOpenDetailModal: (title: string, transactions: Transaction[]) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onRemoveTransaction: (transactionId: string) => void;
}

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
  onOpenDetailModal,
  onEditTransaction,
  onRemoveTransaction
 }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // State from History component
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ key: 'date', order: 'desc' });
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType.INCOME | TransactionType.EXPENSE>('all');

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

  // Logic from History component
  const filteredAndSortedTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
          if (typeFilter === 'all') return true;
          return t.type === typeFilter;
      })
      .filter(t => t.description.toLowerCase().includes(filter.toLowerCase()) || t.category.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sort.key === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sort.order === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sort.key === 'amount') {
          return sort.order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        return 0;
      });
  }, [transactions, filter, sort, typeFilter]);

  const handleSort = (key: 'date' | 'amount') => {
    if (sort.key === key) {
        setSort(prev => ({...prev, order: prev.order === 'asc' ? 'desc' : 'asc'}));
    } else {
        setSort({ key, order: 'desc' });
    }
  }

  const getButtonClasses = (type: 'all' | TransactionType) => {
    const baseClasses = "px-4 py-2 rounded-lg text-sm font-semibold transition-colors";
    if (typeFilter === type) {
        return `${baseClasses} bg-primary text-white`;
    }
    return `${baseClasses} bg-surface dark:bg-surface-dark hover:bg-secondary dark:hover:bg-secondary-dark`;
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

      {/* Merged History section */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark">{t('transaction_history')}</h2>
        <Card className="p-4 space-y-4">
          <input 
              type="text"
              placeholder={t('search_transactions')}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full bg-secondary dark:bg-secondary-dark border-transparent rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-text-main-dark p-3"
              id="search-transactions"
          />
          <div className="flex items-center space-x-2">
              <button onClick={() => setTypeFilter('all')} className={getButtonClasses('all')}>
                  {t('all')}
              </button>
              <button onClick={() => setTypeFilter(TransactionType.INCOME)} className={getButtonClasses(TransactionType.INCOME)}>
                  {t('income')}
              </button>
              <button onClick={() => setTypeFilter(TransactionType.EXPENSE)} className={getButtonClasses(TransactionType.EXPENSE)}>
                  {t('expense')}
              </button>
          </div>
        </Card>

        {/* Desktop Table View */}
        <Card className="hidden md:block">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="border-b border-secondary dark:border-border-dark text-sm text-text-secondary dark:text-text-secondary-dark" id="history-table-header">
                      <tr>
                          <th className="p-3 cursor-pointer" onClick={() => handleSort('date')}>{t('date')}</th>
                          <th className="p-3">{t('description')}</th>
                          <th className="p-3">{t('category')}</th>
                          <th className="p-3">{t('account')}</th>
                          <th className="p-3 text-right cursor-pointer" onClick={() => handleSort('amount')}>{t('amount')}</th>
                          <th className="p-3 text-right">{t('actions')}</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredAndSortedTransactions.map((transaction, index) => {
                          const account = accountCurrencyMap.get(transaction.accountId);
                          return (
                          <tr 
                              key={transaction.id} 
                              className="border-b border-secondary dark:border-border-dark last:border-b-0 hover:bg-secondary dark:hover:bg-secondary-dark/50 animate-item-fade-in"
                              style={{ animationDelay: `${index * 30}ms` }}
                          >
                              <td className="p-3">{new Date(transaction.date).toLocaleDateString()}</td>
                              <td className="p-3">{transaction.description}</td>
                              <td className="p-3">{getCategoryTranslation(transaction.category)}</td>
                              <td className="p-3">{account?.name}</td>
                              <td className={`p-3 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-income' : 'text-expense'}`}>
                                  {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount, account?.currency || 'USD')}
                              </td>
                              <td className="p-3 text-right">
                                  <button onClick={() => onEditTransaction(transaction)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary p-1">
                                      <PencilIcon className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => onRemoveTransaction(transaction.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense p-1 ml-2">
                                      <TrashIcon className="w-5 h-5" />
                                  </button>
                              </td>
                          </tr>
                      )})}
                  </tbody>
              </table>
          </div>
          {filteredAndSortedTransactions.length === 0 && (
              <div className="text-center py-10">
                  <p className="text-text-secondary dark:text-text-secondary-dark">{t('noTransactionsFound')}</p>
              </div>
          )}
        </Card>

        {/* Mobile Card List View */}
        <div className="md:hidden space-y-3">
          {filteredAndSortedTransactions.length > 0 ? (
            filteredAndSortedTransactions.map((transaction, index) => {
              const account = accountCurrencyMap.get(transaction.accountId);
              return (
              <Card 
                  key={transaction.id} 
                  className="p-4 animate-item-fade-in" 
                  id={`transaction-${transaction.id}`}
                  style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm bg-secondary dark:bg-secondary-dark px-2 py-1 rounded-md">{getCategoryTranslation(transaction.category)}</span>
                  <p className={`font-semibold text-lg ${transaction.type === TransactionType.INCOME ? 'text-income' : 'text-expense'}`}>
                      {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount, account?.currency || 'USD')}
                  </p>
                </div>
                <p className="font-semibold text-text-main dark:text-text-main-dark mb-3 break-words">{transaction.description}</p>
                <div className="flex justify-between items-center text-sm text-text-secondary dark:text-gray-500">
                    <span>{account?.name} &bull; {new Date(transaction.date).toLocaleDateString()}</span>
                    <div>
                        <button onClick={() => onEditTransaction(transaction)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary p-1 rounded-full">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onRemoveTransaction(transaction.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense p-1 ml-1 rounded-full">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
              </Card>
            )})
          ) : (
            <Card>
              <div className="text-center py-10">
                  <p className="text-text-secondary dark:text-text-secondary-dark">{t('noTransactionsFound')}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;