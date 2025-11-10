import React from 'react';
import { Tab, Notification } from '../types';
import Notifications from './Notifications';

interface MobileHeaderProps {
  activeTab: Tab;
  t: (key: string) => string;
  notifications: Notification[];
  onAvatarClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ activeTab, t, notifications, onAvatarClick }) => {
    
    const titleKey = activeTab === 'dashboard' ? 'welcome_back_short' : activeTab;
    const title = activeTab === 'dashboard' ? `${t(titleKey)} Olivia!` : t(titleKey);

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-surface dark:bg-gray-900 h-16 px-4 flex justify-between items-center z-40 border-b border-secondary dark:border-gray-800">
             <h1 className="text-xl font-bold text-text-main dark:text-brand-white capitalize">
                {title}
             </h1>
            <div className="flex items-center space-x-2">
                <Notifications notifications={notifications} t={t} />
                <button onClick={onAvatarClick}>
                    <img 
                        src="https://i.pravatar.cc/40?u=a042581f4e29026704d" 
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full"
                    />
                </button>
            </div>
        </div>
    );
};

export default MobileHeader;