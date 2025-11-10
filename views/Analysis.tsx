import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Transaction, TransactionType } from '../types';
import Card from '../components/Card';

interface AnalysisProps {
    transactions: Transaction[];
    formatCurrency: (amount: number) => string;
    t: (key: string) => string;
}

const COLORS = ['#723FEB', '#97E0F7', '#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

const Analysis: React.FC<AnalysisProps> = ({ transactions, formatCurrency, t }) => {
    const spendingByCategory = useMemo(() => {
        const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
        const categoryMap = expenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as { [key: string]: number });

        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const totalSpent = useMemo(() => {
        return spendingByCategory.reduce((sum, cat) => sum + cat.value, 0);
    }, [spendingByCategory]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-main dark:text-brand-white">{t('analysis')}</h1>

            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-main dark:text-brand-white">{t('spendingAnalysis')}</h2>
                {spendingByCategory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={spendingByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        innerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={5}
                                    >
                                        {spendingByCategory.map((entry, index) => (
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
                                <h3 className="text-lg font-semibold text-text-secondary dark:text-gray-400">{t('category')}</h3>
                                <h3 className="text-lg font-semibold text-text-secondary dark:text-gray-400">{t('totalSpent')}</h3>
                            </div>
                            {spendingByCategory.map((category, index) => (
                                <div key={category.name}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="font-medium text-text-main dark:text-gray-200">{category.name}</span>
                                        </div>
                                        <span className="font-semibold text-text-main dark:text-gray-200">{formatCurrency(category.value)}</span>
                                    </div>
                                    <div className="w-full bg-secondary dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${(category.value / totalSpent) * 100}%`,
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
                        <p className="text-text-secondary dark:text-gray-400">{t('noExpenseData')}</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Analysis;
