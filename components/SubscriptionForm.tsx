import React, { useState, useEffect } from 'react';
import { RecurringTransaction, TransactionType } from '../types';

interface RecurringTransactionFormProps {
  onAddRecurring: (recurring: Omit<RecurringTransaction, 'id'>) => void;
  onUpdateRecurring: (recurring: RecurringTransaction) => void;
  onClose: () => void;
  recurringToEdit?: RecurringTransaction | null;
  t: (key: string) => string;
  primaryCurrency: string;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({ onAddRecurring, onUpdateRecurring, onClose, recurringToEdit, t, primaryCurrency }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  
  const isEditing = !!recurringToEdit;

  useEffect(() => {
    if (isEditing) {
        setName(recurringToEdit.name);
        setAmount(String(recurringToEdit.amount));
        setPaymentDay(recurringToEdit.paymentDay);
        setCategory(recurringToEdit.category);
        setCurrency(recurringToEdit.currency);
        setType(recurringToEdit.type);
    }
  }, [recurringToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !paymentDay || !category) {
      alert(t('fillAllFields'));
      return;
    }

    const recurringData: Omit<RecurringTransaction, 'id'> = {
      name,
      amount: parseFloat(amount),
      paymentDay,
      category,
      currency,
      type,
    };

    if (isEditing) {
        onUpdateRecurring({ ...recurringData, id: recurringToEdit.id });
    } else {
        onAddRecurring(recurringData);
    }
    
    onClose();
  };
  
  const expenseCategories = ['Entertainment', 'Utilities', 'Software', 'Health', 'Housing', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Gifts', 'Investments', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('transactionType')}</label>
        <div className="mt-1 flex rounded-md">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full px-4 py-2 rounded-l-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-expense text-white' : 'bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80'}`}>{t('expense')}</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full px-4 py-2 rounded-r-md transition-colors ${type === TransactionType.INCOME ? 'bg-income text-white' : 'bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80'}`}>{t('income')}</button>
        </div>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('recurring_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('recurring_name_placeholder')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('amount')}</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} placeholder="10.99" />
        </div>
         <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('item_currency')}</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>
       <div>
        <label htmlFor="paymentDay" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('payment_day')}</label>
        <input type="number" id="paymentDay" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} className={inputClasses} placeholder="15" min="1" max="31" />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('category')}</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
            <option value="">{t('selectCategory')}</option>
            {(type === TransactionType.EXPENSE ? expenseCategories : incomeCategories).map(cat => (
                <option key={cat} value={cat}>{t(`category_${cat.toLowerCase()}`)}</option>
            ))}
        </select>
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default RecurringTransactionForm;