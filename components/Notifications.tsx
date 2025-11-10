import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';
import { BellIcon } from './icons';

interface NotificationsProps {
    notifications: Notification[];
    t: (key: string) => string;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="relative p-2 rounded-full text-text-secondary dark:text-gray-400 hover:bg-secondary dark:hover:bg-gray-700">
                <BellIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-secondary dark:border-gray-700">
                    <div className="p-4 border-b border-secondary dark:border-gray-700">
                        <h3 className="font-semibold text-text-main dark:text-gray-200">{t('notifications')}</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div key={notification.id} className="p-4 border-b border-secondary dark:border-gray-700 last:border-b-0 hover:bg-secondary dark:hover:bg-gray-700/50">
                                    <p className="font-medium text-text-main dark:text-gray-200">{notification.message}</p>
                                    <p className="text-sm text-text-secondary dark:text-gray-400">{t('date')}: {new Date(notification.dueDate).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-text-secondary dark:text-gray-400">
                                <p>{t('no_notifications')}</p>
                            </div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-2 border-t border-secondary dark:border-gray-700 text-center">
                            <button className="text-sm font-medium text-primary hover:underline">{t('view_all')}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
