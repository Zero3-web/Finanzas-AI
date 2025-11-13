import React from 'react';
import { Transaction, Account, TransactionType } from '../types';
import Modal from './Modal';
import { PencilIcon } from './icons';

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountSelect: (accountId: string) => void;
  onEdit: () => void;
  transactionsData: (Omit<Transaction, 'id' | 'accountId'> & { currency?: string })[] | null;
  accounts: Account[];
  t: (key: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const CreditCardVisual: React.FC<{ 
    account: Account, 
    formatCurrency: (amount: number, currency: string) => string, 
    variant: 'purple' | 'dark' | 'cyan',
    onClick: () => void,
    t: (key: string) => string;
}> = ({ account, formatCurrency, variant, onClick, t }) => {
    const getCardClasses = () => {
        switch(variant) {
            case 'purple': return 'bg-primary text-white';
            case 'cyan': return 'bg-accent text-text-main';
            case 'dark': return 'bg-surface-dark text-white';
            default: return 'bg-primary text-white';
        }
    }
    const fakeCardNumber = `**** **** **** ${account.id.slice(-4)}`;

    return (
        <button 
            className={`w-64 h-40 rounded-xl p-4 flex flex-col justify-between shrink-0 cursor-pointer transition-all border-2 border-transparent hover:border-primary text-left card-hover-effect ${getCardClasses()}`}
            onClick={onClick}
        >
            <div>
                <span className="font-semibold">{account.name}</span>
                 <p className="text-xs opacity-80">{t('current_balance')}</p>
                 <p className="font-semibold text-lg">{formatCurrency(account.balance, account.currency)}</p>
            </div>
            <div>
                <p className="font-mono tracking-wider text-sm">{fakeCardNumber}</p>
            </div>
        </button>
    );
};


const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  isOpen,
  onClose,
  onAccountSelect,
  onEdit,
  transactionsData,
  accounts,
  t,
  formatCurrency,
}) => {
  if (!isOpen || !transactionsData || transactionsData.length === 0) return null;

  const totalAmount = transactionsData.reduce((sum, tx) => {
    if (tx.type === 'expense') return sum + tx.amount;
    if (tx.type === 'income') return sum - tx.amount;
    return sum;
  }, 0);

  const transactionCurrency = transactionsData[0]?.currency || accounts[0]?.currency;
  
  const getCategoryTranslation = (category: string) => {
    const key = `category_${category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;
    return t(key);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('select_account_title')}>
      <div className="space-y-4">
        <div className="text-center bg-secondary dark:bg-secondary-dark p-4 rounded-lg">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('voice_total_amount')}</p>
            <p className={`font-bold text-3xl ${totalAmount >= 0 ? 'text-expense' : 'text-income'}`}>
                {totalAmount >= 0 ? '-' : '+'} {formatCurrency(Math.abs(totalAmount), transactionCurrency)}
            </p>
        </div>
        
        <h3 className="text-sm font-semibold text-text-secondary dark:text-text-secondary-dark pt-2">{t('voice_multiple_transactions_summary')}</h3>
        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {transactionsData.map((transaction, index) => (
                <div key={index} className="flex justify-between items-center bg-surface dark:bg-surface-dark p-2 rounded-md text-sm">
                    <div>
                        <p className="font-semibold text-text-main dark:text-text-main-dark">{transaction.description}</p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{getCategoryTranslation(transaction.category)}</p>
                    </div>
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount, transactionCurrency)}
                    </p>
                </div>
            ))}
        </div>

        <h3 className="text-md font-semibold text-text-main dark:text-text-main-dark pt-2">{t('select_which_account')}</h3>

        <div className="flex items-center space-x-4 overflow-x-auto pb-4 -ml-6 -mr-6 px-6 custom-scrollbar">
            {accounts.map((account, index) => {
                const cardVariants: Array<'purple' | 'cyan' | 'dark'> = ['purple', 'cyan', 'dark'];
                const variant = cardVariants[index % cardVariants.length];
                return (
                    <CreditCardVisual 
                        key={account.id}
                        account={account}
                        formatCurrency={formatCurrency}
                        variant={variant}
                        onClick={() => onAccountSelect(account.id)}
                        t={t}
                    />
                )
            })}
        </div>
        
        <style>{`.custom-scrollbar::-webkit-scrollbar{height:6px;}.custom-scrollbar::-webkit-scrollbar-track{background:transparent;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:10px;}.dark .custom-scrollbar::-webkit-scrollbar-thumb{background:#4b5563;}`}</style>

        <div className="flex items-center justify-between pt-4">
            <button 
                onClick={onClose}
                className="text-sm font-semibold text-text-secondary dark:text-text-secondary-dark hover:underline"
            >
                {t('cancel')}
            </button>
            <button 
                onClick={onEdit}
                className="flex items-center gap-2 bg-secondary dark:bg-secondary-dark text-text-main dark:text-text-main-dark font-bold py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-opacity-80 transition-transform transform active:scale-95 text-sm"
            >
                <PencilIcon className="w-4 h-4" />
                {t('edit')}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default AccountSelectionModal;