import React from 'react';
import { Subscription } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon } from '../components/icons';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  formatCurrency: (amount: number, currency: string) => string;
  onAddSubscription: () => void;
  onEditSubscription: (subscription: Subscription) => void;
  onRemoveSubscription: (subscriptionId: string) => void;
  t: (key: string) => string;
}

const SubscriptionCard: React.FC<{ 
    subscription: Subscription; 
    formatCurrency: (amount: number, currency: string) => string; 
    onEdit: (subscription: Subscription) => void;
    onRemove: (id: string) => void;
    t: (key: string) => string;
}> = ({ subscription, formatCurrency, onEdit, onRemove, t }) => {
  
  const getNextPaymentDate = () => {
      const today = new Date();
      const dayOfMonth = parseInt(subscription.paymentDay);
      let nextPayment = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
      if (nextPayment < today) {
          nextPayment.setMonth(nextPayment.getMonth() + 1);
      }
      return nextPayment.toLocaleDateString();
  }

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-xl font-bold text-text-main dark:text-brand-white">{subscription.name}</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400 capitalize">{t(`category_${subscription.category.toLowerCase()}`)}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={() => onEdit(subscription)} className="text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onRemove(subscription.id)} className="text-text-secondary dark:text-gray-400 hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <p className="text-2xl font-semibold text-text-main dark:text-gray-200">{formatCurrency(subscription.amount, subscription.currency)}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-secondary dark:border-gray-700 text-sm">
          <div className="flex justify-between">
              <span className="text-text-secondary dark:text-gray-400">{t('next_payment_date')}</span>
              <span className="font-medium text-text-main dark:text-gray-300">{getNextPaymentDate()}</span>
          </div>
      </div>
    </Card>
  );
};

const AddNewCard: React.FC<{
    onClick: () => void;
    title: string;
    examples: string;
}> = ({ onClick, title, examples }) => (
    <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent shadow-none hover:border-primary dark:hover:border-primary-dark cursor-pointer transition-colors" onClick={onClick}>
        <div className="text-center text-text-secondary dark:text-gray-400">
            <PlusIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-text-main dark:text-gray-200">{title}</p>
            <p className="text-xs mt-1">{examples}</p>
        </div>
    </Card>
);


const Subscriptions: React.FC<SubscriptionsProps> = ({ subscriptions, formatCurrency, onAddSubscription, onEditSubscription, onRemoveSubscription, t }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-brand-white">{t('subscriptions')}</h1>
        <button onClick={onAddSubscription} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addSubscription')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map(sub => (
          <SubscriptionCard key={sub.id} subscription={sub} formatCurrency={formatCurrency} onEdit={onEditSubscription} onRemove={onRemoveSubscription} t={t} />
        ))}
        <AddNewCard 
            onClick={onAddSubscription}
            title={t('add_fixed_expense')}
            examples={t('fixed_expense_examples')}
        />
        <AddNewCard 
            onClick={onAddSubscription}
            title={t('addSubscription')}
            examples={t('subscription_examples')}
        />
      </div>
    </div>
  );
};

export default Subscriptions;