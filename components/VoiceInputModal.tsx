import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Modal from './Modal';
import { Account, Transaction, TransactionType } from '../types';

// Audio generation utility
const playTone = (type: 'start' | 'success' | 'error') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    gainNode.connect(audioCtx.destination);
    oscillator.connect(gainNode);

    const now = audioCtx.currentTime;

    switch (type) {
        case 'start':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, now);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
        case 'success':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, now);
            gainNode.gain.setValueAtTime(0.1, now);
            oscillator.frequency.setValueAtTime(659.25, now + 0.1);
            oscillator.frequency.setValueAtTime(783.99, now + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            oscillator.start(now);
            oscillator.stop(now + 0.4);
            break;
        case 'error':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, now);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
    }
    setTimeout(() => audioCtx.close(), 500);
};

const FuturisticOrb: React.FC<{ status: 'idle' | 'recording' | 'processing' | 'success'; onClick: () => void }> = ({ status, onClick }) => {
    return (
        <div className="relative flex items-center justify-center w-32 h-32 cursor-pointer" onClick={onClick}>
            <div className={`orb-base ${status}`}>
                {status === 'success' && (
                     <svg className="w-12 h-12 text-white animate-checkmark" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <div className={`orb-ring one ${status}`}></div>
            <div className={`orb-ring two ${status}`}></div>
            <div className={`orb-ring three ${status}`}></div>
            {status === 'processing' && (
                <div className="absolute w-24 h-24 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
            )}
            <style>{`
                .orb-base {
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: rgb(var(--color-primary));
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 15px rgba(var(--color-primary), 0.7);
                }
                .orb-base.recording { transform: scale(0.8); }
                .orb-base.idle:hover { transform: scale(1.1); }
                .orb-base.success { transform: scale(1.1); background-color: #22c55e; box-shadow: 0 0 20px #22c55e; }

                .orb-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 2px solid rgba(var(--color-primary), 0.7);
                    transition: all 0.5s ease;
                }
                .orb-ring.success { display: none; }
                .orb-ring.idle { animation: pulse 2s infinite ease-out; }
                .orb-ring.one.idle { width: 90px; height: 90px; }
                .orb-ring.two.idle { width: 120px; height: 120px; animation-delay: 0.2s; }
                .orb-ring.three.idle { width: 150px; height: 150px; animation-delay: 0.4s; }
                .orb-ring.recording { animation: wave 1.5s infinite ease-in-out; }
                .orb-ring.one.recording { width: 70px; height: 70px; animation-delay: 0s; }
                .orb-ring.two.recording { width: 70px; height: 70px; animation-delay: 0.5s; }
                .orb-ring.three.recording { width: 70px; height: 70px; animation-delay: 1s; }
                .orb-base.processing { animation: processing-pulse 1.5s infinite ease-in-out; }

                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
                @keyframes wave {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes processing-pulse {
                    0% { transform: scale(1); box-shadow: 0 0 15px rgba(var(--color-primary), 0.7); }
                    50% { transform: scale(1.1); box-shadow: 0 0 25px rgba(var(--color-primary), 1); }
                    100% { transform: scale(1); box-shadow: 0 0 15px rgba(var(--color-primary), 0.7); }
                }
                @keyframes checkmark {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-checkmark {
                    animation: checkmark 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

interface VoiceInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    accounts: Account[];
    t: (key: string) => string;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onClose, onAddTransaction, accounts, t }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const recognitionRef = useRef<any | null>(null);
    
    const resetState = () => {
        setIsRecording(false);
        setIsProcessing(false);
        setIsSuccess(false);
        setTranscript('');
        setError('');
    }

    useEffect(() => {
        if (!isOpen) {
            stopRecording(true);
            resetState();
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const currentTranscript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                setTranscript(currentTranscript);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setError(t('voice_input_error'));
                playTone('error');
                setIsRecording(false);
            };
        }
    }, [isOpen, t]);

    const startRecording = () => {
        if (recognitionRef.current && !isProcessing && !isSuccess) {
            playTone('start');
            setTranscript('');
            setError('');
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const stopRecording = (isClosing = false) => {
        if (recognitionRef.current && (isRecording || isClosing)) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };
    
    useEffect(() => {
        if (!isRecording && transcript && !isProcessing && !isSuccess && isOpen) {
            processTranscript(transcript);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording, transcript, isOpen]);


    const processTranscript = async (text: string) => {
        if (!text.trim()) return;
        
        setIsProcessing(true);
        setError('');

        if (accounts.length === 0) {
            setError(t('no_accounts_error'));
            playTone('error');
            setIsProcessing(false);
            return;
        }
        
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

            const transactionSchema = {
                type: Type.OBJECT,
                properties: {
                    amount: { type: Type.NUMBER, description: 'The transaction amount as a positive number.' },
                    description: { type: Type.STRING, description: 'A brief description of the transaction.' },
                    category: { type: Type.STRING, description: `The category of the transaction. Must be one of: 'Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Salary', 'Freelance', 'Gifts', 'Investments', 'Other'.` },
                    type: { type: Type.STRING, enum: ['income', 'expense'], description: 'The type of transaction.' },
                    date: { type: Type.STRING, description: 'The date of the transaction in YYYY-MM-DD format.' },
                    accountNameHint: { type: Type.STRING, description: 'A hint for which account was used, taken from the text, e.g., "credit card", "checking", or an actual account name.' }
                },
                required: ['amount', 'description', 'category', 'type', 'date']
            };

            const accountNamesString = accounts.map(a => a.name).join(', ');
            const prompt = `Parse the following user voice command to extract transaction details: "${text}". Today's date is ${new Date().toISOString().split('T')[0]}. If the year is not specified, assume the current year. Your response must be a JSON object matching the provided schema. The user's available accounts are: ${accountNamesString}.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: transactionSchema,
                },
            });
            
            const jsonText = response.text.trim();
            const parsed = JSON.parse(jsonText);

            let accountId: string | undefined;
            if (parsed.accountNameHint && accounts.length > 0) {
                const hint = parsed.accountNameHint.toLowerCase();
                const foundAccount = accounts.find(acc => acc.name.toLowerCase().includes(hint) || hint.includes(acc.name.toLowerCase()));
                accountId = foundAccount?.id;
            }

            if (!accountId && accounts.length > 0) {
                accountId = accounts[0].id;
            }

            if (accountId) {
                const newTransaction: Omit<Transaction, 'id'> = {
                    accountId,
                    amount: parsed.amount,
                    description: parsed.description,
                    category: parsed.category,
                    type: parsed.type as TransactionType,
                    date: parsed.date,
                };
                playTone('success');
                setIsSuccess(true);
                setTimeout(() => {
                    onAddTransaction(newTransaction);
                    onClose();
                }, 1500);

            } else {
                setError(t('no_accounts_error'));
                playTone('error');
            }

        } catch (e) {
            console.error('Error processing voice input with Gemini:', e);
            setError(t('voice_input_error'));
            playTone('error');
        } finally {
            setIsProcessing(false);
            setTranscript('');
        }
    };

    const handleClose = () => {
        stopRecording(true);
        onClose();
    }

    const getStatus = (): 'idle' | 'recording' | 'processing' | 'success' => {
        if (isSuccess) return 'success';
        if (isProcessing) return 'processing';
        if (isRecording) return 'recording';
        return 'idle';
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('voice_input_title')} variant="glass">
            <div className="flex flex-col items-center justify-center space-y-6 p-4 min-h-[250px]">
                
                <FuturisticOrb status={getStatus()} onClick={isRecording ? () => stopRecording() : startRecording} />

                <div className="text-center h-12">
                    {isSuccess ? (
                        <p className="text-white/90 font-semibold">{t('transaction_added')}</p>
                    ) : isProcessing ? (
                        <p className="text-white/70 animate-pulse">{t('voice_input_processing')}</p>
                    ) : isRecording ? (
                        <p className="text-white/70 animate-pulse">{t('voice_input_listening')}</p>
                    ) : transcript ? (
                        <p className="text-white/90 italic">"{transcript}"</p>
                    ) : error ? (
                        <p className="text-red-400">{error}</p>
                    ) : (
                         <p className="text-white/70">{t('voice_input_prompt')}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default VoiceInputModal;