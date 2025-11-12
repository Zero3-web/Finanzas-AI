import React, { useState } from 'react';
import { Account, ColorTheme, CoupleLink, Debt, Language, Tab, Theme, Transaction } from '../types';
import { themes } from '../hooks/useColorTheme';
import Card from '../components/Card';
import AvatarGrid from '../components/AvatarGrid';
import Switch from '../components/Switch';
import CoupleModeModal from '../components/CoupleModeModal';

interface SettingsProps {
    theme: Theme;
    toggleTheme: () => void;
    currency: string;
    setCurrency: (c: string) => void;
    language: Language;
    setLanguage: (l: Language) => void;
    colorTheme: ColorTheme;
    setColorTheme: (t: ColorTheme) => void;
    avatar: string;
    setAvatar: (a: string) => void;
    userName: string;
    setUserName: (n: string) => void;
    t: (key: string) => string;
    accounts: Account[];
    transactions: Transaction[];
    debts: Debt[];
    coupleLink: CoupleLink;
    setCoupleLink: (l: CoupleLink) => void;
    onOpenModal: (modal: string) => void;
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
    coupleLink,
    setCoupleLink,
}) => {
    const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false);
    
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'PEN', 'MXN'];
    const themeOptions = Object.keys(themes) as ColorTheme[];
    const inputClasses = "w-full mt-1 block bg-secondary dark:bg-secondary-dark border-transparent focus:border-primary focus:ring-primary text-text-main dark:text-text-main-dark p-2 rounded-md";

    const handleClearData = () => {
        if (window.confirm(t('confirm_clear_data'))) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('settings')}</h1>

            {/* Profile Section */}
            <Card>
                <h2 className="text-xl font-bold mb-4">{t('profile')}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('name')}</label>
                        <input id="userName" type="text" value={userName} onChange={e => setUserName(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('avatar')}</label>
                        <div className="mt-2">
                            <AvatarGrid selectedAvatar={avatar} onSelectAvatar={setAvatar} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Appearance Section */}
            <Card>
                <h2 className="text-xl font-bold mb-4">{t('appearance')}</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="darkMode" className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('dark_mode')}</label>
                        <Switch id="darkMode" checked={theme === 'dark'} onChange={(checked) => toggleTheme()} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">{t('color_theme')}</label>
                        <div className="flex flex-wrap gap-3">
                            {themeOptions.map((themeName) => (
                                <button key={themeName} onClick={() => setColorTheme(themeName)} className={`p-2 rounded-lg border-2 ${colorTheme === themeName ? 'border-primary' : 'border-transparent'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `rgb(${themes[themeName]['--color-primary']})`}}></div>
                                        <span className="capitalize text-sm text-text-main dark:text-text-main-dark">{t(`${themeName}_theme`)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Regional Section */}
            <Card>
                <h2 className="text-xl font-bold mb-4">{t('regional')}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('language')}</label>
                        <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className={inputClasses}>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{t('primary_currency')}</label>
                        <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClasses}>
                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

             {/* Couple Mode Section */}
            <Card>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>{t('couple_mode')}</span>
                    <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('beta')}</span>
                </h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-main dark:text-text-main-dark">{t('sync_with_partner')}</p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{coupleLink.linked ? t('linked_with', { name: coupleLink.partnerName }) : t('not_linked')}</p>
                    </div>
                    <button onClick={() => setIsCoupleModalOpen(true)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors text-sm">
                        {t('manage')}
                    </button>
                </div>
            </Card>

            {/* Data Management Section */}
            <Card>
                 <h2 className="text-xl font-bold mb-4">{t('data_management')}</h2>
                 <div className="space-y-3">
                     <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('data_management_desc')}</p>
                     <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button onClick={handleClearData} className="w-full sm:w-auto bg-expense text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm">
                            {t('clear_all_data')}
                        </button>
                     </div>
                 </div>
            </Card>
            
            <CoupleModeModal 
                isOpen={isCoupleModalOpen}
                onClose={() => setIsCoupleModalOpen(false)}
                t={t}
                coupleLink={coupleLink}
                setCoupleLink={setCoupleLink}
            />
        </div>
    );
};

export default Settings;