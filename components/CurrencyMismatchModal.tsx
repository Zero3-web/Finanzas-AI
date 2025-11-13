import React from 'react';
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
  // FIX: Rewrote the logic to create `uniqueAccountsByCurrency` using `Array.from()` to ensure proper type inference. The spread syntax on an iterator (`...map.values()`) can sometimes cause TypeScript to infer a less specific type like `unknown[]`. `Array.from()` is more robust in this case.
  const uniqueAccountsByCurrency = Array.from(new Map(accounts.map(item => [item.currency, item])).values());

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