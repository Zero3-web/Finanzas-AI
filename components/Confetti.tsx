import React, { useEffect, useState, memo } from 'react';

const ConfettiPiece: React.FC<{
    initialX: number;
    initialY: number;
    rotation: number;
    speed: number;
    color: string;
}> = memo(({ initialX, initialY, rotation, speed, color }) => {
    return (
        <div
            className="confetti-piece"
            style={{
                '--initial-x': `${initialX}vw`,
                '--initial-y': `${initialY}vh`,
                '--rotation': `${rotation}deg`,
                '--speed': `${speed}s`,
                backgroundColor: color,
            } as React.CSSProperties}
        />
    );
});

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const newPieces = Array.from({ length: 150 }).map((_, index) => {
            const colors = ['#723FEB', '#97E0F7', '#FFD700', '#FF69B4', '#22c55e'];
            return (
                <ConfettiPiece
                    key={index}
                    initialX={Math.random() * 100}
                    initialY={-10 - Math.random() * 20}
                    rotation={Math.random() * 360}
                    speed={2 + Math.random() * 4}
                    color={colors[Math.floor(Math.random() * colors.length)]}
                />
            );
        });
        setPieces(newPieces);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-[200] overflow-hidden">
            {pieces}
            <style>{`
                @keyframes fall {
                    to {
                        transform: translateY(120vh) rotate(var(--rotation));
                        opacity: 0;
                    }
                }
                .confetti-piece {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    top: var(--initial-y);
                    left: var(--initial-x);
                    opacity: 1;
                    animation: fall var(--speed) linear forwards;
                    will-change: transform, opacity;
                }
            `}</style>
        </div>
    );
};

export default Confetti;