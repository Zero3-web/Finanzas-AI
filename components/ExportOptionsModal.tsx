import React from 'react';
import Modal from './Modal';
import { Account } from '../types';
import { CardIcon, CollectionIcon } from './icons';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onExport: (accountId: string | null) => void;
  t: (key: string) => string;
}

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ isOpen, onClose, accounts, onExport, t }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('export_options_title')}>
      <div className="space-y-4">
        <p className="text-text-secondary dark:text-text-secondary-dark">{t('export_options_prompt')}</p>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          <button
            onClick={() => onExport(null)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary dark:bg-secondary-dark hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors text-left"
          >
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <CollectionIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-text-main dark:text-text-main-dark">{t('all_accounts')}</span>
          </button>
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => onExport(account.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary dark:bg-secondary-dark hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors text-left"
            >
             <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <CardIcon className="w-6 h-6" />
            </div>
              <div>
                <p className="font-semibold text-text-main dark:text-text-main-dark">{account.name}</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{account.currency}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ExportOptionsModal;
