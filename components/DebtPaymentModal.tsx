import React, { useState, useEffect, useMemo } from 'react';
import { Debt, Account } from '../types';
import Modal from './Modal';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (debtId: string, fromAccountId: string) => void;
  debt: Debt | null;
  accounts: Account[];
  t: (key: string, params?: { [key: string]: string | number }) => string;
  formatCurrency: (amount: number, currency: string) => string;
}

const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({ isOpen, onClose, onConfirm, debt, accounts, t, formatCurrency }) => {
  const [fromAccountId, setFromAccountId] = useState('');

  const compatibleAccounts = useMemo(() => {
    if (!debt) return [];
    return accounts.filter(acc => acc.currency === debt.currency);
  }, [accounts, debt]);

  const selectedAccount = useMemo(() => {
    return compatibleAccounts.find(acc => acc.id === fromAccountId);
  }, [fromAccountId, compatibleAccounts]);

  const hasInsufficientBalance = useMemo(() => {
    if (!debt || !selectedAccount) return false;
    return selectedAccount.balance < debt.monthlyPayment;
  }, [debt, selectedAccount]);

  useEffect(() => {
    if (compatibleAccounts.length > 0) {
      setFromAccountId(compatibleAccounts[0].id);
    } else {
      setFromAccountId('');
    }
  }, [compatibleAccounts]);

  if (!isOpen || !debt) return null;

  const handleConfirm = () => {
    if (fromAccountId) {
      onConfirm(debt.id, fromAccountId);
    }
  };

  const amountPaid = debt.paidInstallments * debt.monthlyPayment;
  const remainingAmount = debt.totalAmount - amountPaid;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pay_installment_for', { name: debt.name })}>
      <div className="space-y-4">
        <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary dark:text-text-secondary-dark">{t('payment_amount')}</span>
            <span className="font-bold text-xl text-expense">{formatCurrency(debt.monthlyPayment, debt.currency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary dark:text-text-secondary-dark">{t('remaining_balance')}</span>
            <span className="font-semibold text-text-main dark:text-text-main-dark">{formatCurrency(remainingAmount, debt.currency)}</span>
          </div>
        </div>

        <div>
          <label htmlFor="fromAccountId" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('pay_from_account')}</label>
          {compatibleAccounts.length > 0 ? (
            <select
              id="fromAccountId"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md"
            >
              {compatibleAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.balance, acc.currency)})
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-2 text-sm text-center p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">
              {t('no_compatible_account', { currency: debt.currency })}
            </p>
          )}
        </div>

        {hasInsufficientBalance && (
          <p className="text-sm text-center p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">
            {t('insufficient_balance_for_payment')}
          </p>
        )}

        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2 transition-transform transform active:scale-95">{t('cancel')}</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!fromAccountId || hasInsufficientBalance}
            className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded transition-transform transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {t('confirm_payment')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DebtPaymentModal;