import React, { useState, useEffect } from 'react';
import { Debt } from '../types';

interface DebtFormProps {
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onUpdateDebt: (debt: Debt) => void;
  onClose: () => void;
  debtToEdit?: Debt | null;
  t: (key: string) => string;
  primaryCurrency: string;
}

const DebtForm: React.FC<DebtFormProps> = ({ onAddDebt, onUpdateDebt, onClose, debtToEdit, t, primaryCurrency }) => {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [interestRate, setInterestRate] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState(primaryCurrency);

  const isEditing = !!debtToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(debtToEdit.name);
      setTotalAmount(String(debtToEdit.totalAmount));
      setMonthlyPayment(String(debtToEdit.monthlyPayment));
      setTotalInstallments(String(debtToEdit.totalInstallments));
      setPaidInstallments(String(debtToEdit.paidInstallments));
      setInterestRate(String(debtToEdit.interestRate));
      setNextPaymentDate(new Date(debtToEdit.nextPaymentDate).toISOString().split('T')[0]);
      setCurrency(debtToEdit.currency);
    }
  }, [debtToEdit, isEditing]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalAmount || !interestRate || !nextPaymentDate || !monthlyPayment || !totalInstallments) {
      alert(t('fillAllFields'));
      return;
    }

    const debtData = {
      name,
      totalAmount: parseFloat(totalAmount),
      monthlyPayment: parseFloat(monthlyPayment),
      totalInstallments: parseInt(totalInstallments),
      paidInstallments: parseInt(paidInstallments),
      interestRate: parseFloat(interestRate),
      nextPaymentDate,
      currency,
    };

    if (isEditing) {
      onUpdateDebt({ ...debtData, id: debtToEdit.id });
    } else {
      onAddDebt(debtData);
    }
    
    onClose();
  };
  
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('debt_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('debt_name_placeholder')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('total_amount')}</label>
            <input type="number" id="totalAmount" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className={inputClasses} placeholder="10000" />
        </div>
        <div>
            <label htmlFor="item_currency" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('item_currency')}</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="monthlyPayment" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('monthlyPayment')}</label>
            <input type="number" id="monthlyPayment" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} className={inputClasses} placeholder="500" />
        </div>
        <div>
            <label htmlFor="interestRate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('interest_rate')} (%)</label>
            <input type="number" id="interestRate" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputClasses} placeholder="5.5" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="paidInstallments" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('paidInstallments')}</label>
            <input type="number" id="paidInstallments" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} className={inputClasses} placeholder="0" />
        </div>
        <div>
            <label htmlFor="totalInstallments" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('totalInstallments')}</label>
            <input type="number" id="totalInstallments" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} className={inputClasses} placeholder="24" />
        </div>
      </div>
      <div>
        <label htmlFor="nextPaymentDate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('next_payment_date')}</label>
        <input type="date" id="nextPaymentDate" value={nextPaymentDate} onChange={(e) => setNextPaymentDate(e.target.value)} className={inputClasses} />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('addDebt')}</button>
      </div>
    </form>
  );
};

export default DebtForm;