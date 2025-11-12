import React, { ReactNode } from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'glass';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, variant = 'default' }) => {
  if (!isOpen) return null;

  const isGlass = variant === 'glass';

  const modalContainerClasses = isGlass
    ? 'bg-white/10 dark:bg-surface-dark/50 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl'
    : 'bg-surface dark:bg-surface-dark rounded-lg shadow-xl';

  const headerClasses = isGlass
    ? 'border-b border-white/10'
    : 'border-b border-secondary dark:border-border-dark';
  
  const titleClasses = isGlass
    ? 'text-white/90'
    : 'text-text-main dark:text-text-main-dark';

  const closeButtonClasses = isGlass
    ? 'text-white/70 hover:text-white'
    : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-main dark:hover:text-text-main-dark';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className={`w-full max-w-md m-4 transform transition-all duration-300 scale-95 animate-modal-in ${modalContainerClasses}`}>
        <div className={`flex justify-between items-center p-4 ${headerClasses}`}>
          <h2 className={`text-xl font-semibold ${titleClasses}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`${closeButtonClasses} transition-colors`}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Modal;