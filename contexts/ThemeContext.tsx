import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTheme, saveTheme } from '../services/storageService';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check if class is already present (from index.html script)
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }

        // Fallback logic
        const savedTheme = getTheme();
        if (savedTheme) {
            return savedTheme === 'dark';
        }

        // Check system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        return false;
    });

    // Sync React state with DOM on mount and ensure they stay aligned
    useEffect(() => {
        // Ensure DOM reflects React state
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

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
