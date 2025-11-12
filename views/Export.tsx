import React, { useMemo, useState } from 'react';
import { Transaction, Account, ColorTheme } from '../types';
import Card from '../components/Card';
import { DocumentArrowDownIcon } from '../components/icons';
import { exportToCSV, printReport } from '../utils/export';

interface ExportProps {
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string) => string;
  userName: string;
  colorTheme: ColorTheme;
}

const Export: React.FC<ExportProps> = ({ transactions, accounts, formatCurrency, t, userName, colorTheme }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => months.add(t.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const reportTransactions = useMemo(() => {
    if (!selectedMonth) return [];
    return transactions.filter(tr => tr.date.slice(0, 7) === selectedMonth);
  }, [transactions, selectedMonth]);
  
  const handleExportCSV = () => {
    exportToCSV(transactions, accountMap);
  };

  const handlePrintReport = () => {
    printReport('print-area', colorTheme, t);
  };

  const formattedMonth = new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('export_data')}</h1>
      
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('export_transactions_csv')}</h2>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('export_as_csv')}</p>
            </div>
            <button 
                onClick={handleExportCSV} 
                className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors w-full md:w-auto justify-center"
            >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                {t('export')}
            </button>
        </div>
      </Card>
      
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-grow">
                <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('generate_report')}</h2>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('print_report')}</p>
                 <div className="mt-4">
                    <label htmlFor="month-select-report" className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mr-2">{t('select_month')}:</label>
                    <select
                        id="month-select-report"
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
            <button 
                onClick={handlePrintReport} 
                className="flex items-center bg-secondary dark:bg-secondary-dark text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors w-full md:w-auto justify-center shrink-0"
            >
                {t('print_report')}
            </button>
        </div>
      </Card>

      {/* Hidden area for printing */}
      <div id="print-area" className="no-print" style={{ display: 'none' }}>
        <h1>{t('monthly_report_title', { month: formattedMonth })}</h1>
        <p><strong>{t('prepared_for')}:</strong> {userName}</p>
        <p><strong>{t('report_period')}:</strong> {formattedMonth}</p>
        
        <h2>{t('account_summary')}</h2>
        <table>
            <thead>
                <tr>
                    <th>{t('account_name')}</th>
                    <th>{t('account_type')}</th>
                    <th>{t('current_balance')}</th>
                </tr>
            </thead>
            <tbody>
                {accounts.map(acc => (
                    <tr key={acc.id}>
                        <td>{acc.name}</td>
                        <td>{t(acc.type)}</td>
                        <td>{formatCurrency(acc.balance, acc.currency)}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <h2>{t('transactions_report')}</h2>
        <table>
          <thead>
            <tr>
              <th>{t('date')}</th>
              <th>{t('description')}</th>
              <th>{t('category')}</th>
              <th>{t('account')}</th>
              <th>{t('amount')}</th>
            </tr>
          </thead>
          <tbody>
            {reportTransactions.length > 0 ? (
                reportTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tr => {
                const account = accountMap.get(tr.accountId);
                const amount = tr.type === 'income' ? tr.amount : -tr.amount;
                return (
                    <tr key={tr.id}>
                    <td>{new Date(tr.date).toLocaleDateString()}</td>
                    <td>{tr.description}</td>
                    <td>{t(`category_${tr.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`)}</td>
                    <td>{account?.name || 'N/A'}</td>
                    <td className={amount >= 0 ? 'income' : 'expense'}>
                        {formatCurrency(amount, account?.currency || 'USD')}
                    </td>
                    </tr>
                );
                })
            ) : (
                <tr>
                    <td colSpan={5} style={{textAlign: 'center', padding: '1rem'}}>{t('noTransactionsFound')}</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Export;