import React from 'react';
import { Goal } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon, SparklesIcon } from '../components/icons';

interface GoalsProps {
  goals: Goal[];
  formatCurrency: (amount: number) => string;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onRemoveGoal: (goalId: string) => void;
  t: (key: string) => string;
}

const GoalCard: React.FC<{ 
    goal: Goal; 
    formatCurrency: (amount: number) => string; 
    onEdit: (goal: Goal) => void; 
    onRemove: (id: string) => void;
    t: (key: string) => string;
}> = ({ goal, formatCurrency, onEdit, onRemove, t }) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">{goal.name}</h3>
                    {goal.deadline && (
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                            {t('deadline')}: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(goal)} className="text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors p-1">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onRemove(goal.id)} className="text-text-secondary dark:text-text-secondary-dark hover:text-expense dark:hover:text-expense-dark transition-colors p-1">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="my-4">
                <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-4 relative">
                    <div className="bg-primary h-4 rounded-full flex items-center justify-center" style={{ width: `${progress}%` }}>
                       {progress > 15 && <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>}
                    </div>
                    {progress <= 15 && <span className="absolute left-2 top-0 bottom-0 flex items-center text-xs font-bold text-primary">{Math.round(progress)}%</span>}
                </div>
                <div className="flex justify-between text-sm text-text-secondary dark:text-gray-500 mt-1">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span className="font-semibold text-text-main dark:text-text-main-dark">{formatCurrency(goal.targetAmount)}</span>
                </div>
            </div>
        </Card>
    );
};

const Goals: React.FC<GoalsProps> = ({ goals, formatCurrency, onAddGoal, onEditGoal, onRemoveGoal, t }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('goals')}</h1>
        <button onClick={onAddGoal} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addGoal')}
        </button>
      </div>
       <Card className="bg-primary/10 dark:bg-primary/20 border border-primary/20">
        <div className="flex items-center">
          <SparklesIcon className="w-10 h-10 text-primary mr-4" />
          <div>
            <h2 className="text-lg font-bold text-text-main dark:text-text-main-dark">{t('goals_motivation_title')}</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark">{t('goals_motivation_desc')}</p>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal}
            formatCurrency={formatCurrency}
            onEdit={onEditGoal}
            onRemove={onRemoveGoal}
            t={t}
          />
        ))}
        <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-border-dark bg-transparent shadow-none hover:border-primary dark:hover:border-primary cursor-pointer transition-colors" onClick={onAddGoal}>
            <div className="text-center text-text-secondary dark:text-text-secondary-dark">
                <PlusIcon className="w-8 h-8 mx-auto mb-2" />
                <p>{t('addGoal')}</p>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Goals;
