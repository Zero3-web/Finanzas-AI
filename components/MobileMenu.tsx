import React from 'react';
import { Tab } from '../types';
import { ScaleIcon, CogIcon, CollectionIcon, XIcon, CardIcon } from './icons';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: Tab) => void;
  t: (key: string) => string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, setActiveTab, t }) => {
  if (!isOpen) return null;

  const menuItems: { tab: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'accounts', labelKey: 'accounts', icon: CardIcon },
    { tab: 'debts', labelKey: 'debts', icon: ScaleIcon },
    { tab: 'subscriptions', labelKey: 'subscriptions', icon: CollectionIcon },
    { tab: 'settings', labelKey: 'settings', icon: CogIcon },
  ];
  
  const handleItemClick = (tab: Tab) => {
      setActiveTab(tab);
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={onClose}>
        <div className="fixed inset-0 bg-background dark:bg-brand-black p-6 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <img src="https://i.pravatar.cc/40?u=a042581f4e29026704d" alt="User Avatar" className="w-12 h-12 rounded-full" />
                    <div className="ml-4">
                        <p className="font-semibold text-lg">Olivia Rhye</p>
                        <p className="text-sm text-text-secondary dark:text-gray-400">olivia@email.com</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2">
                    <XIcon className="w-6 h-6 text-text-secondary dark:text-gray-400"/>
                </button>
            </div>

            <nav>
                <ul className="space-y-4">
                    {menuItems.map(item => (
                         <li key={item.tab} onClick={() => handleItemClick(item.tab)} className="flex items-center p-4 rounded-lg cursor-pointer text-text-secondary dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-800">
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