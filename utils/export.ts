import { Transaction, Account, ColorTheme, TransactionType } from '../types';
import { themes } from '../hooks/useColorTheme';

declare global {
  interface Window {
    jspdf: any;
  }
}

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
  link.setAttribute("download", `flowvixtrack_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
    reportData: {
        userName: string;
        formattedMonth: string;
        accounts: Account[];
        transactions: Transaction[];
        accountMap: Map<string, Account>;
        selectedAccountId: string | null;
    },
    colorTheme: ColorTheme,
    t: (key: string, params?: { [key: string]: string | number }) => string,
    formatCurrency: (amount: number, currency: string) => string
) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const currentPalette = themes[colorTheme];
    const primaryColor = currentPalette['--color-primary'].split(',').map(Number);

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    // --- Page Header & Footer ---
    const pageHeader = () => {
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('FlowVix Track Report', pageWidth - margin, 10, { align: 'right' });
    };
    const pageFooter = (data: any) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(new Date().toLocaleDateString(), margin, pageHeight - 10);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    };

    // --- Main Title ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(t('monthly_report_title', { month: reportData.formattedMonth }), margin, 25);

    // --- Subtitle Info ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${t('prepared_for')}: ${reportData.userName}`, margin, 35);
    const selectedAccount = reportData.selectedAccountId ? reportData.accountMap.get(reportData.selectedAccountId) : null;
    const accountName = selectedAccount ? selectedAccount.name : t('all_accounts');
    doc.text(`${t('account')}: ${accountName}`, margin, 41);

    // --- Financial Summary ---
    const primaryCurrency = reportData.accounts.length > 0 ? reportData.accounts[0].currency : 'USD';
    const { totalIncome, totalExpenses } = reportData.transactions.reduce((acc, tr) => {
        const account = reportData.accountMap.get(tr.accountId);
        if (tr.type === TransactionType.INCOME) acc.totalIncome += tr.amount;
        if (tr.type === TransactionType.EXPENSE) acc.totalExpenses += tr.amount;
        return acc;
    }, { totalIncome: 0, totalExpenses: 0 });
    
    const netSavings = totalIncome - totalExpenses;

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(t('financial_summary'), margin, 55);

    (doc as any).autoTable({
        startY: 60,
        body: [
            [
                { content: t('total_income'), styles: { fontStyle: 'bold' } },
                { content: formatCurrency(totalIncome, primaryCurrency), styles: { halign: 'right', textColor: [34, 197, 94] } }
            ],
            [
                { content: t('total_expense'), styles: { fontStyle: 'bold' } },
                { content: formatCurrency(totalExpenses, primaryCurrency), styles: { halign: 'right', textColor: [239, 68, 68] } }
            ],
            [
                { content: t('net_savings'), styles: { fontStyle: 'bold' } },
                { content: formatCurrency(netSavings, primaryCurrency), styles: { halign: 'right', textColor: netSavings >= 0 ? [0,0,0] : [239, 68, 68] } }
            ],
        ],
        theme: 'plain',
        styles: { cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 50 } },
    });


    let finalY = (doc as any).lastAutoTable.finalY || 60;

    // --- Transactions Table ---
    if(reportData.transactions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(t('transactions_report'), margin, finalY + 15);

        const transactionHeaders = [[t('date'), t('description'), t('category'), t('account'), t('amount')]];
        const transactionBody = reportData.transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(tr => {
                const account = reportData.accountMap.get(tr.accountId);
                const amount = tr.type === 'income' ? tr.amount : -tr.amount;
                return [
                    new Date(tr.date).toLocaleDateString(),
                    tr.description,
                    t(`category_${tr.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`),
                    account?.name || 'N/A',
                    { content: formatCurrency(amount, account?.currency || 'USD'), styles: { halign: 'right', textColor: amount >= 0 ? [34, 197, 94] : [239, 68, 68] } }
                ];
            });

        (doc as any).autoTable({
            startY: finalY + 20,
            head: transactionHeaders,
            body: transactionBody,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: 255 },
            didDrawPage: (data: any) => {
                pageHeader();
                pageFooter(data);
            }
        });
    }

    doc.save(`FlowVix-Report-${reportData.formattedMonth.replace(' ', '-')}.pdf`);
};
