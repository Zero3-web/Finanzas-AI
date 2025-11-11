import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Transaction, TransactionType, ColorTheme } from '../types';
import Card from '../components/Card';
import ViewSwitcher from '../components/ViewSwitcher';
import { themes } from '../hooks/useColorTheme';
import { ArrowUpIcon, ChartPieIcon } from '../components/icons';

interface AnalysisProps {
    transactions: Transaction[];
    formatCurrency: (amount: number) => string;
    t: (key: string) => string;
    colorTheme: ColorTheme;
}

type AnalysisType = 'expense' | 'income';

const toHex = (rgb: string) => '#' + rgb.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');

const Analysis: React.FC<AnalysisProps> = ({ transactions, formatCurrency, t, colorTheme }) => {
    const [analysisType, setAnalysisType] = useState<AnalysisType>('expense');

    const currentPalette = themes[colorTheme];
    const primaryColor = toHex(currentPalette['--color-primary']);
    const accentColor = toHex(currentPalette['--color-accent']);
    const COLORS = [primaryColor, accentColor, '#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

    const dataByCategory = useMemo(() => {
        const type = analysisType === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME;
        const filteredTransactions = transactions.filter(t => t.type === type);
        
        // FIX: Replaced reduce with a for...of loop for improved type inference and clarity.
        const categoryMap: Record<string, number> = {};
        for (const t of filteredTransactions) {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        }

        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions, analysisType]);

    const totalAmount = useMemo(() => {
        return dataByCategory.reduce((sum, cat) => sum + cat.value, 0);
    }, [dataByCategory]);

    const title = analysisType === 'expense' ? t('spendingAnalysis') : t('incomeAnalysis');
    const totalTitle = analysisType === 'expense' ? t('totalSpent') : t('totalEarned');
    const noDataMessage = analysisType === 'expense' ? t('noExpenseData') : t('noIncomeData');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('analysis')}</h1>
            </div>

            {/* Mobile View Switcher */}
            <div className="md:hidden">
                <ViewSwitcher
                    value={analysisType}
                    onChange={(val) => setAnalysisType(val as AnalysisType)}
                    options={[
                        { value: 'expense', icon: <ChartPieIcon className="w-6 h-6" /> },
                        { value: 'income', icon: <ArrowUpIcon className="w-6 h-6" /> }
                    ]}
                />
            </div>
            
            {/* Desktop Tabs */}
            <div className="hidden md:block border-b border-secondary dark:border-border-dark">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setAnalysisType('expense')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            analysisType === 'expense'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-main dark:hover:text-text-main-dark hover:border-gray-300 dark:hover:border-border-dark'
                        }`}
                    >
                        {t('spendingAnalysis')}
                    </button>
                    <button
                        onClick={() => setAnalysisType('income')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            analysisType === 'income'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-main dark:hover:text-text-main-dark hover:border-gray-300 dark:hover:border-border-dark'
                        }`}
                    >
                        {t('incomeAnalysis')}
                    </button>
                </nav>
            </div>

            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{title}</h2>
                {dataByCategory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={dataByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        innerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={5}
                                    >
                                        {dataByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline pb-2 border-b-2 border-primary">
                                <h3 className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">{t('category')}</h3>
                                <h3 className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">{totalTitle}</h3>
                            </div>
                            {dataByCategory.map((category, index) => (
                                <div key={category.name}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="font-medium text-text-main dark:text-text-main-dark">{category.name}</span>
                                        </div>
                                        <span className="font-semibold text-text-main dark:text-text-main-dark">{formatCurrency(category.value)}</span>
                                    </div>
                                    <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${(category.value / totalAmount) * 100}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-text-secondary dark:text-text-secondary-dark">{noDataMessage}</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Analysis;