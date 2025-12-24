import { useEffect, useCallback } from 'react';
import { logout } from '../services/apiService';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const useIdleTimer = (isAuthenticated: boolean) => {
    const handleLogout = useCallback(() => {
        console.log('User inactive for 15 minutes. Logging out...');
        logout().then(() => {
            window.location.hash = '#/login';
        });
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(handleLogout, IDLE_TIMEOUT);
        };

        // Events to listen for activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        // Initial start
        resetTimer();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated, handleLogout]);
};
