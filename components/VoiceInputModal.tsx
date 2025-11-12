import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { playTone } from '../utils/audio';
// FIX: Imported the missing XIcon component.
import { XIcon } from './icons';
import { Language } from '../types';

type Status = 'idle' | 'recording' | 'transitioning';

const FuturisticOrb: React.FC<{ status: Status; onClick: () => void }> = ({ status, onClick }) => {
    return (
        <div className="relative flex items-center justify-center w-32 h-32 cursor-pointer" onClick={onClick}>
            <div className={`orb-base ${status}`}></div>
            <div className={`orb-ring one ${status}`}></div>
            <div className={`orb-ring two ${status}`}></div>
            <div className={`orb-ring three ${status}`}></div>
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

                .orb-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 2px solid rgba(var(--color-primary), 0.7);
                    transition: all 0.5s ease;
                }
                .orb-ring.idle { animation: pulse 2s infinite ease-out; }
                .orb-ring.one.idle { width: 90px; height: 90px; }
                .orb-ring.two.idle { width: 120px; height: 120px; animation-delay: 0.2s; }
                .orb-ring.three.idle { width: 150px; height: 150px; animation-delay: 0.4s; }
                .orb-ring.recording { animation: wave 1.5s infinite ease-in-out; }
                .orb-ring.one.recording { width: 70px; height: 70px; animation-delay: 0s; }
                .orb-ring.two.recording { width: 70px; height: 70px; animation-delay: 0.5s; }
                .orb-ring.three.recording { width: 70px; height: 70px; animation-delay: 1s; }

                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
                @keyframes wave {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

interface VoiceInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTranscriptReady: (transcript: string) => void;
    t: (key: string) => string;
    lang: Language;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onClose, onTranscriptReady, t, lang }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const recognitionRef = useRef<any | null>(null);
    
    const resetState = () => {
        setIsRecording(false);
        setTranscript('');
        setStatus('idle');
        setErrorMessage('');
    }

    useEffect(() => {
        if (!isOpen) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            resetState();
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = lang === 'es' ? 'es-ES' : 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const currentTranscript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                setTranscript(currentTranscript);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
                setStatus(prev => prev === 'recording' ? 'idle' : prev);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'aborted') {
                    return; // User intentionally closed the modal
                }
                playTone('error');
                if (event.error === 'not-allowed') {
                    setErrorMessage(t('voice_error_permission'));
                } else if (event.error === 'network') {
                    setErrorMessage(t('voice_error_network'));
                } else if (event.error === 'no-speech') {
                    setErrorMessage(t('voice_error_no_speech'));
                } else if (event.error === 'audio-capture') {
                    setErrorMessage(t('voice_error_audio_capture'));
                } else {
                    setErrorMessage(t('voice_error'));
                }
            };
        }
    }, [isOpen, onClose, lang, t]);

    const startRecording = () => {
        if (recognitionRef.current) {
            setErrorMessage('');
            playTone('start');
            setTranscript('');
            setIsRecording(true);
            setStatus('recording');
            recognitionRef.current.start();
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };
    
    useEffect(() => {
        if (!isRecording && transcript && isOpen && status !== 'transitioning') {
            setStatus('transitioning');
            onTranscriptReady(transcript);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording, transcript, isOpen]);


    const handleClose = () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        onClose();
    }
    
    const handleAnimationEnd = () => {
        if (status === 'transitioning') {
            onClose();
        }
    };
    
    const modalAnimationClass = status === 'transitioning' ? 'animate-modal-to-island' : 'animate-modal-in';

    return (
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onAnimationEnd={handleAnimationEnd}
        >
             <div className={`w-full max-w-md m-4 transform transition-all duration-300 ${modalAnimationClass} bg-white/10 dark:bg-surface-dark/50 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl`}>
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white/90">{t('voice_input_title')}</h2>
                    <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex flex-col items-center justify-center space-y-6 min-h-[250px]">
                    <FuturisticOrb status={status === 'recording' ? 'recording' : 'idle'} onClick={isRecording ? stopRecording : startRecording} />
                    <div className="text-center h-12">
                        { errorMessage ? (
                            <p className="text-red-400">{errorMessage}</p>
                        ) : isRecording ? (
                            <p className="text-white/70 animate-pulse">{t('voice_input_listening')}</p>
                        ) : transcript && status !== 'transitioning' ? (
                            <p className="text-white/90 italic">"{transcript}"</p>
                        ) : status !== 'transitioning' ? (
                            <p className="text-white/70">{t('voice_input_prompt')}</p>
                        ) : null}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes modal-in {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
                
                @keyframes modal-to-island {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-45vh) scale(0.2);
                        opacity: 0;
                    }
                }
                .animate-modal-to-island { animation: modal-to-island 0.5s cubic-bezier(0.45, 0, 1, 1) forwards; }
            `}</style>
        </div>
    );
};

export default VoiceInputModal;