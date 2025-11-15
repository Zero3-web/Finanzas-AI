import React, { useMemo } from 'react';
import Modal from './Modal';
import { Account } from '../types';

interface CurrencyMismatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedCurrency: string;
  accounts: Account[];
  onConvert: (accountId: string) => void;
  onCreateNew: () => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

const CurrencyMismatchModal: React.FC<CurrencyMismatchModalProps> = ({
  isOpen,
  onClose,
  detectedCurrency,
  accounts,
  onConvert,
  onCreateNew,
  t,
}) => {
  // FIX: Wrapped in useMemo to ensure TypeScript correctly infers the type of the accounts array, resolving errors where properties on 'account' were not found.
  const uniqueAccountsByCurrency = useMemo(() => Array.from(new Map(accounts.map(item => [item.currency, item])).values()), [accounts]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('currency_mismatch_title')}>
      <div className="space-y-4 text-center">
        <p className="text-text-secondary dark:text-text-secondary-dark">
          {t('currency_mismatch_desc', { detectedCurrency })}
        </p>

        <div className="space-y-3 pt-4">
          {uniqueAccountsByCurrency.map(account => (
             <button
              key={account.id}
              onClick={() => onConvert(account.id)}
              className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95"
            >
              {t('convert_to', { accountCurrency: account.currency })}
            </button>
          ))}
          <button
            onClick={onCreateNew}
            className="w-full bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95"
          >
            {t('create_new_account_in', { currency: detectedCurrency })}
          </button>
        </div>
        
        <button onClick={onClose} className="text-sm font-semibold text-text-secondary dark:text-text-secondary-dark hover:underline pt-2">
            {t('cancel')}
        </button>

      </div>
    </Modal>
  );
};

export default CurrencyMismatchModal;