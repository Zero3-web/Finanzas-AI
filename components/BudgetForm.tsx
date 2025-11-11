import React, { useState, useEffect } from 'react';
import { Budget } from '../types';

interface BudgetFormProps {
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onClose: () => void;
  budgetToEdit?: Budget | null;
  t: (key: string) => string;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onAddBudget, onUpdateBudget, onClose, budgetToEdit, t }) => {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  
  const isEditing = !!budgetToEdit;

  useEffect(() => {
    if (isEditing) {
      setCategory(budgetToEdit.category);
      setLimit(String(budgetToEdit.limit));
      setPeriod(budgetToEdit.period);
    }
  }, [budgetToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) {
      alert(t('fillAllFields'));
      return;
    }

    const budgetData = {
      category,
      limit: parseFloat(limit),
      period,
    };

    if (isEditing) {
      onUpdateBudget({ ...budgetData, id: budgetToEdit!.id });
    } else {
      onAddBudget(budgetData);
    }
    
    onClose();
  };
  
  const expenseCategories = ['Comida', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 'Otros'];
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('category')}</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
            <option value="">{t('selectCategory')}</option>
            {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>
      </div>
       <div>
        <label htmlFor="limit" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('limit')}</label>
        <input type="number" id="limit" value={limit} onChange={(e) => setLimit(e.target.value)} className={inputClasses} placeholder="500.00" />
      </div>
      <div>
        <label htmlFor="period" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('period')}</label>
        <select id="period" value={period} onChange={(e) => setPeriod(e.target.value as 'monthly' | 'weekly')} className={inputClasses}>
          <option value="monthly">{t('monthly')}</option>
          <option value="weekly">{t('weekly')}</option>
        </select>
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default BudgetForm;
