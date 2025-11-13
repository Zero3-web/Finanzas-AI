import React, { useState, useEffect } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import Modal from './Modal';

interface VoiceTransactionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transaction: Omit<Transaction, 'id'>) => void;
  onEdit: () => void;
  transactionData: Omit<Transaction, 'id' | 'accountId'> | null;
  accounts: Account[];
  t: (key: string) => string;
  formatCurrency: (amount: number, currency: string) => string;
}

const VoiceTransactionConfirmationModal: React.FC<VoiceTransactionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onEdit,
  transactionData,
  accounts,
  t,
  formatCurrency,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    if (isOpen && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [isOpen, accounts]);

  if (!isOpen || !transactionData) return null;

  const handleConfirm = () => {
    if (selectedAccountId) {
      onConfirm({ ...transactionData, accountId: selectedAccountId });
    } else {
      alert(t('fillAllFields'));
    }
  };
  
  const getCategoryTranslation = (category: string) => {
    const key = `category_${category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;
    return t(key);
  };

  const isIncome = transactionData.type === TransactionType.INCOME;
  const primaryAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('voice_confirm_title')}>
      <div className="space-y-4">
        <p className="text-sm text-center text-text-secondary dark:text-text-secondary-dark">{t('voice_confirm_desc')}</p>

        <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-text-secondary dark:text-text-secondary-dark">{t('amount')}</span>
                <span className={`font-bold text-2xl ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(transactionData.amount, primaryAccount?.currency || 'USD')}
                </span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-text-secondary dark:text-text-secondary-dark">{t('description')}</span>
                <span className="font-semibold text-text-main dark:text-text-main-dark text-right">{transactionData.description}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-text-secondary dark:text-text-secondary-dark">{t('category')}</span>
                <span className="font-semibold text-text-main dark:text-text-main-dark">{getCategoryTranslation(transactionData.category)}</span>
            </div>
        </div>

        <div>
            <label htmlFor="accountId-confirm" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('account')}</label>
            <select 
                id="accountId-confirm" 
                value={selectedAccountId} 
                onChange={(e) => setSelectedAccountId(e.target.value)} 
                className="mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md"
            >
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance, acc.currency)})</option>)}
            </select>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
            <button 
                onClick={handleConfirm} 
                className="w-full sm:w-auto bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded transition-transform transform active:scale-95 flex-grow"
            >
                {t('confirm')}
            </button>
            <button 
                onClick={onEdit} 
                className="w-full sm:w-auto bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded transition-transform transform active:scale-95"
            >
                {t('edit')}
            </button>
             <button 
                type="button" 
                onClick={onClose} 
                className="w-full sm:w-auto bg-transparent text-text-secondary dark:text-text-secondary-dark font-bold py-2 px-4 rounded mr-auto hidden sm:block"
            >
                {t('cancel')}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default VoiceTransactionConfirmationModal;
