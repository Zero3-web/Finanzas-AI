import React, { useEffect, useState } from 'react';

type IslandStatus = 'processing' | 'success' | 'error';

interface DynamicIslandProps {
  isOpen: boolean;
  status: IslandStatus;
  message?: string;
  onClose: () => void;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ isOpen, status, message, onClose }) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        } else {
            // Wait for animation out before unmounting
            const timer = setTimeout(() => setIsRendered(false), 300); 
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        // Auto-close after showing the final result
        if (status === 'success' || status === 'error') {
            const timer = setTimeout(onClose, 2500); 
            return () => clearTimeout(timer);
        }
    }, [status, onClose]);
    
    if (!isRendered) return null;

    const getIcon = () => {
        switch (status) {
            case 'processing':
                return <div className="w-5 h-5 border-2 border-t-white border-transparent rounded-full animate-spin"></div>;
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

    const islandWidth = status === 'processing' ? 'w-64' : 'w-72';

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
            <div className={`flex items-center justify-center gap-3 h-12 px-4 bg-black/90 dark:bg-zinc-800/90 text-white rounded-full shadow-2xl transition-all duration-300 ease-in-out ${islandWidth}`}>
                <div className="flex-shrink-0">{getIcon()}</div>
                <p className="font-semibold text-sm truncate">{getMessage()}</p>
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