import React, { useState, useMemo } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import { PencilIcon, TrashIcon } from '../components/icons';
import Card from '../components/Card';

interface HistoryProps {
  transactions: Transaction[];
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  onEditTransaction: (transaction: Transaction) => void;
  onRemoveTransaction: (transactionId: string) => void;
  t: (key: string) => string;
}

const History: React.FC<HistoryProps> = ({ transactions, accounts, formatCurrency, onEditTransaction, onRemoveTransaction, t }) => {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ key: 'date', order: 'desc' });
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType.INCOME | TransactionType.EXPENSE>('all');


  const accountMap = useMemo(() => {
    return accounts.reduce((map, acc) => {
      map[acc.id] = acc;
      return map;
    }, {} as { [key: string]: Account });
  }, [accounts]);
  
  const filteredAndSortedTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
          if (typeFilter === 'all') return true;
          return t.type === typeFilter;
      })
      .filter(t => t.description.toLowerCase().includes(filter.toLowerCase()) || t.category.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sort.key === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sort.order === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sort.key === 'amount') {
          return sort.order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        return 0;
      });
  }, [transactions, filter, sort, typeFilter]);

  const handleSort = (key: 'date' | 'amount') => {
    if (sort.key === key) {
        setSort(prev => ({...prev, order: prev.order === 'asc' ? 'desc' : 'asc'}));
    } else {
        setSort({ key, order: 'desc' });
    }
  }

  const getButtonClasses = (type: 'all' | TransactionType) => {
    const baseClasses = "px-4 py-2 rounded-lg text-sm font-semibold transition-colors";
    if (typeFilter === type) {
        return `${baseClasses} bg-primary text-white`;
    }
    return `${baseClasses} bg-surface dark:bg-surface-dark hover:bg-secondary dark:hover:bg-secondary-dark`;
  };

  const getCategoryTranslation = (category: string) => {
    const key = `category_${category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;
    return t(key);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('history')}</h1>
      
      <Card className="p-4 space-y-4">
        <input 
            type="text"
            placeholder={t('search_transactions')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full bg-secondary dark:bg-secondary-dark border-transparent rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-text-main-dark p-3"
            id="search-transactions"
        />
        <div className="flex items-center space-x-2">
            <button onClick={() => setTypeFilter('all')} className={getButtonClasses('all')}>
                {t('all')}
            </button>
            <button onClick={() => setTypeFilter(TransactionType.INCOME)} className={getButtonClasses(TransactionType.INCOME)}>
                {t('income')}
            </button>
            <button onClick={() => setTypeFilter(TransactionType.EXPENSE)} className={getButtonClasses(TransactionType.EXPENSE)}>
                {t('expense')}
            </button>
        </div>
      </Card>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-secondary dark:border-border-dark text-sm text-text-secondary dark:text-text-secondary-dark" id="history-table-header">
                    <tr>
                        <th className="p-3 cursor-pointer" onClick={() => handleSort('date')}>{t('date')}</th>
                        <th className="p-3">{t('description')}</th>
                        <th className="p-3">{t('category')}</th>
                        <th className="p-3">{t('account')}</th>
                        <th className="p-3 text-right cursor-pointer" onClick={() => handleSort('amount')}>{t('amount')}</th>
                        <th className="p-3 text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedTransactions.map(transaction => {
                        const account = accountMap[transaction.accountId];
                        return (
                        <tr key={transaction.id} className="border-b border-secondary dark:border-border-dark last:border-b-0 hover:bg-secondary dark:hover:bg-secondary-dark/50">
                            <td className="p-3">{new Date(transaction.date).toLocaleDateString()}</td>
                            <td className="p-3">{transaction.description}</td>
                            <td className="p-3">{getCategoryTranslation(transaction.category)}</td>
                            <td className="p-3">{account?.name}</td>
                            <td className={`p-3 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-income' : 'text-expense'}`}>
                                {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount, account?.currency || 'USD')}
                            </td>
                            <td className="p-3 text-right">
                                <button onClick={() => onEditTransaction(transaction)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary p-1">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onRemoveTransaction(transaction.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense p-1 ml-2">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
        {filteredAndSortedTransactions.length === 0 && (
            <div className="text-center py-10">
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('noTransactionsFound')}</p>
            </div>
        )}
      </Card>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filteredAndSortedTransactions.length > 0 ? (
          filteredAndSortedTransactions.map(transaction => {
            const account = accountMap[transaction.accountId];
            return (
            <Card key={transaction.id} className="p-4" id={`transaction-${transaction.id}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm bg-secondary dark:bg-secondary-dark px-2 py-1 rounded-md">{getCategoryTranslation(transaction.category)}</span>
                <p className={`font-semibold text-lg ${transaction.type === TransactionType.INCOME ? 'text-income' : 'text-expense'}`}>
                    {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount, account?.currency || 'USD')}
                </p>
              </div>
              <p className="font-semibold text-text-main dark:text-text-main-dark mb-3 break-words">{transaction.description}</p>
              <div className="flex justify-between items-center text-sm text-text-secondary dark:text-gray-500">
                  <span>{account?.name} &bull; {new Date(transaction.date).toLocaleDateString()}</span>
                  <div>
                      <button onClick={() => onEditTransaction(transaction)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary p-1 rounded-full">
                          <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onRemoveTransaction(transaction.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense p-1 ml-1 rounded-full">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
              </div>
            </Card>
          )})
        ) : (
          <Card>
            <div className="text-center py-10">
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('noTransactionsFound')}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;