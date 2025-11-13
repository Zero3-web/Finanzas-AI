import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';

interface AccountFormProps {
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (account: Account) => void;
  onClose: () => void;
  accountToEdit?: Account | null;
  t: (key: string) => string;
  onSuccess?: () => void;
  primaryCurrency: string;
}

const AccountForm: React.FC<AccountFormProps> = ({ onAddAccount, onUpdateAccount, onClose, accountToEdit, t, onSuccess, primaryCurrency }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  
  const isEditing = !!accountToEdit;

  useEffect(() => {
    if (isEditing) {
        setName(accountToEdit.name);
        setBalance(String(accountToEdit.balance));
        setType(accountToEdit.type);
        setCurrency(accountToEdit.currency);
        setCreditLimit(String(accountToEdit.creditLimit || ''));
        setPaymentDueDate(String(accountToEdit.paymentDueDate || ''));
    }
  }, [accountToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) {
      alert(t('fillAllFields'));
      return;
    }

    const accountData: Omit<Account, 'id'> = {
      name,
      balance: parseFloat(balance),
      type,
      currency,
      creditLimit: type === 'credit' ? parseFloat(creditLimit) : undefined,
      paymentDueDate: type === 'credit' ? paymentDueDate : undefined,
    };

    if (isEditing) {
        onUpdateAccount({ ...accountData, id: accountToEdit.id });
    } else {
        onAddAccount(accountData);
    }
    
    onSuccess?.();
  };
  
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('account_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('account_name_placeholder')} />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('account_type')}</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as AccountType)} className={inputClasses}>
          <option value="checking">{t('checking')}</option>
          <option value="savings">{t('savings')}</option>
          <option value="credit">{t('credit')}</option>
          <option value="cash">{t('cash')}</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="balance" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{isEditing ? t('current_balance') : t('initial_balance')}</label>
            <input type="number" id="balance" value={balance} onChange={(e) => setBalance(e.target.value)} className={inputClasses} placeholder="0.00" />
        </div>
        <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('item_currency')}</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>

      {type === 'credit' && (
        <>
            <div>
                <label htmlFor="creditLimit" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('credit_limit')}</label>
                <input type="number" id="creditLimit" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className={inputClasses} placeholder="5000" />
            </div>
            <div>
                <label htmlFor="paymentDueDate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('payment_due_day')}</label>
                <input type="number" id="paymentDueDate" value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)} className={inputClasses} placeholder="28" min="1" max="31" />
            </div>
        </>
      )}

      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2 transition-transform transform active:scale-95">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded transition-transform transform active:scale-95">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default AccountForm;