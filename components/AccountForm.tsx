import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';

interface AccountFormProps {
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (account: Account) => void;
  onClose: () => void;
  accountToEdit?: Account | null;
  t: (key: string) => string;
}

const AccountForm: React.FC<AccountFormProps> = ({ onAddAccount, onUpdateAccount, onClose, accountToEdit, t }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  
  const isEditing = !!accountToEdit;

  useEffect(() => {
    if (isEditing) {
        setName(accountToEdit.name);
        setBalance(String(accountToEdit.balance));
        setType(accountToEdit.type);
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
      creditLimit: type === 'credit' ? parseFloat(creditLimit) : undefined,
      paymentDueDate: type === 'credit' ? paymentDueDate : undefined,
    };

    if (isEditing) {
        onUpdateAccount({ ...accountData, id: accountToEdit.id });
    } else {
        onAddAccount(accountData);
    }
    
    onClose();
  };

  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main dark:text-gray-100 p-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('account_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('account_name_placeholder')} />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('account_type')}</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as AccountType)} className={inputClasses}>
          <option value="checking">{t('checking')}</option>
          <option value="savings">{t('savings')}</option>
          <option value="credit">{t('credit')}</option>
        </select>
      </div>
      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{isEditing ? t('current_balance') : t('initial_balance')}</label>
        <input type="number" id="balance" value={balance} onChange={(e) => setBalance(e.target.value)} className={inputClasses} placeholder="0.00" />
      </div>

      {type === 'credit' && (
        <>
            <div>
                <label htmlFor="creditLimit" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('credit_limit')}</label>
                <input type="number" id="creditLimit" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className={inputClasses} placeholder="5000" />
            </div>
            <div>
                <label htmlFor="paymentDueDate" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('payment_due_day')}</label>
                <input type="number" id="paymentDueDate" value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)} className={inputClasses} placeholder="28" min="1" max="31" />
            </div>
        </>
      )}

      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-text-main dark:text-gray-100 font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default AccountForm;