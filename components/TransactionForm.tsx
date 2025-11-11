import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account } from '../types';

interface TransactionFormProps {
  accounts: Account[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
  t: (key: string) => string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, onAddTransaction, onUpdateTransaction, onClose, transactionToEdit, t }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState('');
  
  const isEditing = !!transactionToEdit;
  const selectedAccount = accounts.find(acc => acc.id === accountId);
  const isCreditCardPayment = type === TransactionType.EXPENSE && selectedAccount?.type === 'credit';

  useEffect(() => {
    if (isEditing) {
        setAmount(String(transactionToEdit.amount));
        setDescription(transactionToEdit.description.split(' (')[0]); // Remove installment info
        setCategory(transactionToEdit.category);
        setType(transactionToEdit.type);
        setAccountId(transactionToEdit.accountId);
        setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
    }
  }, [transactionToEdit, isEditing]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !accountId || !category) {
        alert(t('fillAllFields'));
        return;
    }
    
    let finalDescription = description;
    if(isCreditCardPayment && installments){
        finalDescription = `${description} (${t('installments_pre')} ${installments} ${t('installments_post')})`;
    }

    const transactionData = {
      accountId,
      amount: parseFloat(amount),
      description: finalDescription,
      category,
      type,
      date,
    };

    if (isEditing) {
        onUpdateTransaction({ ...transactionData, id: transactionToEdit.id });
    } else {
        onAddTransaction(transactionData);
    }
    
    onClose();
  };
  
  const expenseCategories = ['Comida', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 'Otros'];
  const incomeCategories = ['Salario', 'Freelance', 'Inversiones', 'Regalos', 'Otros'];

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
        <label htmlFor="accountId" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('account')}</label>
        <select id="accountId" value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClasses}>
          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
        </select>
      </div>
       <div>
        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('amount')}</label>
        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} placeholder="0.00" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('description')}</label>
        <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClasses} placeholder={type === TransactionType.EXPENSE ? t('description_expense_placeholder') : t('description_income_placeholder')} />
      </div>
      {isCreditCardPayment && (
         <div>
            <label htmlFor="installments" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('installments')}</label>
            <input type="number" id="installments" value={installments} onChange={(e) => setInstallments(e.target.value)} className={inputClasses} placeholder="3" />
        </div>
      )}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('category')}</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
            <option value="">{t('selectCategory')}</option>
            {(type === TransactionType.EXPENSE ? expenseCategories : incomeCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('date')}</label>
        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default TransactionForm;