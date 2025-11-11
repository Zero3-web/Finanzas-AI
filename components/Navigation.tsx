import React from 'react';
import { Tab } from '../types';
import { HomeIcon, CardIcon, ScaleIcon, DocumentTextIcon, CogIcon, ChevronDoubleLeftIcon, ChartPieIcon, CalendarIcon, CollectionIcon, CashIcon, SparklesIcon } from './icons';
import Notifications from './Notifications';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  t: (key: string) => string;
  userName: string;
  avatar: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isCollapsed, toggleCollapse, t, userName, avatar }) => {
  
  const navItems: { tab: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'dashboard', labelKey: 'dashboard', icon: HomeIcon },
    { tab: 'accounts', labelKey: 'accounts', icon: CardIcon },
    { tab: 'budgets', labelKey: 'budgets', icon: CashIcon },
    { tab: 'goals', labelKey: 'goals', icon: SparklesIcon },
    { tab: 'debts', labelKey: 'debts', icon: ScaleIcon },
    { tab: 'subscriptions', labelKey: 'subscriptions', icon: CollectionIcon },
    { tab: 'history', labelKey: 'history', icon: DocumentTextIcon },
    { tab: 'analysis', labelKey: 'analysis', icon: ChartPieIcon },
    { tab: 'calendar', labelKey: 'calendar', icon: CalendarIcon },
    { tab: 'settings', labelKey: 'settings', icon: CogIcon },
  ];

  const mobileNavItems = navItems.filter(item => ['dashboard', 'calendar', 'history', 'analysis'].includes(item.tab));

  const NavItem: React.FC<{
      item: typeof navItems[0],
      isActive: boolean,
      isCollapsed: boolean,
      onClick: () => void
  }> = ({ item, isActive, isCollapsed, onClick }) => (
       <li onClick={onClick} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${ isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary dark:text-text-secondary-dark dark:hover:bg-secondary-dark' }`}>
          <item.icon className="w-6 h-6 shrink-0" />
          {!isCollapsed && <span className="ml-4 font-semibold transition-opacity duration-300">{t(item.labelKey)}</span>}
      </li>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-surface dark:bg-surface-dark text-text-main dark:text-text-main-dark transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center p-4 h-20 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && <h1 className="text-2xl font-bold text-primary">Finanzas</h1>}
        </div>

        <nav className="flex-1 px-4">
            <ul className="space-y-2">
                {navItems.map(item => (
                    <NavItem key={item.tab} item={item} isActive={activeTab === item.tab} isCollapsed={isCollapsed} onClick={() => setActiveTab(item.tab)} />
                ))}
            </ul>
        </nav>
        
        <div className="p-4 border-t border-secondary dark:border-border-dark bg-surface dark:bg-surface-dark">
           <div className="flex items-center">
             <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
             {!isCollapsed && (
                <div className="ml-3 flex-1">
                    <p className="font-semibold text-text-main dark:text-text-main-dark">{userName}</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">olivia@email.com</p>
                </div>
            )}
           </div>
           <button onClick={toggleCollapse} className={`w-full mt-4 flex items-center p-2 rounded-lg text-text-secondary dark:text-text-secondary-dark hover:bg-secondary dark:hover:bg-secondary-dark ${isCollapsed ? 'justify-center' : ''}`}>
               <ChevronDoubleLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
               {!isCollapsed && <span className="ml-2 text-sm font-semibold">{t('collapse')}</span>}
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface-dark border-t border-secondary dark:border-border-dark flex justify-around z-50">
          {mobileNavItems.map(item => (
              <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${ activeTab === item.tab ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark' }`}>
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{t(item.labelKey)}</span>
              </button>
          ))}
      </nav>
    </>
  );
};

export default Navigation;