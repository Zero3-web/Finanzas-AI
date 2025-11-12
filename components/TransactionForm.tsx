import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType, Account } from '../types';
import { GoogleGenAI } from '@google/genai';
import useLocalStorage from '../hooks/useLocalStorage';
import { SparklesIcon } from './icons';


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
  const [destinationAccountId, setDestinationAccountId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [categoryCache, setCategoryCache] = useLocalStorage<Record<string, string>>('category-cache', {});

  const isEditing = !!transactionToEdit;

  const expenseCategories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Gifts', 'Investments', 'Other'];
  
  useEffect(() => {
    if (accounts.length > 1) {
        setDestinationAccountId(accounts.find(a => a.id !== accountId)?.id || accounts[1].id);
    } else if (accounts.length > 0) {
        setDestinationAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  useEffect(() => {
    if (isEditing) {
        setAmount(String(transactionToEdit.amount));
        setDescription(transactionToEdit.description);
        setCategory(transactionToEdit.category);
        setType(transactionToEdit.type);
        setAccountId(transactionToEdit.accountId);
        setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
        if (transactionToEdit.type === TransactionType.TRANSFER) {
          setDestinationAccountId(transactionToEdit.destinationAccountId || '');
        }
    }
  }, [transactionToEdit, isEditing]);

  const getCategorySuggestion = useCallback(async (desc: string) => {
    if (!process.env.API_KEY || type === TransactionType.TRANSFER) {
        return;
    }
    const lowerDesc = desc.toLowerCase().trim();
    if (categoryCache[lowerDesc]) {
        setCategory(categoryCache[lowerDesc]);
        return;
    }
    
    setIsSuggestingCategory(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const categoryList = type === TransactionType.EXPENSE ? expenseCategories : incomeCategories;
        const prompt = `From the list [${categoryList.join(', ')}], which category best fits the transaction "${desc}"? Answer with only the single category name.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const suggestedCategory = response.text.trim();

        if (categoryList.includes(suggestedCategory)) {
            setCategory(suggestedCategory);
            setCategoryCache(prev => ({ ...prev, [lowerDesc]: suggestedCategory }));
        }
    } catch (error) {
        console.error("Error getting category suggestion:", error);
    } finally {
        setIsSuggestingCategory(false);
    }
  }, [type, categoryCache, setCategoryCache, expenseCategories, incomeCategories]);

  useEffect(() => {
      if (isEditing || description.length < 5 || type === TransactionType.TRANSFER) {
          return;
      }

      const handler = setTimeout(() => {
          getCategorySuggestion(description);
      }, 500);

      return () => {
          clearTimeout(handler);
          setIsSuggestingCategory(false);
      };
  }, [description, type, isEditing, getCategorySuggestion]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isTransfer = type === TransactionType.TRANSFER;
    if (!amount || !description || !accountId || (!isTransfer && !category) || (isTransfer && !destinationAccountId)) {
        alert(t('fillAllFields'));
        return;
    }
    if (isTransfer && accountId === destinationAccountId) {
        alert(t('transfer_same_account_error'));
        return;
    }

    const transactionData = {
      accountId,
      amount: parseFloat(amount),
      description,
      category: isTransfer ? 'Transfer' : category,
      type,
      date,
      destinationAccountId: isTransfer ? destinationAccountId : undefined,
    };

    if (isEditing) {
        onUpdateTransaction({ ...transactionData, id: transactionToEdit.id });
    } else {
        onAddTransaction(transactionData);
    }
  };
  
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";
  const fromAccounts = accounts.filter(acc => acc.id !== destinationAccountId);
  const toAccounts = accounts.filter(acc => acc.id !== accountId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('transactionType')}</label>
        <div className="mt-1 grid grid-cols-3 rounded-md">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-4 py-2 rounded-l-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-expense text-white' : 'bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80'}`}>{t('expense')}</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`px-4 py-2 transition-colors ${type === TransactionType.INCOME ? 'bg-income text-white' : 'bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80'}`}>{t('income')}</button>
            <button type="button" onClick={() => setType(TransactionType.TRANSFER)} className={`px-4 py-2 rounded-r-md transition-colors ${type === TransactionType.TRANSFER ? 'bg-primary text-white' : 'bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80'}`}>{t('transfer')}</button>
        </div>
      </div>

      {type === TransactionType.TRANSFER ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('from_account')}</label>
            <select id="accountId" value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClasses}>
              {fromAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="destinationAccountId" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('to_account')}</label>
            <select id="destinationAccountId" value={destinationAccountId} onChange={(e) => setDestinationAccountId(e.target.value)} className={inputClasses}>
              {toAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('account')}</label>
            <select id="accountId" value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClasses}>
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
        </div>
      )}

       <div>
        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('amount')}</label>
        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} placeholder="0.00" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('description')}</label>
        <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClasses} placeholder={type === TransactionType.EXPENSE ? t('description_expense_placeholder') : type === TransactionType.INCOME ? t('description_income_placeholder') : t('description_transfer_placeholder')} />
      </div>

      {type !== TransactionType.TRANSFER && (
        <div>
            <label htmlFor="category" className="flex items-center justify-between text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
            <span>{t('category')}</span>
            <span className="flex items-center gap-1 text-primary" title={t('category_suggestion_tooltip')}>
                {isSuggestingCategory ? (
                    <div className="w-4 h-4 border-2 border-t-primary border-transparent rounded-full animate-spin"></div>
                ) : (
                    <SparklesIcon className="w-4 h-4" />
                )}
                
            </span>
            </label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
                <option value="">{t('selectCategory')}</option>
                {(type === TransactionType.EXPENSE ? expenseCategories : incomeCategories).map(cat => (
                    <option key={cat} value={cat}>{t(`category_${cat.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`)}</option>
                ))}
            </select>
        </div>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('date')}</label>
        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
      </div>

      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2 transition-transform transform active:scale-95">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded transition-transform transform active:scale-95">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default TransactionForm;