import { Transaction, Account, ColorTheme } from '../types';
import { themes } from '../hooks/useColorTheme';

export const exportToCSV = (transactions: Transaction[], accounts: Map<string, Account>) => {
  const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Currency', 'Type', 'Account Name', 'Account ID'];
  const rows = transactions.map(tr => {
    const account = accounts.get(tr.accountId);
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

export const printReport = (
    printAreaId: string, 
    colorTheme: ColorTheme, 
    t: (key: string) => string
) => {
    const currentPalette = themes[colorTheme];
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
        printWindow.document.write(document.getElementById(printAreaId)?.innerHTML || '');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};
