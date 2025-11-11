import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  t: (key: string) => string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, t }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 animate-modal-in">
        <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                <svg className="h-6 w-6 text-expense" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark" id="modal-title">{title}</h3>
            <div className="mt-2">
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                    {message}
                </p>
            </div>
        </div>
        <div className="bg-secondary dark:bg-secondary-dark/50 px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-2xl">
            <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-expense text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                onClick={handleConfirm}
            >
                {t('delete')}
            </button>
            <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-border-dark shadow-sm px-4 py-2 bg-surface dark:bg-surface-dark text-base font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-secondary-dark sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                onClick={onClose}
            >
                {t('cancel')}
            </button>
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

export default ConfirmationModal;