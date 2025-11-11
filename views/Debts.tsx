import React from 'react';
import { Debt } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon } from '../components/icons';

interface DebtsProps {
  debts: Debt[];
  formatCurrency: (amount: number, currency: string) => string;
  onAddDebt: () => void;
  onEditDebt: (debt: Debt) => void;
  onRemoveDebt: (debtId: string) => void;
  t: (key: string) => string;
}

const DebtCard: React.FC<{ debt: Debt; formatCurrency: (amount: number, currency: string) => string; onEdit: (debt: Debt) => void; onRemove: (id: string) => void; t: (key: string) => string }> = ({ debt, formatCurrency, onEdit, onRemove, t }) => {
    const remainingAmount = debt.totalAmount - debt.amountPaid;
    const progress = (debt.amountPaid / debt.totalAmount) * 100;

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">{debt.name}</h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('interest_rate')}: {debt.interestRate}%</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(debt)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onRemove(debt.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="my-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-text-main dark:text-text-main-dark">{t('remaining')}</span>
                    <span className="font-bold text-expense">{formatCurrency(remainingAmount, debt.currency)}</span>
                </div>
                <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-text-secondary dark:text-gray-500 mt-1">
                    <span>{formatCurrency(debt.amountPaid, debt.currency)} {t('paid')}</span>
                    <span>{formatCurrency(debt.totalAmount, debt.currency)} {t('total')}</span>
                </div>
            </div>
            <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
                {t('next_payment')}: {new Date(debt.nextPaymentDate).toLocaleDateString()}
            </div>
        </Card>
    );
};

const Debts: React.FC<DebtsProps> = ({ debts, formatCurrency, onAddDebt, onEditDebt, onRemoveDebt, t }) => {
  // Note: Aggregating debts of different currencies is complex. This view shows them separately.
  // A total summary would require currency conversion.
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('debts')}</h1>
        <button onClick={onAddDebt} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addDebt')}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map(debt => (
            <DebtCard key={debt.id} debt={debt} formatCurrency={formatCurrency} onEdit={onEditDebt} onRemove={onRemoveDebt} t={t} />
        ))}
         <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-border-dark bg-transparent shadow-none hover:border-primary dark:hover:border-primary cursor-pointer transition-colors" onClick={onAddDebt}>
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">
                <PlusIcon className="w-8 h-8 mx-auto mb-2" />
                <p>{t('addDebt')}</p>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Debts;