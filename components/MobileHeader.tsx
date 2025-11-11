import React from 'react';
import { Tab, Notification } from '../types';
import Notifications from './Notifications';

interface MobileHeaderProps {
  activeTab: Tab;
  t: (key: string) => string;
  notifications: Notification[];
  onAvatarClick: () => void;
  userName: string;
  avatar: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ activeTab, t, notifications, onAvatarClick, userName, avatar }) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-background/80 dark:bg-background-dark/80 backdrop-blur-sm h-16 px-4 flex justify-between items-center z-40 border-b border-secondary dark:border-border-dark">
      <div>
        <h1 className="text-xl font-bold text-text-main dark:text-text-main-dark capitalize">{t(activeTab)}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Notifications notifications={notifications} t={t} />
        <button onClick={onAvatarClick}>
          <img src={avatar} alt={userName} className="w-9 h-9 rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;