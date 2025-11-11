// Audio generation utility
export const playTone = (type: 'start' | 'success' | 'error') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    gainNode.connect(audioCtx.destination);
    oscillator.connect(gainNode);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.1, now);

    switch (type) {
        case 'start':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
        case 'success':
            oscillator.type = 'sine';
            // A quick, pleasant ascending chime (A5 to C6)
            oscillator.frequency.setValueAtTime(880, now);
            oscillator.frequency.linearRampToValueAtTime(1046.50, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
        case 'error':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
    }
    // Clean up the context after the sound has played
    setTimeout(() => audioCtx.close(), 500);
};
