import React from 'react';
import { Account, Transaction, TransactionType } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon } from '../components/icons';

interface AccountsProps {
  accounts: Account[];
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onRemoveAccount: (accountId: string) => void;
  t: (key: string) => string;
}

const AccountCard: React.FC<{ 
    account: Account; 
    formatCurrency: (amount: number) => string; 
    onEdit: (account: Account) => void;
    onRemove: (id: string) => void;
    t: (key: string) => string;
}> = ({ account, formatCurrency, onEdit, onRemove, t }) => {
  
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark">{account.name}</h3>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark capitalize">{t(account.type)}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={() => onEdit(account)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onRemove(account.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <p className="text-2xl font-semibold text-text-main dark:text-text-main-dark">{formatCurrency(account.balance)}</p>
      </div>

      {account.type === 'credit' && (
        <div className="mt-4 pt-4 border-t border-secondary dark:border-border-dark text-sm">
            <div className="flex justify-between">
                <span className="text-text-secondary dark:text-text-secondary-dark">{t('credit_limit')}</span>
                <span className="font-medium text-text-main dark:text-text-main-dark">{formatCurrency(account.creditLimit || 0)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-text-secondary dark:text-text-secondary-dark">{t('payment_due_date')}</span>
                <span className="font-medium text-text-main dark:text-text-main-dark">{t('day')} {account.paymentDueDate}</span>
            </div>
        </div>
      )}
    </Card>
  );
};

const Accounts: React.FC<AccountsProps> = ({ accounts, formatCurrency, onAddAccount, onEditAccount, onRemoveAccount, t }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('accounts')}</h1>
        <button onClick={onAddAccount} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addAccount')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <AccountCard key={account.id} account={account} formatCurrency={formatCurrency} onEdit={onEditAccount} onRemove={onRemoveAccount} t={t} />
        ))}
        <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-border-dark bg-transparent shadow-none hover:border-primary dark:hover:border-primary cursor-pointer transition-colors" onClick={onAddAccount}>
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">
                <PlusIcon className="w-8 h-8 mx-auto mb-2" />
                <p>{t('addAccount')}</p>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Accounts;