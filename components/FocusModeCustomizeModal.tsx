import React from 'react';
import Modal from './Modal';
import Switch from './Switch';
import { FocusModeConfig, FocusWidgetType, Goal, SpendingLimit } from '../types';

interface FocusModeCustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: FocusModeConfig;
    setConfig: (config: FocusModeConfig) => void;
    goals: Goal[];
    limits: SpendingLimit[];
    t: (key: string) => string;
}

const FocusModeCustomizeModal: React.FC<FocusModeCustomizeModalProps> = ({ 
    isOpen, 
    onClose, 
    config, 
    setConfig, 
    goals, 
    limits, 
    t 
}) => {
    const allWidgets: FocusWidgetType[] = ['goal', 'limit', 'upcoming', 'quickAdd', 'tip'];

    const handleWidgetToggle = (widget: FocusWidgetType) => {
        const activeWidgets = config.activeWidgets.includes(widget)
            ? config.activeWidgets.filter(w => w !== widget)
            : [...config.activeWidgets, widget];
        setConfig({ ...config, activeWidgets });
    };

    const handleGoalSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConfig({ ...config, selectedGoalId: e.target.value });
    };

    const handleLimitSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConfig({ ...config, selectedLimitId: e.target.value });
    };
    
    const inputClasses = "mt-1 block w-full bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('customize_focus_mode')}>
            <div className="space-y-4">
                {allWidgets.map(widget => (
                    <div key={widget} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary dark:hover:bg-secondary-dark">
                        <label htmlFor={`switch-${widget}`} className="font-semibold text-text-main dark:text-text-main-dark">{t(`widget_${widget}`)}</label>
                        <Switch id={`switch-${widget}`} checked={config.activeWidgets.includes(widget)} onChange={() => handleWidgetToggle(widget)} />
                    </div>
                ))}
                
                {config.activeWidgets.includes('goal') && (
                    <div className="mt-4 pt-4 border-t border-secondary dark:border-border-dark">
                        <label htmlFor="goal-select" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('select_goal_to_track')}</label>
                        <select id="goal-select" value={config.selectedGoalId} onChange={handleGoalSelect} className={inputClasses}>
                            {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                )}

                {config.activeWidgets.includes('limit') && (
                     <div className="mt-4 pt-4 border-t border-secondary dark:border-border-dark">
                        <label htmlFor="limit-select" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('select_limit_to_track')}</label>
                        <select id="limit-select" value={config.selectedLimitId} onChange={handleLimitSelect} className={inputClasses}>
                            {limits.map(l => <option key={l.id} value={l.id}>{t(`category_${l.category.toLowerCase()}`)}</option>)}
                        </select>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default FocusModeCustomizeModal;
