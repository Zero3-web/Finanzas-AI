import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { Transaction, Account, TransactionType, ColorTheme } from '../types';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface AnalysisProps {
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string) => string;
  colorTheme: ColorTheme;
  primaryCurrency: string;
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

const Analysis: React.FC<AnalysisProps> = ({ transactions, accounts, formatCurrency, t, colorTheme, primaryCurrency }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

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

  const monthlyOverviewData = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return [{ name: t('monthly_overview'), [t('income')]: income, [t('expense')]: expense }];
  }, [monthlyTransactions, t]);
  
  const availableMonths = useMemo(() => {
      const months = new Set<string>();
      transactions.forEach(t => months.add(t.date.slice(0, 7)));
      return Array.from(months).sort().reverse();
  }, [transactions]);
  
  const hasData = monthlyTransactions.length > 0;

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
      
      {!hasData ? (
          <Card className="flex items-center justify-center h-64">
              <p className="text-text-secondary dark:text-text-secondary-dark">{t('no_data_for_charts')}</p>
          </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('spending_by_category')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={spendingByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} currency={primaryCurrency} />} />
                <Legend iconSize={10} formatter={(value) => t(`category_${value.toLowerCase()}`)} />
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
                <Bar dataKey={t('income')} fill={primaryColor} radius={[0, 10, 10, 0]} barSize={30} />
                <Bar dataKey={t('expense')} fill={accentColor} radius={[0, 10, 10, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analysis;