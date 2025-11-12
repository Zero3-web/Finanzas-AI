import React, { useState, useMemo } from 'react';
import { Account, Goal, SpendingLimit, RecurringTransaction, Transaction, TransactionType } from '../types';
import { CogIcon } from '../components/icons';
import useLocalStorage from '../hooks/useLocalStorage';
import { FocusModeConfig } from '../types';
import FocusModeCustomizeModal from '../components/FocusModeCustomizeModal';
import { GoalProgressWidget, SpendingLimitWidget, UpcomingBillsWidget, QuickAddWidget, FinancialTipWidget } from '../components/FocusModeWidgets';

interface FocusModeProps {
    onExit: () => void;
    t: (key: string) => string;
    formatCurrency: (amount: number, currency: string) => string;
    accounts: Account[];
    goals: Goal[];
    limits: SpendingLimit[];
    recurringTransactions: RecurringTransaction[];
    transactions: Transaction[];
    primaryCurrency: string;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
}

const FocusMode: React.FC<FocusModeProps> = ({ 
    onExit, 
    t, 
    formatCurrency,
    accounts,
    goals,
    limits,
    recurringTransactions,
    transactions,
    primaryCurrency,
    onAddTransaction
}) => {
    const [config, setConfig] = useLocalStorage<FocusModeConfig>('focus-mode-config', {
        activeWidgets: ['goal', 'limit', 'quickAdd'],
        selectedGoalId: goals[0]?.id,
        selectedLimitId: limits[0]?.id,
    });
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

    const selectedGoal = useMemo(() => goals.find(g => g.id === config.selectedGoalId), [goals, config.selectedGoalId]);
    const selectedLimit = useMemo(() => limits.find(l => l.id === config.selectedLimitId), [limits, config.selectedLimitId]);

    const renderWidget = (widgetType: string) => {
        switch (widgetType) {
            case 'goal':
                return <GoalProgressWidget key="goal" goal={selectedGoal} formatCurrency={formatCurrency} t={t} />;
            case 'limit':
                return <SpendingLimitWidget key="limit" limit={selectedLimit} transactions={transactions} accounts={accounts} formatCurrency={formatCurrency} t={t} />;
            case 'upcoming':
                return <UpcomingBillsWidget key="upcoming" recurringTransactions={recurringTransactions} formatCurrency={formatCurrency} t={t} />;
            case 'quickAdd':
                return <QuickAddWidget key="quickAdd" onAddTransaction={onAddTransaction} accounts={accounts} t={t} />;
            case 'tip':
                return <FinancialTipWidget key="tip" t={t} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-background dark:bg-background-dark p-4 md:p-8 animate-view-fade-in flex flex-col">
            <header className="flex justify-end items-center mb-8">
                 <button onClick={() => setIsCustomizeModalOpen(true)} className="p-2 rounded-full text-text-secondary dark:text-gray-400 hover:bg-secondary dark:hover:bg-gray-700 mr-2" title={t('customize_focus_mode')}>
                    <CogIcon className="w-6 h-6" />
                </button>
                <button onClick={onExit} className="bg-secondary dark:bg-secondary-dark text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors text-sm">
                    {t('exit_focus_mode')}
                </button>
            </header>
            
            <main className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {config.activeWidgets.map(renderWidget)}
                </div>
            </main>

            <FocusModeCustomizeModal 
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                config={config}
                setConfig={setConfig}
                goals={goals}
                limits={limits}
                t={t}
            />
        </div>
    );
};

export default FocusMode;
