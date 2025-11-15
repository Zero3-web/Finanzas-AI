import React, { useState, useEffect } from 'react';
import { InitialInvestment, Debt } from '../types';
import { useCurrentDate } from '../contexts/CurrentDateContext';

interface InversionInicialFormProps {
  onSubmit: (investment: Omit<InitialInvestment, 'id'> | InitialInvestment, debtDetails?: Omit<Debt, 'id'>) => void;
  onClose: () => void;
  investmentToEdit?: InitialInvestment | null;
  t: (key: string) => string;
  primaryCurrency: string;
}

const InversionInicialForm: React.FC<InversionInicialFormProps> = ({ onSubmit, onClose, investmentToEdit, t, primaryCurrency }) => {
  const { currentDate } = useCurrentDate();
  
  // Investment state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [status, setStatus] = useState<'pending' | 'paid' | 'loan'>('pending');
  
  // Debt state (for when status is 'loan')
  const [hasInterest, setHasInterest] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [interestRate, setInterestRate] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  
  const isEditing = !!(investmentToEdit && investmentToEdit.id);

  useEffect(() => {
    if (investmentToEdit) {
        setName(investmentToEdit.name || '');
        setAmount(investmentToEdit.amount ? String(investmentToEdit.amount) : '');
        setCurrency(investmentToEdit.currency || primaryCurrency);
        setStatus(investmentToEdit.status || 'pending');
    } else {
      setNextPaymentDate(currentDate.toISOString().split('T')[0]);
      setHasInterest(false); // Reset on new form
    }
  }, [investmentToEdit, primaryCurrency, currentDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) {
      alert(t('fillAllFields'));
      return;
    }

    const investmentData: Omit<InitialInvestment, 'id'> | InitialInvestment = {
      ...(isEditing ? { id: investmentToEdit.id } : {}),
      name,
      amount: parseFloat(amount),
      currency,
      status,
    };

    let debtDetails: Omit<Debt, 'id'> | undefined = undefined;
    if (status === 'loan' && (!isEditing || investmentToEdit?.status !== 'loan')) {
         if (!monthlyPayment || !totalInstallments || !nextPaymentDate || (hasInterest && !interestRate)) {
            alert(t('fillAllFields'));
            return;
         }
         debtDetails = {
            name,
            totalAmount: parseFloat(amount),
            currency,
            monthlyPayment: parseFloat(monthlyPayment),
            totalInstallments: parseInt(totalInstallments),
            paidInstallments: parseInt(paidInstallments),
            interestRate: hasInterest ? parseFloat(interestRate) : 0,
            nextPaymentDate,
         }
    }

    onSubmit(investmentData, debtDetails);
  };
  
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  const showDebtFields = status === 'loan';
  const debtFieldsDisabled = isEditing && investmentToEdit?.status === 'loan';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('inversion_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('inversion_name_placeholder')} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('amount')}</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} placeholder="1500.00" />
        </div>
        <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('item_currency')}</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('status')}</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputClasses} disabled={debtFieldsDisabled}>
          <option value="pending">{t('pending')}</option>
          <option value="paid">{t('paid')}</option>
          <option value="loan">{t('loan')}</option>
        </select>
      </div>
      
      {debtFieldsDisabled && (
        <p className="text-xs text-center p-2 bg-secondary dark:bg-secondary-dark rounded-md">{t('investment_linked_to_debt')}</p>
      )}

      {showDebtFields && !debtFieldsDisabled && (
        <div className="space-y-4 pt-4 border-t border-secondary dark:border-border-dark animate-view-fade-in">
            <p className="text-sm text-center p-2 bg-primary/10 text-primary rounded-md">{t('investment_as_loan_desc')}</p>
            <div>
                <label htmlFor="monthlyPayment" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('monthlyPayment')}</label>
                <input type="number" id="monthlyPayment" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} className={inputClasses} placeholder="200" />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="hasInterest"
                    checked={hasInterest}
                    onChange={(e) => setHasInterest(e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-secondary-dark shrink-0"
                />
                <label htmlFor="hasInterest" className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('has_interest')}</label>
            </div>

            {hasInterest && (
                <div className="animate-view-fade-in">
                    <label htmlFor="interestRate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('interest_rate')} (%)</label>
                    <input type="number" id="interestRate" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputClasses} placeholder="5.5" />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="paidInstallments" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('paidInstallments')}</label>
                    <input type="number" id="paidInstallments" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} className={inputClasses} placeholder="0" />
                </div>
                <div>
                    <label htmlFor="totalInstallments" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('totalInstallments')}</label>
                    <input type="number" id="totalInstallments" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} className={inputClasses} placeholder="12" />
                </div>
            </div>
            <div>
                <label htmlFor="nextPaymentDate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('next_payment_date')}</label>
                <input type="date" id="nextPaymentDate" value={nextPaymentDate} onChange={(e) => setNextPaymentDate(e.target.value)} className={inputClasses} />
            </div>
        </div>
      )}


      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2 transition-transform transform active:scale-95">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded transition-transform transform active:scale-95">{isEditing ? t('update') : t('add_inversion')}</button>
      </div>
    </form>
  );
};

export default InversionInicialForm;