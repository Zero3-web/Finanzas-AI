import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Account, TransactionType } from '../types';
import { MicIcon, StopCircleIcon, XIcon } from './icons';
import { playTone } from '../utils/audio';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Omit<Transaction, 'id'>) => void;
  onError: (error: string) => void;
  accounts: Account[];
  t: (key: string) => string;
}

// Audio helper functions
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int116Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onClose, onSuccess, onError, accounts, t }) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
  const addTransactionFunctionDeclaration: FunctionDeclaration = {
    name: 'addTransaction',
    parameters: {
        type: Type.OBJECT,
        description: 'Records a new financial transaction, either an income or an expense.',
        properties: {
            type: { type: Type.STRING, description: 'The type of transaction, must be "income" or "expense".' },
            amount: { type: Type.NUMBER, description: 'The numerical amount of the transaction.' },
            description: { type: Type.STRING, description: 'A brief description of the transaction, e.g., "Groceries at Walmart".' },
            category: {
                type: Type.STRING,
                description: 'The category of the transaction. For expenses, common values are "Food", "Transport", "Shopping", "Housing", "Entertainment", "Health", "Utilities", "Other". For income, "Salary", "Freelance", "Gifts", "Investments", "Other".',
            },
            accountName: {
                type: Type.STRING,
                description: 'The name of the account to associate the transaction with. Should match one of the available account names.',
            },
        },
        required: ['type', 'amount', 'description', 'category', 'accountName'],
    },
  };
    
  const startListening = async () => {
    if (status !== 'idle' && status !== 'error') return;
    setStatus('listening');
    setTranscribedText('');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        const availableAccounts = accounts.map(a => a.name).join(', ') || 'none';
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const source = audioContextRef.current!.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                           session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                },
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        setTranscribedText(prev => prev + message.serverContent.inputTranscription.text);
                    }
                    if (message.toolCall) {
                        setStatus('processing');
                        const fc = message.toolCall.functionCalls[0];
                        if (fc && fc.name === 'addTransaction') {
                            const { type, amount, description, category, accountName } = fc.args;
                            const targetAccount = accounts.find(a => a.name.toLowerCase() === accountName?.toLowerCase());
                            
                            if (!targetAccount) {
                                onError(t('voice_input_error_account'));
                                setStatus('error');
                                return;
                            }

                            const transactionData = {
                                accountId: targetAccount.id,
                                amount: parseFloat(amount),
                                description,
                                category,
                                type: type as TransactionType,
                                date: new Date().toISOString().split('T')[0],
                            };
                            onSuccess(transactionData);
                            stopListening(true);
                        }
                    }
                    if (message.serverContent?.turnComplete) {
                        if (status === 'listening') {
                            setStatus('error');
                            onError(t('voice_input_error'));
                        }
                    }
                },
                onerror: (e: ErrorEvent) => {
                    setStatus('error');
                    onError(t('voice_input_error'));
                },
                onclose: () => {},
            },
            config: {
                inputAudioTranscription: {},
                tools: [{ functionDeclarations: [addTransactionFunctionDeclaration] }],
                systemInstruction: `You are a voice assistant for a personal finance app. The user will state a transaction. Your task is to extract the details and call the 'addTransaction' function. Today's date is ${new Date().toLocaleDateString()}. Available accounts are: ${availableAccounts}. If no account is specified, use the first one. Be concise.`
            },
        });
    } catch (err) {
        console.error("Error starting voice input:", err);
        setStatus('error');
        onError('Microphone access denied.');
    }
  };

  const stopListening = (isSuccess = false) => {
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if(mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    if (isSuccess) {
        onClose();
        playTone('success');
    }
    setStatus('idle');
  };

  useEffect(() => {
    if (isOpen) {
        startListening();
    } else {
        stopListening();
    }
    return () => stopListening();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm" onClick={() => stopListening()}>
      <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md m-4 p-6 text-center transform transition-all duration-300 animate-modal-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">{t('voice_input_title')}</h2>
            <button onClick={() => stopListening()} className="text-text-secondary dark:text-text-secondary-dark"><XIcon className="w-6 h-6" /></button>
        </div>
        
        <div className="my-8">
            <button 
                onClick={status === 'listening' ? () => stopListening() : startListening}
                className={`mx-auto flex items-center justify-center w-24 h-24 rounded-full transition-colors ${status === 'listening' ? 'bg-red-500/20' : 'bg-primary/20'}`}
            >
               <div className={`flex items-center justify-center w-20 h-20 rounded-full ${status === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}>
                 {status === 'listening' ? <StopCircleIcon className="w-10 h-10 text-white"/> : <MicIcon className="w-10 h-10 text-white"/>}
               </div>
            </button>
        </div>
        
        <div className="min-h-[6rem] flex flex-col justify-center">
            {status === 'listening' && <p className="text-lg font-semibold text-primary">{t('voice_input_listening')}</p>}
            {status === 'processing' && <p className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">{t('voice_input_processing')}</p>}
            
            <p className="text-text-main dark:text-text-main-dark mt-2">{transcribedText}</p>

            {(status === 'idle' || status === 'error') && (
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
                    {status === 'error' ? t('voice_input_error') : t('voice_input_prompt')}
                </p>
            )}
        </div>

      </div>
       <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VoiceInputModal;
