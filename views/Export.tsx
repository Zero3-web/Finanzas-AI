import React, { useMemo } from 'react';
import { Transaction, Account, ColorTheme } from '../types';
import Card from '../components/Card';
import { DocumentArrowDownIcon } from '../components/icons';
import { themes } from '../hooks/useColorTheme';

interface ExportProps {
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string) => string;
  userName: string;
  colorTheme: ColorTheme;
}

const Export: React.FC<ExportProps> = ({ transactions, accounts, formatCurrency, t, userName, colorTheme }) => {

  // FIX: Wrap accountMap creation in useMemo to fix type inference issues and improve performance.
  const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);
  const currentPalette = themes[colorTheme];

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Currency', 'Type', 'Account Name', 'Account ID'];
    const rows = transactions.map(tr => {
      const account = accountMap.get(tr.accountId);
      return [
        tr.id,
        tr.date,
        `"${tr.description.replace(/"/g, '""')}"`, // Handle quotes
        tr.category,
        tr.amount,
        account?.currency || '',
        tr.type,
        account?.name || 'N/A',
        tr.accountId,
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finanzas_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Finanzas Report</title>');
      printWindow.document.write(`
        <style>
          body { font-family: sans-serif; margin: 2rem; }
          h1, h2 { color: rgb(${currentPalette['--color-primary']}); }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .income { color: green; }
          .expense { color: red; }
          .no-print { display: none; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(document.getElementById('print-area')?.innerHTML || '');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      // Use timeout to ensure content is loaded before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('generate_report')}</h2>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('print_report')}</p>
            </div>
            <button 
                onClick={handlePrintReport} 
                className="flex items-center bg-secondary dark:bg-secondary-dark text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors w-full md:w-auto justify-center"
            >
                {t('print_report')}
            </button>
        </div>
      </Card>

      {/* Hidden area for printing */}
      <div id="print-area" className="no-print" style={{ display: 'none' }}>
        <h1>Finanzas</h1>
        <p><strong>{t('prepared_for')}:</strong> {userName}</p>
        <p><strong>{t('report_date')}:</strong> {new Date().toLocaleDateString()}</p>
        
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
            {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tr => {
              const account = accountMap.get(tr.accountId);
              const amount = tr.type === 'income' ? tr.amount : -tr.amount;
              return (
                <tr key={tr.id}>
                  <td>{new Date(tr.date).toLocaleDateString()}</td>
                  <td>{tr.description}</td>
                  <td>{t(`category_${tr.category.toLowerCase()}`)}</td>
                  <td>{account?.name || 'N/A'}</td>
                  <td className={amount >= 0 ? 'income' : 'expense'}>
                    {formatCurrency(amount, account?.currency || 'USD')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Export;