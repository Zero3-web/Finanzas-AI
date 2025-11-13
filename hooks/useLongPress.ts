import { useCallback, useRef } from 'react';

export const useLongPress = (
    onLongPress: () => void,
    onClick: () => void,
    { delay = 500 } = {}
) => {
    // FIX: Replace NodeJS.Timeout with a browser-compatible type for setTimeout's return value.
    const timeout = useRef<ReturnType<typeof setTimeout>>();
    const wasLongPress = useRef(false);

    const handleMouseDown = useCallback(() => {
        wasLongPress.current = false;
        timeout.current = setTimeout(() => {
            onLongPress();
            wasLongPress.current = true;
        }, delay);
    }, [onLongPress, delay]);

    const handleMouseUp = useCallback(() => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        if (!wasLongPress.current) {
            onClick();
        }
    }, [onClick]);

    const handleMouseLeave = useCallback(() => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
    }, []);

    return {
        onMouseDown: handleMouseDown,
        onTouchStart: handleMouseDown,
        onMouseUp: handleMouseUp,
        onTouchEnd: handleMouseUp,
        onMouseLeave: handleMouseLeave,
    };
};

export default useLongPress;
