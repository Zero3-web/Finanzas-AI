import React from 'react';
import { Goal } from '../types';
import Card from '../components/Card';
import { PlusIcon, TrashIcon, PencilIcon } from '../components/icons';

interface GoalsProps {
  goals: Goal[];
  formatCurrency: (amount: number, currency: string) => string;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onRemoveGoal: (goalId: string) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  primaryCurrency: string;
}

const GoalCard: React.FC<{ goal: Goal; formatCurrency: (amount: number, currency: string) => string; onEdit: (goal: Goal) => void; onRemove: (id: string) => void; t: (key: string, params?: { [key: string]: string | number }) => string }> = ({ goal, formatCurrency, onEdit, onRemove, t }) => {
    const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
    const today = new Date();
    const deadlineDate = new Date(goal.deadline);
    deadlineDate.setUTCHours(0,0,0,0);
    today.setUTCHours(0,0,0,0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">{goal.name}</h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{diffDays > 0 ? t('days_left', { days: diffDays }) : t('deadline_passed')}</p>
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
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-text-main dark:text-text-main-dark">{t('progress')}</span>
                    <span className="font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-text-secondary dark:text-gray-500 mt-1">
                    <span>{formatCurrency(goal.savedAmount, goal.currency)} {t('saved')}</span>
                    <span>{formatCurrency(goal.targetAmount, goal.currency)} {t('target')}</span>
                </div>
            </div>
        </Card>
    );
};

const Goals: React.FC<GoalsProps> = ({ goals, formatCurrency, onAddGoal, onEditGoal, onRemoveGoal, t, primaryCurrency }) => {
  const { totalTarget, totalSaved } = goals.reduce((acc, g) => {
    if (g.currency === primaryCurrency) {
      acc.totalTarget += g.targetAmount;
      acc.totalSaved += g.savedAmount;
    }
    return acc;
  }, { totalTarget: 0, totalSaved: 0 });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('goals')}</h1>
        <button onClick={onAddGoal} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addGoal')}
        </button>
      </div>
      {goals.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">{t('total_saved_for_goals')} <span className="text-xs">({t('summary_in_primary_currency', { currency: primaryCurrency })})</span></h2>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalSaved, primaryCurrency)} / {formatCurrency(totalTarget, primaryCurrency)}</p>
          </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} formatCurrency={formatCurrency} onEdit={onEditGoal} onRemove={onRemoveGoal} t={t} />
        ))}
         <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-border-dark bg-transparent shadow-none hover:border-primary dark:hover:border-primary cursor-pointer transition-colors min-h-[190px]" onClick={onAddGoal}>
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