import React, { useState } from 'react';
import { Account, ColorTheme, Language } from '../types';
import { themes } from '../hooks/useColorTheme';
import AccountForm from './AccountForm';
import AvatarGrid from './AvatarGrid';
import { ChartPieIcon, PlusIcon, ScaleIcon } from './icons';

interface OnboardingTourProps {
  onFinish: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  t: (key: string) => string;
  language: Language;
  setLanguage: (language: Language) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  avatar: string;
  setAvatar: (avatarUrl: string) => void;
}

const AnimatedWelcomeText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <p className="text-text-secondary dark:text-text-secondary-dark">
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </p>
    );
};

const OnboardingTour: React.FC<OnboardingTourProps> = ({ 
    onFinish, 
    colorTheme, 
    setColorTheme, 
    onAddAccount, 
    t, 
    language, 
    setLanguage, 
    currency, 
    setCurrency,
    userName,
    setUserName,
    avatar,
    setAvatar,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleAccountAdded = () => {
    handleNext();
  };
  
  const themeOptions = Object.keys(themes) as ColorTheme[];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];
  const inputClasses = "w-full mt-1 block bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";


  const renderStepContent = () => {
    switch (step) {
      case 1: // Welcome
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2 animate-fade-in">
                <span className="shimmer-text-anim">{t('tour_welcome_title')}</span>
            </h2>
            <AnimatedWelcomeText text={t('tour_welcome_desc')} />
          </div>
        );
      case 2: // Regional Settings
        return (
            <div>
              <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2 text-center">{t('tour_regional_title')}</h2>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-6 text-center">{t('tour_regional_desc')}</p>
              <div className="space-y-4 max-w-xs mx-auto">
                <div>
                  <label htmlFor="language-tour" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('language')}</label>
                  <select id="language-tour" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className={inputClasses}>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="currency-tour" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('currency')}</label>
                  <select id="currency-tour" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
                      {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
        );
      case 3: // User Name
        return (
          <div>
            <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2 text-center">{t('tour_name_title')}</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6 text-center">{t('tour_name_desc')}</p>
            <div className="max-w-xs mx-auto">
                <label htmlFor="name-tour" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark sr-only">{t('tour_name_placeholder')}</label>
                <input
                    id="name-tour"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={t('tour_name_placeholder')}
                    className={`${inputClasses} text-center`}
                    autoFocus
                />
            </div>
          </div>
        );
      case 4: // Avatar Selection
        return (
          <div>
            <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2 text-center">{t('tour_avatar_title')}</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6 text-center">{t('tour_avatar_desc')}</p>
            <div className="max-w-xs mx-auto">
                <AvatarGrid selectedAvatar={avatar} onSelectAvatar={setAvatar} />
            </div>
          </div>
        );
      case 5: // Theme Selection
        return (
          <div>
            <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2 text-center">{t('tour_theme_title')}</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6 text-center">{t('tour_theme_desc')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
                {themeOptions.map((themeName) => (
                    <button key={themeName} onClick={() => setColorTheme(themeName)} className={`p-2 rounded-lg border-2 ${colorTheme === themeName ? 'border-primary' : 'border-transparent'}`}>
                        <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `rgb(${themes[themeName]['--color-primary']})`}}></div>
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `rgb(${themes[themeName]['--color-accent']})`}}></div>
                        <span className="capitalize ml-1 text-text-main dark:text-text-main-dark">{t(`${themeName}_theme`)}</span>
                        </div>
                    </button>
                ))}
            </div>
          </div>
        );
      case 6: // Add Account
        return (
            <div>
                <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2 text-center">{t('tour_account_title')}</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-6 text-center">{t('tour_account_desc')}</p>
                <div className="max-h-[50vh] overflow-y-auto px-2">
                   <AccountForm 
                        onAddAccount={onAddAccount} 
                        onUpdateAccount={() => {}} // Not used in tour
                        onClose={() => {}} // No close button in tour
                        t={t}
                        onSuccess={handleAccountAdded}
                        primaryCurrency={currency}
                    />
                </div>
            </div>
        );
      case 7: // Tips
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2">{t('tour_tips_title')}</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-8">{t('tour_tips_desc')}</p>
                <ul className="space-y-4 text-left">
                    <li className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full"><PlusIcon className="w-6 h-6"/></div>
                        <span className="text-text-main dark:text-text-main-dark">{t('tour_tip_1')}</span>
                    </li>
                    <li className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full"><ScaleIcon className="w-6 h-6"/></div>
                        <span className="text-text-main dark:text-text-main-dark">{t('tour_tip_2')}</span>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full"><ChartPieIcon className="w-6 h-6"/></div>
                        <span className="text-text-main dark:text-text-main-dark">{t('tour_tip_3')}</span>
                    </li>
                </ul>
            </div>
        );
      default:
        return null;
    }
  };
  
  const isNextDisabled = step === 3 && !userName.trim();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg m-4 p-8 transform transition-all duration-300 animate-modal-in">
        <div className="min-h-[250px] flex flex-col justify-center">
            {renderStepContent()}
        </div>
        
        {/* Navigation & Progress */}
        <div className="mt-8">
            <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i + 1 === step ? 'bg-primary' : 'bg-secondary dark:bg-secondary-dark'}`}></div>
                ))}
            </div>
            { step !== 6 && (
                <div className="flex items-center justify-between">
                <button 
                    onClick={handleBack} 
                    className={`font-bold py-2 px-4 rounded transition-opacity ${step === 1 ? 'opacity-0 cursor-default' : 'hover:bg-secondary dark:hover:bg-secondary-dark'}`}
                    disabled={step === 1}
                >
                    {t('tour_back')}
                </button>
                {step < totalSteps ? (
                    <button 
                        onClick={handleNext} 
                        disabled={isNextDisabled}
                        className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {t('tour_next')}
                    </button>
                ) : (
                    <button onClick={onFinish} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">
                        {t('tour_finish')}
                    </button>
                )}
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
            animation: fade-in 0.6s ease-out forwards;
        }

        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(1em);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            display: inline-block;
            opacity: 0;
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OnboardingTour;