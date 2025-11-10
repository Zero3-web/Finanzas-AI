import React from 'react';
import { Tab, Notification } from '../types';
import { HomeIcon, CardIcon, ScaleIcon, DocumentTextIcon, CogIcon, ChevronDoubleLeftIcon, ChartPieIcon } from './icons';
import Notifications from './Notifications';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  t: (key: string) => string;
  notifications: Notification[];
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isCollapsed, toggleCollapse, t, notifications }) => {
  
  const navItems: { tab: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'dashboard', labelKey: 'dashboard', icon: HomeIcon },
    { tab: 'accounts', labelKey: 'accounts', icon: CardIcon },
    { tab: 'debts', labelKey: 'debts', icon: ScaleIcon },
    { tab: 'history', labelKey: 'history', icon: DocumentTextIcon },
    { tab: 'analysis', labelKey: 'analysis', icon: ChartPieIcon },
    // { tab: 'calendar', labelKey: 'calendar', icon: CalendarIcon },
    { tab: 'settings', labelKey: 'settings', icon: CogIcon },
  ];

  const NavItem: React.FC<{
      item: typeof navItems[0],
      isActive: boolean,
      isCollapsed: boolean,
      onClick: () => void
  }> = ({ item, isActive, isCollapsed, onClick }) => (
       <li onClick={onClick} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${ isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary dark:text-gray-400 dark:hover:bg-gray-700' }`}>
          <item.icon className="w-6 h-6 shrink-0" />
          {!isCollapsed && <span className="ml-4 font-semibold transition-opacity duration-300">{t(item.labelKey)}</span>}
      </li>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-surface dark:bg-gray-900 text-text-main dark:text-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
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
        
        <div className="p-4 border-t border-secondary dark:border-gray-700">
           <div className="flex items-center">
             <img src="https://i.pravatar.cc/40?u=a042581f4e29026704d" alt="User Avatar" className="w-10 h-10 rounded-full" />
             {!isCollapsed && (
                <div className="ml-3 flex-1">
                    <p className="font-semibold">Olivia Rhye</p>
                    <p className="text-xs text-text-secondary dark:text-gray-400">olivia@email.com</p>
                </div>
            )}
             <Notifications notifications={notifications} t={t} />
           </div>
           <button onClick={toggleCollapse} className={`w-full mt-4 flex items-center p-2 rounded-lg text-text-secondary dark:text-gray-400 hover:bg-secondary dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}>
               <ChevronDoubleLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
               {!isCollapsed && <span className="ml-2 text-sm font-semibold">{t('collapse')}</span>}
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-gray-900 border-t border-secondary dark:border-gray-700 flex justify-around z-50">
          {navItems.map(item => (
              <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${ activeTab === item.tab ? 'text-primary' : 'text-text-secondary dark:text-gray-400' }`}>
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{t(item.labelKey)}</span>
              </button>
          ))}
      </nav>
    </>
  );
};

export default Navigation;
