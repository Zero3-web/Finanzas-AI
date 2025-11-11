import React from 'react';
import { Tab } from '../types';
import { ScaleIcon, CogIcon, CollectionIcon, XIcon, CardIcon, ShieldCheckIcon, DocumentArrowDownIcon } from './icons';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: Tab) => void;
  t: (key: string) => string;
  userName: string;
  avatar: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, setActiveTab, t, userName, avatar }) => {
  if (!isOpen) return null;

  const menuItems: { tab: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'accounts', labelKey: 'accounts', icon: CardIcon },
    { tab: 'debts', labelKey: 'debts', icon: ScaleIcon },
    { tab: 'subscriptions', labelKey: 'subscriptions', icon: CollectionIcon },
    { tab: 'limits', labelKey: 'limits', icon: ShieldCheckIcon },
    { tab: 'export', labelKey: 'analysis_export', icon: DocumentArrowDownIcon },
    { tab: 'settings', labelKey: 'settings', icon: CogIcon },
  ];
  
  const handleItemClick = (tab: Tab) => {
      setActiveTab(tab);
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={onClose}>
        <div className="fixed inset-0 bg-background dark:bg-surface-dark p-6 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <img src={avatar} alt="User Avatar" className="w-12 h-12 rounded-full" />
                    <div className="ml-4">
                        <p className="font-semibold text-lg">{userName}</p>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">olivia@email.com</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2">
                    <XIcon className="w-6 h-6 text-text-secondary dark:text-text-secondary-dark"/>
                </button>
            </div>

            <nav>
                <ul className="space-y-4">
                    {menuItems.map(item => (
                         <li key={item.tab} onClick={() => handleItemClick(item.tab)} className="flex items-center p-4 rounded-lg cursor-pointer text-text-secondary dark:text-text-secondary-dark hover:bg-secondary dark:hover:bg-secondary-dark">
                           <item.icon className="w-6 h-6 shrink-0 mr-4 text-primary" />
                           <span className="text-lg font-semibold">{t(item.labelKey)}</span>
                       </li>
                    ))}
                </ul>
            </nav>
             <style>{`
                @keyframes slide-in {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    </div>
  );
};

export default MobileMenu;