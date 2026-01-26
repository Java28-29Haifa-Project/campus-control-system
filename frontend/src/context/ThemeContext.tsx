import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


import clickSoundFile from '../assets/audio/DorficClick.mp3';

type Theme = 'day' | 'night';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;

    isBgPaused: boolean;
    toggleBgPause: () => void;


    isSoundEnabled: boolean;
    toggleSound: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {

    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('app-theme') as Theme) || 'day';
    });


    const [isBgPaused, setIsBgPaused] = useState(false);


    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('app-sound');
        return saved ? JSON.parse(saved) : true;
    });


    useEffect(() => {
        document.body.className = theme === 'day' ? '' : 'night-mode';

        localStorage.setItem('app-theme', theme);

        if (isBgPaused) document.body.classList.add('bg-paused');
    }, [theme]);


    useEffect(() => {
        if (isBgPaused) {

            document.body.classList.add('bg-paused');
        } else {
            document.body.classList.remove('bg-paused');
        }
    }, [isBgPaused]);


    useEffect(() => {

        localStorage.setItem('app-sound', JSON.stringify(isSoundEnabled));

        const handleGlobalClick = () => {

            if (isSoundEnabled) {
                const audio = new Audio(clickSoundFile);
                audio.volume = 0.4;
                audio.currentTime = 0;
                audio.play().catch((e) => {

                    console.error("Audio error:", e);
                });
            }
        };


        window.addEventListener('click', handleGlobalClick);


        return () => {
            window.removeEventListener('click', handleGlobalClick);
        };
    }, [isSoundEnabled]);


    const toggleTheme = () => setTheme(prev => (prev === 'day' ? 'night' : 'day'));

    const toggleBgPause = () => setIsBgPaused(prev => !prev);

    const toggleSound = () => setIsSoundEnabled(prev => !prev);

    return (
        <ThemeContext.Provider value={{

            theme, toggleTheme,

            isBgPaused, toggleBgPause,
            isSoundEnabled, toggleSound
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};