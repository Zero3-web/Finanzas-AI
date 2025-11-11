import React, { useState, useEffect } from 'react';
import { SpendingLimit } from '../types';

interface LimitFormProps {
  onAddLimit: (limit: Omit<SpendingLimit, 'id'>) => void;
  onUpdateLimit: (limit: SpendingLimit) => void;
  onClose: () => void;
  limitToEdit?: SpendingLimit | null;
  t: (key: string) => string;
  existingCategories: string[];
  primaryCurrency: string;
}

const LimitForm: React.FC<LimitFormProps> = ({ onAddLimit, onUpdateLimit, onClose, limitToEdit, t, existingCategories, primaryCurrency }) => {
  const [category, setCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  
  const isEditing = !!limitToEdit;
  const expenseCategories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];

  useEffect(() => {
    if (isEditing) {
        setCategory(limitToEdit.category);
        setLimitAmount(String(limitToEdit.limitAmount));
        setCurrency(limitToEdit.currency);
    } else {
        // Set default category to the first one not already in use
        const availableCategory = expenseCategories.find(cat => !existingCategories.includes(cat));
        setCategory(availableCategory || '');
    }
  }, [limitToEdit, isEditing, existingCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limitAmount) {
      alert(t('fillAllFields'));
      return;
    }

    const limitData = {
      category,
      limitAmount: parseFloat(limitAmount),
      currency,
    };

    if (isEditing) {
        onUpdateLimit({ ...limitData, id: limitToEdit.id });
    } else {
        onAddLimit(limitData);
    }
    
    onClose();
  };

  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('category')}</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses} disabled={isEditing}>
            <option value="">{t('selectCategory')}</option>
            {/* Show only categories that don't have a limit yet, but include the current one if editing */}
            {expenseCategories.filter(cat => !existingCategories.includes(cat) || category === cat).map(cat => (
                <option key={cat} value={cat}>{t(`category_${cat.toLowerCase()}`)}</option>
            ))}
        </select>
         {isEditing && <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">{t('category_edit_warning')}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="limitAmount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('monthly_limit')}</label>
            <input type="number" id="limitAmount" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} className={inputClasses} placeholder="500" />
        </div>
        <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('item_currency')}</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses} disabled={isEditing}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('addLimit')}</button>
      </div>
    </form>
  );
};

export default LimitForm;