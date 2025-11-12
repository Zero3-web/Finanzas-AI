import React, { useState } from 'react';
import { MicIcon, SparklesIcon, DocumentTextIcon } from './icons';

interface VoiceTourProps {
  isOpen: boolean;
  onFinish: () => void;
  t: (key: string) => string;
}

const VoiceTour: React.FC<VoiceTourProps> = ({ isOpen, onFinish, t }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="bg-primary/10 text-primary p-4 rounded-full inline-block mb-4 animate-fade-in">
                <MicIcon className="w-8 h-8"/>
            </div>
            <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>{t('voice_tour_step1_title')}</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark animate-fade-in" style={{ animationDelay: '0.2s' }}>{t('voice_tour_step1_desc')}</p>
          </div>
        );
      case 2:
        return (
            <div className="text-center">
                <div className="bg-primary/10 text-primary p-4 rounded-full inline-block mb-4">
                    <DocumentTextIcon className="w-8 h-8"/>
                </div>
                <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark mb-2">{t('voice_tour_step2_title')}</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-4">{t('voice_tour_step2_desc')}</p>
                <div className="bg-secondary dark:bg-secondary-dark p-3 rounded-lg">
                    <p className="text-primary font-semibold italic">"{t('voice_tour_step2_example')}"</p>
                </div>
            </div>
        );
      case 3:
        return (
            <div className="text-center">
                <div className="bg-primary/10 text-primary p-4 rounded-full inline-block mb-4">
                    <SparklesIcon className="w-8 h-8"/>
                </div>
                <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark mb-2">{t('voice_tour_step3_title')}</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t('voice_tour_step3_desc')}</p>
            </div>
        );
      case 4:
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-4">{t('voice_tour_ready')}</h2>
                <button onClick={onFinish} className="bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-lg w-full">
                    {t('voice_tour_finish')}
                </button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-in-fast">
      <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 transform transition-all duration-300 animate-modal-in">
        <div className="min-h-[200px] flex flex-col justify-center">
            {renderStepContent()}
        </div>
        
        <div className="mt-6">
            <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: totalSteps -1 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i + 1 === step ? 'bg-primary' : 'bg-secondary dark:bg-secondary-dark'}`}></div>
                ))}
            </div>
            { step < totalSteps && step < 4 && (
                <div className="flex items-center justify-end">
                    <button 
                        onClick={handleNext} 
                        className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded"
                    >
                        {t('tour_next')}
                    </button>
                </div>
            )}
        </div>
      </div>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }

        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
            opacity: 0;
        }
        @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VoiceTour;