import React from 'react';
import { PlusIcon } from '../components/icons';
import Card from '../components/Card';

interface BudgetsProps {
  t: (key: string) => string;
}

const Budgets: React.FC<BudgetsProps> = ({ t }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('budgets')}</h1>
        <button className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('add_budget')}
        </button>
      </div>
      <Card className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-text-secondary dark:text-text-secondary-dark">
          <h2 className="text-xl font-semibold mb-2">{t('no_budgets_yet')}</h2>
          <p>{t('create_budget_prompt')}</p>
        </div>
      </Card>
    </div>
  );
};

export default Budgets;
