import React, { useState, useMemo } from 'react';
import { Transaction, Account, TransactionType, ColorTheme } from '../types';
import Card from '../components/Card';
import { DocumentArrowDownIcon } from '../components/icons';
import { themes } from '../hooks/useColorTheme';

// Declare jspdf to avoid TypeScript errors since it's loaded from a CDN
declare var jspdf: any;

interface ExportProps {
    transactions: Transaction[];
    accounts: Account[];
    formatCurrency: (amount: number, currency: string) => string;
    t: (key: string, params?: { [key: string]: any }) => string;
    userName: string;
    colorTheme: ColorTheme;
}

const Export: React.FC<ExportProps> = ({ transactions, accounts, formatCurrency, t, userName, colorTheme }) => {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);

    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);
    const currentPalette = themes[colorTheme];
    const primaryColorRgb = currentPalette['--color-primary'].split(',').map(Number);
    
    const handleExportPDF = () => {
        // The global variable from the CDN is `jspdf`, and the class is `jsPDF` within it.
        const { jsPDF } = jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
        });

        const incomeTransactions = filteredTransactions.filter(t => t.type === TransactionType.INCOME);
        const expenseTransactions = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);

        const totalIncomeByCurrency = incomeTransactions.reduce((acc, t) => {
            const currency = accountMap.get(t.accountId)?.currency || 'N/A';
            acc[currency] = (acc[currency] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);
        
        const totalExpensesByCurrency = expenseTransactions.reduce((acc, t) => {
            const currency = accountMap.get(t.accountId)?.currency || 'N/A';
            acc[currency] = (acc[currency] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        // --- PDF Header ---
        doc.setFontSize(22);
        doc.setTextColor(primaryColorRgb[0], primaryColorRgb[1], primaryColorRgb[2]);
        doc.text(t('history'), 40, 50);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${t('report_for')}: ${userName}`, 40, 70);
        doc.text(`${t('period')}: ${startDate} - ${endDate}`, 40, 85);
        doc.text(`${t('generated_on')}: ${new Date().toLocaleDateString()}`, 40, 100);

        // --- Summary Section ---
        let summaryY = 140;
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(t('summary'), 40, summaryY);
        summaryY += 20;
        doc.setFontSize(10);
        Object.keys(totalIncomeByCurrency).forEach(currency => {
            doc.text(`${t('total_income')} (${currency}): ${formatCurrency(totalIncomeByCurrency[currency], currency)}`, 40, summaryY);
            summaryY += 15;
        });
        Object.keys(totalExpensesByCurrency).forEach(currency => {
            doc.text(`${t('expense')} (${currency}): ${formatCurrency(totalExpensesByCurrency[currency], currency)}`, 40, summaryY);
            summaryY += 15;
        });
        
        let tableY = summaryY + 20;

        // --- Transactions Tables ---
        const columns = [t('date'), t('description'), t('category'), t('account'), t('amount')];

        const generateTable = (title: string, data: Transaction[]) => {
            if (data.length === 0) return;
            doc.setFontSize(14);
            doc.setTextColor(50, 50, 50);
            doc.text(title, 40, tableY);
            tableY += 20;

            const rows = data.map(transaction => {
                const account = accountMap.get(transaction.accountId);
                return [
                    new Date(transaction.date).toLocaleDateString(),
                    transaction.description,
                    t(`category_${transaction.category.toLowerCase()}`),
                    account?.name || 'N/A',
                    formatCurrency(transaction.amount, account?.currency || 'USD')
                ];
            });

            doc.autoTable({
                head: [columns],
                body: rows,
                startY: tableY,
                headStyles: { fillColor: primaryColorRgb },
                theme: 'striped',
                didDrawPage: (data: any) => { tableY = data.cursor.y; }
            });
            tableY += 20;
        };
        
        generateTable(t('income_transactions'), incomeTransactions);
        generateTable(t('expense_transactions'), expenseTransactions);

        if (filteredTransactions.length === 0) {
            doc.text(t('no_transactions_in_period'), 40, tableY);
        }

        doc.save(`Finanzas-Report-${startDate}-to-${endDate}.pdf`);
    };

    const inputClasses = "block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-3 rounded-lg";
  
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('analysis_export')}</h1>
            
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('export_report')}</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-6">{t('select_date_range')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">{t('start_date')}</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">{t('end_date')}</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleExportPDF} 
                    className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-colors"
                >
                    <DocumentArrowDownIcon className="w-6 h-6 mr-2" />
                    {t('export_pdf')}
                </button>
            </Card>
        </div>
    );
};

export default Export;