import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTheme, saveTheme } from '../services/storageService';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = getTheme();
        const initialMode = savedTheme === 'dark';

        // Sync DOM immediately to match state
        if (initialMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return initialMode;
    });

    useEffect(() => {
        // This effect now only handles changes if needed, but the init handled the first render.
        // We can keep it to ensure sync or remove if we trust the toggle.
        // Let's keep a simplified sync just in case external storage changes, 
        // but for now the specific requirement is the Initial Flash.
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        saveTheme(newMode ? 'dark' : 'light');

        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
