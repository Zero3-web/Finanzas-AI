import React, { useState } from 'react';
import Modal from './Modal';
import { MicIcon } from './icons'; // Assuming an icon for "ask"

interface FollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAsk: (question: string) => void;
    t: (key: string) => string;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ isOpen, onClose, onAsk, t }) => {
  const [question, setQuestion] = useState('');

  const handleAsk = () => {
    if (question.trim()) {
      onAsk(question);
      setQuestion('');
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleAsk();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('ask_follow_up')} variant="glass">
      <div className="space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('follow_up_placeholder')}
          className="w-full p-3 rounded-xl bg-white/10 dark:bg-black/20 text-text-main-dark placeholder-gray-400 border border-white/20 focus:ring-primary focus:border-primary"
          rows={4}
          autoFocus
        />
        <button 
          onClick={handleAsk} 
          className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2"
          disabled={!question.trim()}
        >
          <MicIcon className="w-5 h-5" />
          {t('ask')}
        </button>
      </div>
    </Modal>
  );
};

export default FollowUpModal;
