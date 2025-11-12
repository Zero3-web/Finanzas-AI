import React, { useState } from 'react';
import { ColorTheme, Language, Account, Transaction, Debt, Theme } from '../types';
import { themes } from '../hooks/useColorTheme';
import useLocalStorage from '../hooks/useLocalStorage';
import Card from '../components/Card';
import AvatarGrid from '../components/AvatarGrid';
import ThemeToggle from '../components/ThemeToggle';
import Modal from '../components/Modal';
import Switch from '../components/Switch';

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
  userName: string;
  setUserName: (name: string) => void;
  t: (key: string) => string;
  accounts: Account[]; // for data management
  transactions: Transaction[]; // for data management
  debts: Debt[]; // for data management
}

const Settings: React.FC<SettingsProps> = ({
  theme,
  toggleTheme,
  currency,
  setCurrency,
  language,
  setLanguage,
  colorTheme,
  setColorTheme,
  avatar,
  setAvatar,
  userName,
  setUserName,
  t,
}) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCoupleMode, setIsCoupleMode] = useLocalStorage('couple-mode-enabled', false);

  const themeOptions = Object.keys(themes) as ColorTheme[];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];
  const inputClasses = "w-full mt-1 block bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

  const handleAvatarSelect = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    setIsAvatarModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('settings')}</h1>

      {/* Profile Section */}
      <Card>
        <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('profile')}</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <img src={avatar} alt="User Avatar" className="w-16 h-16 rounded-full" />
            <button onClick={() => setIsAvatarModalOpen(true)} className="bg-secondary dark:bg-secondary-dark text-text-main dark:text-text-main-dark font-bold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors">
              {t('change_avatar')}
            </button>
          </div>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('your_name')}</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </Card>
      
      {/* Couple Mode Section */}
      <Card>
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('couple_mode')}</h2>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">{t('couple_mode_desc')}</p>
            </div>
            <Switch
                id="couple-mode-switch"
                checked={isCoupleMode}
                onChange={setIsCoupleMode}
            />
        </div>
      </Card>


      {/* Appearance Section */}
      <Card>
        <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('appearance')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block font-medium text-text-main dark:text-text-main-dark">{t('theme')}</label>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
          <div>
            <label className="block font-medium text-text-main dark:text-text-main-dark mb-2">{t('color_theme')}</label>
            <div className="flex flex-wrap gap-4">
              {themeOptions.map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setColorTheme(themeName)}
                  className={`p-2 rounded-lg border-2 ${colorTheme === themeName ? 'border-primary' : 'border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `rgb(${themes[themeName]['--color-primary']})` }}></div>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `rgb(${themes[themeName]['--color-accent']})` }}></div>
                    <span className="capitalize ml-1 text-text-main dark:text-text-main-dark">{t(`${themeName}_theme`)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Regional Section */}
      <Card>
        <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('regional')}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="currency-settings" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('currency')}</label>
            <select id="currency-settings" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="language-settings" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('language')}</label>
            <select id="language-settings" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className={inputClasses}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </Card>

      <Modal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} title={t('change_avatar')}>
          <AvatarGrid selectedAvatar={avatar} onSelectAvatar={handleAvatarSelect} />
      </Modal>
    </div>
  );
};

export default Settings;