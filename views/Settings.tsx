import React from 'react';
import { Theme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import Card from '../components/Card';
import { Language } from '../types';

interface SettingsProps {
  theme: Theme;
  toggleTheme: () => void;
  currency: string;
  setCurrency: (currency: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const Settings: React.FC<SettingsProps> = ({ theme, toggleTheme, currency, setCurrency, language, setLanguage, t }) => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];

  const inputClasses = "mt-1 block bg-secondary dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main dark:text-gray-100 p-2";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text-main dark:text-brand-white">{t('settings')}</h1>

      <Card>
        <h2 className="text-xl font-bold mb-4 text-text-main dark:text-brand-white">{t('appearance')}</h2>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary dark:text-gray-400">{t('theme')}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm capitalize text-text-main dark:text-gray-300">{t(theme)}</span>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold mb-4 text-text-main dark:text-brand-white">{t('regional')}</h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label htmlFor="currency" className="text-text-secondary dark:text-gray-400">{t('currency')}</label>
                <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
             <div className="flex items-center justify-between">
                <label htmlFor="language" className="text-text-secondary dark:text-gray-400">{t('language')}</label>
                <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className={inputClasses}>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
            </div>
        </div>
      </Card>

    </div>
  );
};

export default Settings;