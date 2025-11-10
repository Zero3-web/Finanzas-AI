import React, { useState, useEffect } from 'react';
import { Subscription } from '../types';

interface SubscriptionFormProps {
  onAddSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  onUpdateSubscription: (subscription: Subscription) => void;
  onClose: () => void;
  subscriptionToEdit?: Subscription | null;
  t: (key: string) => string;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onAddSubscription, onUpdateSubscription, onClose, subscriptionToEdit, t }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [category, setCategory] = useState('Entertainment');
  
  const isEditing = !!subscriptionToEdit;

  useEffect(() => {
    if (isEditing) {
        setName(subscriptionToEdit.name);
        setAmount(String(subscriptionToEdit.amount));
        setPaymentDay(subscriptionToEdit.paymentDay);
        setCategory(subscriptionToEdit.category);
    }
  }, [subscriptionToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !paymentDay || !category) {
      alert(t('fillAllFields'));
      return;
    }

    const subscriptionData: Omit<Subscription, 'id'> = {
      name,
      amount: parseFloat(amount),
      paymentDay,
      category,
    };

    if (isEditing) {
        onUpdateSubscription({ ...subscriptionData, id: subscriptionToEdit.id });
    } else {
        onAddSubscription(subscriptionData);
    }
    
    onClose();
  };
  
  const subscriptionCategories = ['Entertainment', 'Utilities', 'Software', 'Health', 'Other'];

  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main dark:text-gray-100 p-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('subscription_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('subscription_name_placeholder')} />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('amount')}</label>
        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} placeholder="10.99" />
      </div>
       <div>
        <label htmlFor="paymentDay" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('payment_day')}</label>
        <input type="number" id="paymentDay" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} className={inputClasses} placeholder="15" min="1" max="31" />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('category')}</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
            {subscriptionCategories.map(cat => (
                <option key={cat} value={cat}>{t(`category_${cat.toLowerCase()}`)}</option>
            ))}
        </select>
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-text-main dark:text-gray-100 font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default SubscriptionForm;