import React from 'react';
import { InitialInvestment, Debt } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon, PaperAirplaneIcon, ArrowTrendingUpIcon } from '../components/icons';

interface InversionInicialProps {
  initialInvestments: InitialInvestment[];
  debts: Debt[];
  formatCurrency: (amount: number, currency: string) => string;
  onAddInversion: () => void;
  onEditInversion: (investment: InitialInvestment) => void;
  onRemoveInversion: (investmentId: string) => void;
  t: (key: string) => string;
  primaryCurrency: string;
}

const InvestmentCard: React.FC<{ 
    investment: InitialInvestment;
    formatCurrency: (amount: number, currency: string) => string; 
    onEdit: (investment: InitialInvestment) => void;
    onRemove: (id: string) => void;
    t: (key: string) => string;
}> = ({ investment, formatCurrency, onEdit, onRemove, t }) => {

    const getStatusBadge = () => {
        switch(investment.status) {
            case 'paid': return <span className="text-xs font-semibold bg-income/10 text-income px-2 py-1 rounded-full">{t('paid')}</span>
            case 'pending': return <span className="text-xs font-semibold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">{t('pending')}</span>
            case 'loan': return <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{t('loan')}</span>
            default: return null;
        }
    }

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark">{investment.name}</h3>
                <div className="mt-1">{getStatusBadge()}</div>
            </div>
            <div className="flex space-x-2">
                <button onClick={() => onEdit(investment)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onRemove(investment.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <p className="text-2xl font-semibold text-text-main dark:text-text-main-dark">{formatCurrency(investment.amount, investment.currency)}</p>
      </div>
    </Card>
  );
};

const InversionInicial: React.FC<InversionInicialProps> = ({ initialInvestments, debts, formatCurrency, onAddInversion, onEditInversion, onRemoveInversion, t, primaryCurrency }) => {
  const totalInvestment = initialInvestments
    .filter(inv => inv.currency === primaryCurrency)
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('inversion_inicial')}</h1>
        <button onClick={onAddInversion} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('add_inversion')}
        </button>
      </div>

      {initialInvestments.length > 0 && (
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <h2 className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">{t('total_inversion')} <span className="text-xs">({t('summary_in_primary_currency', { currency: primaryCurrency })})</span></h2>
              <p className="text-4xl font-bold text-primary">{formatCurrency(totalInvestment, primaryCurrency)}</p>
          </Card>
      )}

      {initialInvestments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialInvestments.map((investment, index) => (
            <div key={investment.id} className="animate-item-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <InvestmentCard investment={investment} formatCurrency={formatCurrency} onEdit={onEditInversion} onRemove={onRemoveInversion} t={t} />
            </div>
          ))}
        </div>
      ) : (
         <Card className="flex flex-col items-center justify-center text-center p-8 md:p-12 mt-4">
          <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <PaperAirplaneIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2">{t('empty_state_inversion_title')}</h2>
          <p className="text-text-secondary dark:text-text-secondary-dark mb-6 max-w-sm">{t('empty_state_inversion_desc')}</p>
          <button onClick={onAddInversion} className="flex items-center bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('add_inversion')}
          </button>
        </Card>
      )}
    </div>
  );
};

export default InversionInicial;
