import React from 'react';
import { Theme } from '../hooks/useTheme';
import { themes } from '../hooks/useColorTheme';
import ThemeToggle from '../components/ThemeToggle';
import Card from '../components/Card';
import AvatarGrid from '../components/AvatarGrid';
import { Language, ColorTheme } from '../types';

interface SettingsProps {
  theme: Theme;
  toggleTheme: () => void;
  currency: string;
  setCurrency: (currency: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  avatar: string;
  setAvatar: (avatarUrl: string) => void;
  t: (key: string) => string;
}

const Settings: React.FC<SettingsProps> = ({ theme, toggleTheme, currency, setCurrency, language, setLanguage, colorTheme, setColorTheme, avatar, setAvatar, t }) => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];

  const inputClasses = "mt-1 block bg-secondary dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main dark:text-gray-100 p-2";

  const themeOptions = Object.keys(themes) as ColorTheme[];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text-main dark:text-brand-white">{t('settings')}</h1>

      <Card>
        <h2 className="text-xl font-bold mb-4 text-text-main dark:text-brand-white">{t('profile')}</h2>
        <AvatarGrid selectedAvatar={avatar} onSelectAvatar={setAvatar} />
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold mb-4 text-text-main dark:text-brand-white">{t('appearance')}</h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-text-secondary dark:text-gray-400">{t('theme')}</span>
                <div className="flex items-center space-x-2">
                    <span className="text-sm capitalize text-text-main dark:text-gray-300">{t(theme)}</span>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
            <div>
                <span className="block text-text-secondary dark:text-gray-400 mb-2">{t('color_theme')}</span>
                <div className="flex flex-wrap gap-4">
                    {themeOptions.map((themeName) => (
                         <button key={themeName} onClick={() => setColorTheme(themeName)} className={`p-2 rounded-lg border-2 ${colorTheme === themeName ? 'border-primary' : 'border-transparent'}`}>
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `rgb(${themes[themeName]['--color-primary']})`}}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `rgb(${themes[themeName]['--color-accent']})`}}></div>
                                <span className="capitalize ml-1 text-text-main dark:text-gray-300">{t(`${themeName}_theme`)}</span>
                             </div>
                         </button>
                    ))}
                </div>
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