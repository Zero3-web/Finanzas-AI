import React, { useState, useMemo } from 'react';
import { Goal, SpendingLimit, RecurringTransaction, Transaction, Account, TransactionType } from '../types';
import Card from './Card';

// Goal Progress Widget
export const GoalProgressWidget: React.FC<{ goal?: Goal; formatCurrency: (amount: number, currency: string) => string; t: (key: string) => string }> = ({ goal, formatCurrency, t }) => {
    if (!goal) {
        return <Card><p className="text-center text-text-secondary dark:text-text-secondary-dark">{t('no_goal_selected')}</p></Card>;
    }
    const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
    return (
        <Card>
            <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark mb-2">{goal.name}</h3>
            <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-4">
                <div className="bg-primary h-4 rounded-full text-xs text-white flex items-center justify-center font-bold" style={{ width: `${progress}%` }}>
                    {progress.toFixed(0)}%
                </div>
            </div>
            <div className="flex justify-between text-sm text-text-secondary dark:text-gray-500 mt-1">
                <span>{formatCurrency(goal.savedAmount, goal.currency)}</span>
                <span>{formatCurrency(goal.targetAmount, goal.currency)}</span>
            </div>
        </Card>
    );
};

// Spending Limit Widget
export const SpendingLimitWidget: React.FC<{ limit?: SpendingLimit; transactions: Transaction[]; accounts: Account[]; formatCurrency: (amount: number, currency: string) => string; t: (key: string) => string }> = ({ limit, transactions, accounts, formatCurrency, t }) => {
    const spentAmount = useMemo(() => {
        if (!limit) return 0;
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const accountCurrencyMap = new Map(accounts.map(acc => [acc.id, acc.currency]));
        return transactions
            .filter(t => new Date(t.date) >= firstDayOfMonth && t.type === TransactionType.EXPENSE && t.category === limit.category && accountCurrencyMap.get(t.accountId) === limit.currency)
            .reduce((sum, t) => sum + t.amount, 0);
    }, [limit, transactions, accounts]);

    if (!limit) {
        return <Card><p className="text-center text-text-secondary dark:text-text-secondary-dark">{t('no_limit_selected')}</p></Card>;
    }

    const progress = limit.limitAmount > 0 ? (spentAmount / limit.limitAmount) * 100 : 0;
    const remaining = limit.limitAmount - spentAmount;
    const progressColor = progress > 100 ? 'bg-expense' : progress > 80 ? 'bg-yellow-500' : 'bg-primary';

    return (
        <Card>
            <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark mb-2">{t(`category_${limit.category.toLowerCase()}`)} {t('limit_suffix')}</h3>
            <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2.5">
                <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            <p className={`text-sm mt-2 font-semibold ${remaining >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(Math.abs(remaining), limit.currency)} {remaining >= 0 ? t('remaining_this_month') : t('overspent_this_month')}
            </p>
        </Card>
    );
};

// Upcoming Bills Widget
export const UpcomingBillsWidget: React.FC<{ recurringTransactions: RecurringTransaction[]; formatCurrency: (amount: number, currency: string) => string; t: (key: string) => string }> = ({ recurringTransactions, formatCurrency, t }) => {
    const upcoming = useMemo(() => {
        const today = new Date();
        return recurringTransactions
            .filter(r => r.type === TransactionType.EXPENSE)
            .map(rec => {
                const dayOfMonth = parseInt(rec.paymentDay);
                let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
                if (nextPaymentDate < today) nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                return { ...rec, nextPaymentDate };
            })
            .sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime())
            .slice(0, 3);
    }, [recurringTransactions]);

    return (
        <Card>
            <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark mb-4">{t('widget_upcoming')}</h3>
            <div className="space-y-3">
                {upcoming.map(rec => (
                    <div key={rec.id} className="flex justify-between items-center text-sm">
                        <p className="text-text-main dark:text-text-main-dark">{rec.name}</p>
                        <div className="text-right">
                           <p className="font-semibold text-expense">-{formatCurrency(rec.amount, rec.currency)}</p>
                           <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{rec.nextPaymentDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Quick Add Widget
export const QuickAddWidget: React.FC<{ onAddTransaction: (t: Omit<Transaction, 'id'>) => void; accounts: Account[]; t: (key: string) => string }> = ({ onAddTransaction, accounts, t }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || !accounts[0]) return;
        onAddTransaction({
            accountId: accounts[0].id,
            amount: parseFloat(amount),
            description,
            category: 'Other', // Simplified for quick add
            type,
            date: new Date().toISOString().split('T')[0],
        });
        setAmount('');
        setDescription('');
    };

    return (
        <Card>
            <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark mb-4">{t('quick_add_transaction')}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex rounded-md">
                    <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full py-1 rounded-l-md ${type === 'expense' ? 'bg-expense text-white' : 'bg-secondary dark:bg-secondary-dark'}`}>{t('expense')}</button>
                    <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full py-1 rounded-r-md ${type === 'income' ? 'bg-income text-white' : 'bg-secondary dark:bg-secondary-dark'}`}>{t('income')}</button>
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t('amount')} className="w-full p-2 rounded-md bg-secondary dark:bg-secondary-dark" />
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('description')} className="w-full p-2 rounded-md bg-secondary dark:bg-secondary-dark" />
                <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg">{t('add')}</button>
            </form>
        </Card>
    );
};

// Financial Tip Widget
export const FinancialTipWidget: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    const tips = useMemo(() => [
        t('financial_tip_1'),
        t('financial_tip_2'),
        t('financial_tip_3'),
        t('financial_tip_4'),
        t('financial_tip_5'),
    ], [t]);
    const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);

    return (
        <Card className="bg-primary/10 dark:bg-primary/20">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-2">{t('financial_tip_title')}</h3>
            <p className="text-sm text-text-main dark:text-text-main-dark">{tip}</p>
        </Card>
    );
};
