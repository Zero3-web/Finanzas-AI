import React from 'react';
import { SpendingLimit, Transaction, TransactionType, Account } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon } from '../components/icons';

interface LimitsProps {
  limits: SpendingLimit[];
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  onAddLimit: () => void;
  onEditLimit: (limit: SpendingLimit) => void;
  onRemoveLimit: (limitId: string) => void;
  t: (key: string) => string;
}

const getSpentAmountForCategoryAndCurrency = (
    category: string,
    currency: string,
    transactions: Transaction[],
    accounts: Account[]
): number => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const accountCurrencyMap = new Map(accounts.map(acc => [acc.id, acc.currency]));

    return transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return (
                t.type === TransactionType.EXPENSE &&
                t.category === category &&
                accountCurrencyMap.get(t.accountId) === currency &&
                transactionDate >= firstDayOfMonth &&
                transactionDate <= lastDayOfMonth
            );
        })
        .reduce((sum, t) => sum + t.amount, 0);
};

const LimitCard: React.FC<{ 
    limit: SpendingLimit;
    spentAmount: number;
    formatCurrency: (amount: number, currency: string) => string; 
    onEdit: (limit: SpendingLimit) => void; 
    onRemove: (id: string) => void; 
    t: (key: string) => string 
}> = ({ limit, spentAmount, formatCurrency, onEdit, onRemove, t }) => {
    const progress = limit.limitAmount > 0 ? (spentAmount / limit.limitAmount) * 100 : 0;
    const remaining = limit.limitAmount - spentAmount;

    const getProgressBarColor = () => {
        if (progress > 100) return 'bg-expense';
        if (progress > 80) return 'bg-yellow-500';
        return 'bg-primary';
    };

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">{limit.category}</h3>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{t('monthly_limit')} ({limit.currency})</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(limit)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onRemove(limit.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="my-4">
                <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2.5">
                    <div className={`${getProgressBarColor()} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-text-secondary dark:text-gray-500 mt-1">
                    <span>{formatCurrency(spentAmount, limit.currency)} {t('spent')}</span>
                    <span>{formatCurrency(limit.limitAmount, limit.currency)} {t('limit')}</span>
                </div>
            </div>
             <div className="text-sm">
                {remaining >= 0 ? (
                    <p><span className="font-semibold text-income">{formatCurrency(remaining, limit.currency)}</span> {t('remaining_this_month')}</p>
                ) : (
                    <p><span className="font-semibold text-expense">{formatCurrency(Math.abs(remaining), limit.currency)}</span> {t('overspent_this_month')}</p>
                )}
            </div>
        </Card>
    );
};


const Limits: React.FC<LimitsProps> = ({ limits, transactions, accounts, formatCurrency, onAddLimit, onEditLimit, onRemoveLimit, t }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('limits')}</h1>
        <button onClick={onAddLimit} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addLimit')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {limits.map(limit => {
          const spentAmount = getSpentAmountForCategoryAndCurrency(limit.category, limit.currency, transactions, accounts);
          return (
            <LimitCard key={limit.id} limit={limit} spentAmount={spentAmount} formatCurrency={formatCurrency} onEdit={onEditLimit} onRemove={onRemoveLimit} t={t} />
          )
        })}
        <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-border-dark bg-transparent shadow-none hover:border-primary dark:hover:border-primary cursor-pointer transition-colors" onClick={onAddLimit}>
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">
                <PlusIcon className="w-8 h-8 mx-auto mb-2" />
                <p>{t('addLimit')}</p>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Limits;