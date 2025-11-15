import React, { useMemo } from 'react';
import { ShoppingListItem } from '../types';
import Card from '../components/Card';
import { PlusIcon, ShoppingCartIcon, TrashIcon, PencilIcon } from '../components/icons';

interface ShoppingListProps {
  items: ShoppingListItem[];
  onAddItem: () => void;
  onEditItem: (item: ShoppingListItem) => void;
  onRemoveItem: (id: string) => void;
  onToggleItem: (id: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
  primaryCurrency: string;
  t: (key: string) => string;
}

const ShoppingItemCard: React.FC<{
    item: ShoppingListItem;
    onToggle: (id: string) => void;
    onEdit: (item: ShoppingListItem) => void;
    onRemove: (id: string) => void;
    formatCurrency: (amount: number, currency: string) => string;
}> = ({ item, onToggle, onEdit, onRemove, formatCurrency }) => {
    return (
        <Card className={`transition-opacity ${item.purchased ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center h-6 w-6 shrink-0">
                    <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => onToggle(item.id)}
                        className="appearance-none h-6 w-6 rounded border-2 border-gray-300 dark:border-gray-600 checked:bg-primary checked:border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark transition"
                    />
                    {item.purchased && (
                        <svg className="absolute w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <div className="flex-grow">
                    <p className={`font-semibold text-text-main dark:text-text-main-dark ${item.purchased ? 'line-through' : ''}`}>
                        {item.name}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        {formatCurrency(item.price, item.currency)}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(item)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary p-1">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onRemove(item.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense p-1">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </Card>
    );
}


const ShoppingList: React.FC<ShoppingListProps> = ({ items, onAddItem, onEditItem, onRemoveItem, onToggleItem, formatCurrency, primaryCurrency, t }) => {

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);
  
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
        if (a.purchased === b.purchased) return 0;
        return a.purchased ? 1 : -1;
    });
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('lista_compras')}</h1>
        <button onClick={onAddItem} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('add_item')}
        </button>
      </div>
      
      <Card>
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">{t('total_shopping_list')}</h2>
            <p className="text-2xl font-bold text-primary">{formatCurrency(total, primaryCurrency)}</p>
        </div>
      </Card>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedItems.map((item, index) => (
                <div key={item.id} className="animate-item-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                    <ShoppingItemCard 
                        item={item}
                        onToggle={onToggleItem}
                        onEdit={onEditItem}
                        onRemove={onRemoveItem}
                        formatCurrency={formatCurrency}
                    />
                </div>
            ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-8 md:p-12 mt-4">
            <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <ShoppingCartIcon className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('empty_state_shopping_list_title')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark mt-2 max-w-sm mx-auto">{t('empty_state_shopping_list_desc')}</p>
             <button onClick={onAddItem} className="mt-6 flex items-center bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" />
                {t('add_item')}
            </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;