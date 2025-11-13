import React, { useState } from 'react';
import Modal from './Modal';
import { CoupleLink } from '../types';
import { LinkIcon, QrCodeIcon } from './icons';

interface CoupleModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string, params?: { [key: string]: string | number }) => string;
    coupleLink: CoupleLink;
    setCoupleLink: (link: CoupleLink) => void;
}

const CoupleModeModal: React.FC<CoupleModeModalProps> = ({ isOpen, onClose, t, coupleLink, setCoupleLink }) => {
    const [partnerId, setPartnerId] = useState('');

    const handleGenerateId = () => {
        const newId = `flowvixtrack-link-${Math.random().toString(36).substr(2, 9)}`;
        setCoupleLink({ ...coupleLink, linkId: newId });
    };

    const handleCopyId = () => {
        if (coupleLink.linkId) {
            navigator.clipboard.writeText(coupleLink.linkId);
            alert('Copied to clipboard!'); // Simple feedback
        }
    };

    const handleLink = () => {
        if (partnerId.trim()) {
            // In a real app, this would involve a backend call to verify the ID and link accounts.
            // For this demo, we'll simulate a successful link.
            setCoupleLink({
                linked: true,
                partnerName: 'Partner', // Simulated name
                linkId: coupleLink.linkId,
            });
            onClose();
        }
    };

    const handleUnlink = () => {
        if (window.confirm(t('confirm_unlink'))) {
            setCoupleLink({
                linked: false,
                partnerName: null,
                linkId: coupleLink.linkId, // Keep their own link ID
            });
        }
    };

    const modalTitle = (
        <div className="flex items-center gap-2">
            <span>{t('couple_mode_title')}</span>
            <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('beta')}</span>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <div className="space-y-4">
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('couple_mode_desc')}</p>
                
                {coupleLink.linked ? (
                    <div>
                        <p className="text-center font-semibold text-income">{t('linked_with', { name: coupleLink.partnerName || 'Partner' })}</p>
                        <button onClick={handleUnlink} className="mt-4 w-full bg-expense text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm">
                            {t('unlink_account')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 pt-2">
                        {/* Generate Own ID */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-text-main dark:text-text-main-dark">1. {t('generate_your_id')}</h3>
                            {coupleLink.linkId ? (
                                <div className="flex items-center gap-2">
                                    <input type="text" value={coupleLink.linkId} readOnly className="flex-grow bg-secondary dark:bg-secondary-dark p-2 rounded-md text-sm" />
                                    <button onClick={handleCopyId} className="bg-primary text-white font-bold py-2 px-3 rounded-lg hover:bg-primary-focus transition-colors text-sm">{t('copy')}</button>
                                </div>
                            ) : (
                                <button onClick={handleGenerateId} className="w-full flex items-center justify-center gap-2 bg-secondary dark:bg-secondary-dark font-bold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors text-sm">
                                    <QrCodeIcon className="w-5 h-5" />
                                    {t('generate_your_id')}
                                </button>
                            )}
                        </div>
                        {/* Link with Partner */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-text-main dark:text-text-main-dark">2. {t('enter_partner_id')}</h3>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={partnerId}
                                    onChange={(e) => setPartnerId(e.target.value)}
                                    placeholder="partner-link-id..."
                                    className="flex-grow bg-secondary dark:bg-secondary-dark p-2 rounded-md text-sm" 
                                />
                            </div>
                            <button onClick={handleLink} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors text-sm disabled:bg-gray-400" disabled={!partnerId.trim()}>
                                <LinkIcon className="w-5 h-5" />
                                {t('link_account')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CoupleModeModal;