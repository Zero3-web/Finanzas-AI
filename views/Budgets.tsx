import React from 'react';
import { Budget, Transaction, TransactionType } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon } from '../components/icons';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  onAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onRemoveBudget: (budgetId: string) => void;
  t: (key: string) => string;
}

const BudgetCard: React.FC<{ 
    budget: Budget; 
    spent: number; 
    formatCurrency: (amount: number) => string; 
    onEdit: (budget: Budget) => void; 
    onRemove: (id: string) => void;
    t: (key: string) => string;
}> = ({ budget, spent, formatCurrency, onEdit, onRemove, t }) => {
    const remaining = budget.limit - spent;
    const progress = (spent / budget.limit) * 100;
    const isOverBudget = remaining < 0;

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">{budget.category}</h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark capitalize">{t(budget.period)}</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(budget)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onRemove(budget.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="my-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className={`font-semibold ${isOverBudget ? 'text-expense' : 'text-text-main dark:text-text-main-dark'}`}>
                        {isOverBudget ? `${t('overbudget_by')}: ${formatCurrency(Math.abs(remaining))}` : `${t('remaining')}: ${formatCurrency(remaining)}`}
                    </span>
                    <span className="font-bold">{formatCurrency(spent)} / {formatCurrency(budget.limit)}</span>
                </div>
                <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2.5">
                    <div className={`${isOverBudget ? 'bg-expense' : 'bg-primary'} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            </div>
        </Card>
    );
};

const Budgets: React.FC<BudgetsProps> = ({ budgets, transactions, formatCurrency, onAddBudget, onEditBudget, onRemoveBudget, t }) => {
  const spendingByCategory = React.useMemo(() => {
    const spending: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    return spending;
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('budgets')}</h1>
        <button onClick={onAddBudget} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addBudget')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(budget => (
          <BudgetCard 
            key={budget.id} 
            budget={budget}
            spent={spendingByCategory[budget.category] || 0}
            formatCurrency={formatCurrency}
            onEdit={onEditBudget}
            onRemove={onRemoveBudget}
            t={t}
          />
        ))}
        <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-border-dark bg-transparent shadow-none hover:border-primary dark:hover:border-primary cursor-pointer transition-colors" onClick={onAddBudget}>
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">
                <PlusIcon className="w-8 h-8 mx-auto mb-2" />
                <p>{t('addBudget')}</p>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Budgets;
