import React, { useState } from 'react';
import { Debt } from '../types';

interface DebtFormProps {
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onClose: () => void;
  t: (key: string) => string;
}

const DebtForm: React.FC<DebtFormProps> = ({ onAddDebt, onClose, t }) => {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [amountPaid, setAmountPaid] = useState('0');
  const [interestRate, setInterestRate] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalAmount || !interestRate || !nextPaymentDate) {
      alert(t('fillAllFields'));
      return;
    }

    onAddDebt({
      name,
      totalAmount: parseFloat(totalAmount),
      amountPaid: parseFloat(amountPaid),
      interestRate: parseFloat(interestRate),
      nextPaymentDate,
    });
    onClose();
  };
  
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main dark:text-gray-100 p-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('debt_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('debt_name_placeholder')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('total_amount')}</label>
            <input type="number" id="totalAmount" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className={inputClasses} placeholder="10000" />
        </div>
        <div>
            <label htmlFor="amountPaid" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('amount_paid')}</label>
            <input type="number" id="amountPaid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className={inputClasses} placeholder="0" />
        </div>
      </div>
      <div>
        <label htmlFor="interestRate" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('interest_rate')} (%)</label>
        <input type="number" id="interestRate" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputClasses} placeholder="5.5" />
      </div>
      <div>
        <label htmlFor="nextPaymentDate" className="block text-sm font-medium text-text-secondary dark:text-gray-400">{t('next_payment_date')}</label>
        <input type="date" id="nextPaymentDate" value={nextPaymentDate} onChange={(e) => setNextPaymentDate(e.target.value)} className={inputClasses} />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-text-main dark:text-gray-100 font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{t('addDebt')}</button>
      </div>
    </form>
  );
};

export default DebtForm;