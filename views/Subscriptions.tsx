import React from 'react';
import { RecurringTransaction, TransactionType } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon, CollectionIcon } from '../components/icons';

interface RecurringProps {
  recurringTransactions: RecurringTransaction[];
  formatCurrency: (amount: number, currency: string) => string;
  onAddRecurring: () => void;
  onEditRecurring: (recurring: RecurringTransaction) => void;
  onRemoveRecurring: (recurringId: string) => void;
  t: (key: string) => string;
}

const RecurringTransactionCard: React.FC<{ 
    recurring: RecurringTransaction; 
    formatCurrency: (amount: number, currency: string) => string; 
    onEdit: (recurring: RecurringTransaction) => void;
    onRemove: (id: string) => void;
    t: (key: string) => string;
}> = ({ recurring, formatCurrency, onEdit, onRemove, t }) => {
  
  const getNextPaymentDate = () => {
      const today = new Date();
      const dayOfMonth = parseInt(recurring.paymentDay);
      let nextPayment = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
      if (nextPayment < today) {
          nextPayment.setMonth(nextPayment.getMonth() + 1);
      }
      return nextPayment.toLocaleDateString();
  }
  
  const isIncome = recurring.type === TransactionType.INCOME;
  const borderColor = isIncome ? 'border-income' : 'border-expense';
  const amountColor = isIncome ? 'text-income' : 'text-expense';

  return (
    <Card className={`flex flex-col justify-between border-l-4 ${borderColor}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{recurring.name}</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400 capitalize">{t(`category_${recurring.category.toLowerCase()}`)}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={() => onEdit(recurring)} className="text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onRemove(recurring.id)} className="text-text-secondary dark:text-gray-400 hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <p className={`text-2xl font-semibold ${amountColor}`}>
            {isIncome ? '+' : '-'}{formatCurrency(recurring.amount, recurring.currency)}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-secondary dark:border-gray-700 text-sm">
          <div className="flex justify-between">
              <span className="text-text-secondary dark:text-gray-400">{t('next_payment_date')}</span>
              <span className="font-medium text-text-main dark:text-gray-300">{getNextPaymentDate()}</span>
          </div>
      </div>
    </Card>
  );
};

const Recurring: React.FC<RecurringProps> = ({ recurringTransactions, formatCurrency, onAddRecurring, onEditRecurring, onRemoveRecurring, t }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-brand-white">{t('recurring')}</h1>
        <button onClick={onAddRecurring} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addRecurring')}
        </button>
      </div>
      {recurringTransactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringTransactions.map(rec => (
            <RecurringTransactionCard key={rec.id} recurring={rec} formatCurrency={formatCurrency} onEdit={onEditRecurring} onRemove={onRemoveRecurring} t={t} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-8 md:p-12 mt-4">
          <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <CollectionIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2">{t('empty_state_recurring_title')}</h2>
          <p className="text-text-secondary dark:text-text-secondary-dark mb-6 max-w-sm">{t('empty_state_recurring_desc')}</p>
          <button onClick={onAddRecurring} className="flex items-center bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('addRecurring')}
          </button>
        </Card>
      )}
    </div>
  );
};

export default Recurring;