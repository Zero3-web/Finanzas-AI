import React, { useState, useEffect } from 'react';
import { ShoppingListItem } from '../types';

interface ShoppingItemFormProps {
  onSubmit: (item: Omit<ShoppingListItem, 'id' | 'purchased'>) => void;
  onUpdate: (item: ShoppingListItem) => void;
  onClose: () => void;
  itemToEdit?: ShoppingListItem | null;
  t: (key: string) => string;
  primaryCurrency: string;
}

const ShoppingItemForm: React.FC<ShoppingItemFormProps> = ({ onSubmit, onUpdate, onClose, itemToEdit, t, primaryCurrency }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setPrice(String(itemToEdit.price));
    } else {
      setName('');
      setPrice('');
    }
  }, [itemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(t('fillAllFields'));
      return;
    }

    const itemData = {
      name: name.trim(),
      price: parseFloat(price) || 0,
      currency: primaryCurrency,
    };

    if (isEditing) {
      onUpdate({ ...itemData, id: itemToEdit.id, purchased: itemToEdit.purchased });
    } else {
      onSubmit(itemData);
    }
  };

  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="itemName" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('product_name_placeholder')}</label>
        <input
          type="text"
          id="itemName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
          placeholder={t('product_name_placeholder')}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="itemPrice" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('price_placeholder')}</label>
        <input
          type="number"
          id="itemPrice"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClasses}
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2 transition-transform transform active:scale-95">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded transition-transform transform active:scale-95">{isEditing ? t('update') : t('add')}</button>
      </div>
    </form>
  );
};

export default ShoppingItemForm;
