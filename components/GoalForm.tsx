import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface GoalFormProps {
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onClose: () => void;
  goalToEdit?: Goal | null;
  t: (key: string) => string;
}

const GoalForm: React.FC<GoalFormProps> = ({ onAddGoal, onUpdateGoal, onClose, goalToEdit, t }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);

  const isEditing = !!goalToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(goalToEdit.name);
      setTargetAmount(String(goalToEdit.targetAmount));
      setSavedAmount(String(goalToEdit.savedAmount));
      setDeadline(new Date(goalToEdit.deadline).toISOString().split('T')[0]);
    }
  }, [goalToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) {
      alert(t('fillAllFields'));
      return;
    }

    const goalData = {
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount),
      deadline,
    };

    if (isEditing) {
      onUpdateGoal({ ...goalData, id: goalToEdit.id });
    } else {
      onAddGoal(goalData);
    }
    
    onClose();
  };
  
  const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('goal_name')}</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder={t('goal_name_placeholder')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('target_amount')}</label>
            <input type="number" id="targetAmount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className={inputClasses} placeholder="5000" />
        </div>
        <div>
            <label htmlFor="savedAmount" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('saved_amount')}</label>
            <input type="number" id="savedAmount" value={savedAmount} onChange={(e) => setSavedAmount(e.target.value)} className={inputClasses} placeholder="0" />
        </div>
      </div>
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('deadline')}</label>
        <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClasses} />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-secondary hover:bg-gray-200 dark:bg-secondary-dark dark:hover:bg-opacity-80 text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded mr-2">{t('cancel')}</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">{isEditing ? t('update') : t('addGoal')}</button>
      </div>
    </form>
  );
};

export default GoalForm;