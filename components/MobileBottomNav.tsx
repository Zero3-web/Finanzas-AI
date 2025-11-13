import React from 'react';
import { Tab } from '../types';
import { HomeIcon, ChartPieIcon, CalendarIcon, CardIcon, DocumentTextIcon } from './icons';

interface MobileBottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  t: (key: string) => string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, t }) => {
  const navItems: { tab: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'dashboard', labelKey: 'dashboard', icon: HomeIcon },
    { tab: 'history', labelKey: 'history', icon: DocumentTextIcon },
    { tab: 'calendar', labelKey: 'calendar', icon: CalendarIcon },
    { tab: 'accounts', labelKey: 'accounts', icon: CardIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm border-t border-secondary dark:border-border-dark z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className="flex flex-col items-center justify-center w-full h-full"
            aria-current={activeTab === item.tab ? 'page' : undefined}
          >
            <item.icon className={`w-6 h-6 mb-1 transition-colors ${
              activeTab === item.tab ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark'
            }`} />
            <span className={`text-xs font-medium transition-colors ${
              activeTab === item.tab ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark'
            }`}>
              {t(item.labelKey)}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;