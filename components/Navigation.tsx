import React from 'react';
import { Tab } from '../types';
import { 
    HomeIcon, 
    CardIcon, 
    ScaleIcon, 
    CogIcon, 
    ChevronDoubleLeftIcon, 
    ChartPieIcon,
    CollectionIcon,
    ShieldCheckIcon,
    CalendarIcon,
    BullseyeIcon,
    GaugeIcon,
    DocumentTextIcon
} from './icons';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  t: (key: string) => string;
  userName: string;
  avatar: string;
}

const Navigation: React.FC<NavigationProps> = ({ 
    activeTab, 
    setActiveTab, 
    isCollapsed, 
    toggleCollapse, 
    t, 
    userName, 
    avatar 
}) => {
  const navItems: { tab: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'dashboard', labelKey: 'dashboard', icon: HomeIcon },
    { tab: 'accounts', labelKey: 'accounts', icon: CardIcon },
    { tab: 'debts', labelKey: 'debts', icon: ScaleIcon },
    { tab: 'recurring', labelKey: 'recurring', icon: CollectionIcon },
    { tab: 'limits', labelKey: 'limits', icon: ShieldCheckIcon },
    { tab: 'goals', labelKey: 'goals', icon: BullseyeIcon },
    { tab: 'analysis', labelKey: 'analysis', icon: ChartPieIcon },
    { tab: 'history', labelKey: 'history', icon: DocumentTextIcon },
    { tab: 'wellness', labelKey: 'wellness', icon: GaugeIcon },
    { tab: 'calendar', labelKey: 'calendar', icon: CalendarIcon },
    { tab: 'settings', labelKey: 'settings', icon: CogIcon },
  ];

  const NavLink: React.FC<{ item: { tab: Tab; labelKey: string; icon: React.FC<{ className?: string }> }}> = ({ item }) => {
    const isActive = activeTab === item.tab;
    return (
        <li>
            <button
              onClick={() => setActiveTab(item.tab)}
              className={`flex items-center w-full p-3 rounded-lg transition-colors text-left ${
                isActive 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'text-text-secondary dark:text-text-secondary-dark hover:bg-secondary dark:hover:bg-secondary-dark'
              }`}
              title={isCollapsed ? t(item.labelKey) : ''}
            >
              <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-primary' : ''}`} />
              {!isCollapsed && <span className="ml-4 font-semibold">{t(item.labelKey)}</span>}
            </button>
        </li>
    );
  };

  return (
    <aside className={`hidden md:flex flex-col bg-surface dark:bg-surface-dark border-r border-secondary dark:border-border-dark transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className={`flex items-center p-4 h-20 border-b border-secondary dark:border-border-dark ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && <span className="text-xl font-bold text-text-main dark:text-text-main-dark">Finanzas</span>}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map(item => <NavLink key={item.tab} item={item} />)}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondary dark:border-border-dark">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center w-full p-2 rounded-lg text-left hover:bg-secondary dark:hover:bg-secondary-dark ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? userName : ''}
        >
          <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full shrink-0" />
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-semibold text-sm truncate text-text-main dark:text-text-main-dark">{userName}</p>
            </div>
          )}
        </button>
      </div>
      
      {/* Collapse Toggle */}
      <button 
        onClick={toggleCollapse} 
        className="absolute top-7 -right-4 bg-surface dark:bg-surface-dark border border-secondary dark:border-border-dark rounded-full p-1 text-text-secondary dark:text-text-secondary-dark hover:text-primary z-10"
        aria-label={t('collapse')}
      >
        <ChevronDoubleLeftIcon className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
};

export default Navigation;