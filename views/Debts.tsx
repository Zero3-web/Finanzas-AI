import React from 'react';
import { Debt } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon, ScaleIcon } from '../components/icons';

interface DebtsProps {
  debts: Debt[];
  formatCurrency: (amount: number, currency: string) => string;
  onAddDebt: () => void;
  onEditDebt: (debt: Debt) => void;
  onRemoveDebt: (debtId: string) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

const DebtCard: React.FC<{ debt: Debt; formatCurrency: (amount: number, currency: string) => string; onEdit: (debt: Debt) => void; onRemove: (id: string) => void; t: (key: string, params?: { [key: string]: string | number }) => string; }> = ({ debt, formatCurrency, onEdit, onRemove, t }) => {
    const amountPaid = debt.paidInstallments * debt.monthlyPayment;
    const remainingAmount = debt.totalAmount - amountPaid;
    const progress = debt.totalInstallments > 0 ? (debt.paidInstallments / debt.totalInstallments) * 100 : 0;

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">{debt.name}</h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('monthlyPayment')}: {formatCurrency(debt.monthlyPayment, debt.currency)}</p>
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
                    <span>{t('installments_paid', { paid: debt.paidInstallments, total: debt.totalInstallments })}</span>
                    <span>{t('total')}: {formatCurrency(debt.totalAmount, debt.currency)}</span>
                </div>
            </div>
            <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
                {t('next_payment')}: {new Date(debt.nextPaymentDate).toLocaleDateString()}
            </div>
        </Card>
    );
};

const Debts: React.FC<DebtsProps> = ({ debts, formatCurrency, onAddDebt, onEditDebt, onRemoveDebt, t }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('debts')}</h1>
        <button onClick={onAddDebt} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addDebt')}
        </button>
      </div>
      
      {debts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debts.map(debt => (
                <DebtCard key={debt.id} debt={debt} formatCurrency={formatCurrency} onEdit={onEditDebt} onRemove={onRemoveDebt} t={t} />
            ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-8 md:p-12 mt-4">
          <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <ScaleIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2">{t('empty_state_debts_title')}</h2>
          <p className="text-text-secondary dark:text-text-secondary-dark mb-6 max-w-sm">{t('empty_state_debts_desc')}</p>
          <button onClick={onAddDebt} className="flex items-center bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('addDebt')}
          </button>
        </Card>
      )}
    </div>
  );
};

export default Debts;