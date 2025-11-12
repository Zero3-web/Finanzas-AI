import React, { useMemo } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import Modal from './Modal';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string) => string;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  transactions,
  accounts,
  formatCurrency,
  t,
}) => {
  // FIX: Wrapped accountMap creation in useMemo to help TypeScript correctly infer the type of the map's values as `Account`, resolving the error on `account?.currency`.
  const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
        {transactions.length > 0 ? (
          transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(transaction => {
              const account = accountMap.get(transaction.accountId);
              const isIncome = transaction.type === TransactionType.INCOME;
              return (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-secondary dark:bg-secondary-dark rounded-lg">
                  <div>
                    <p className="font-semibold text-text-main dark:text-text-main-dark">{transaction.description}</p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                      {new Date(transaction.date).toLocaleDateString()} &bull; {t(`category_${transaction.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`)}
                    </p>
                  </div>
                  <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, account?.currency || 'USD')}
                  </p>
                </div>
              );
            })
        ) : (
          <p className="text-center text-text-secondary dark:text-text-secondary-dark py-8">{t('noTransactionsFound')}</p>
        )}
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;