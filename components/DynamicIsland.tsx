import React, { useEffect, useState, useRef } from 'react';

type IslandStatus = 'processing' | 'success' | 'error';

interface DynamicIslandProps {
  isOpen: boolean;
  status: IslandStatus;
  message?: string;
  onClose: () => void;
  showActions?: boolean;
  onUndo?: () => void;
  onEdit?: () => void;
  t: (key: string) => string;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ isOpen, status, message, onClose, showActions, onUndo, onEdit, t }) => {
    const [isRendered, setIsRendered] = useState(false);
    const closeTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }

        if (isOpen) {
            setIsRendered(true);
            const duration = showActions ? 7000 : 2500;
            closeTimerRef.current = window.setTimeout(onClose, duration);
        } else {
            const timer = setTimeout(() => setIsRendered(false), 300);
            return () => clearTimeout(timer);
        }

        return () => {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, [isOpen, showActions, message, onClose]);

    if (!isRendered) return null;

    const getIcon = () => {
        switch (status) {
            case 'processing':
                return <div className="w-5 h-5 border-2 border-t-white dark:border-t-black border-transparent rounded-full animate-spin"></div>;
            case 'success':
                return (
                    <div className="animate-checkmark-pop">
                        <svg className="w-6 h-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'error':
                 return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 );
        }
    }

    const getMessage = () => {
        if (message) return message;
        switch(status) {
            case 'processing': return "Processing...";
            case 'success': return "Transaction Added!";
            case 'error': return "An error occurred.";
        }
    }
    
    const shouldShowActions = status === 'success' && showActions && onUndo && onEdit;
    const islandWidthClass = shouldShowActions ? 'w-auto' : 'w-72';

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
            <div className={`flex items-center justify-between h-12 px-4 bg-black/90 text-white dark:bg-gray-100 dark:text-black rounded-full shadow-2xl transition-all duration-300 ease-in-out ${islandWidthClass}`}>
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{getIcon()}</div>
                    <p className="font-semibold text-sm truncate">{getMessage()}</p>
                </div>
                {shouldShowActions && (
                    <div className="flex items-center gap-2 ml-4 border-l border-white/20 pl-3">
                        <button onClick={onUndo} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">{t('undo')}</button>
                        <button onClick={onEdit} className="text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">{t('edit')}</button>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes checkmark-pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .animate-checkmark-pop { animation: checkmark-pop 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default DynamicIsland;