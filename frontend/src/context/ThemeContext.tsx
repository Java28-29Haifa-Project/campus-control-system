import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import clickSoundFile from '../assets/audio/DorficClick.mp3';

type Theme = 'day' | 'night';
export type NavbarPosition = 'right' | 'bottom' | 'left' | 'top';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isBgPaused: boolean;
    toggleBgPause: () => void;
    isSoundEnabled: boolean;
    toggleSound: () => void;

    navPosition: NavbarPosition;
    cycleNavPosition: () => void;
    navScale: number;
    increaseNavScale: () => void;
    decreaseNavScale: () => void;

    isNavOpen: boolean;
    toggleNav: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {


    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('app-theme') as Theme) || 'day';
    });

    const [isBgPaused, setIsBgPaused] = useState(() => {
        const saved = localStorage.getItem('app-bg-paused');
        return saved ? JSON.parse(saved) : false;
    });


    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('app-sound');
        return saved ? JSON.parse(saved) : true;
    });


    const [navPosition, setNavPosition] = useState<NavbarPosition>(() => {
        return (localStorage.getItem('app-nav-position') as NavbarPosition) || 'right';
    });


    const [navScale, setNavScale] = useState(() => {
        const saved = localStorage.getItem('app-nav-scale');
        return saved ? JSON.parse(saved) : 1;
    });


    const [isNavOpen, setIsNavOpen] = useState(() => {
        const saved = localStorage.getItem('app-nav-open');
        return saved ? JSON.parse(saved) : true;
    });




    useEffect(() => {
        document.body.className = theme === 'day' ? '' : 'night-mode';
        localStorage.setItem('app-theme', theme);

        if (isBgPaused) {
            document.body.classList.add('bg-paused');
        } else {
            document.body.classList.remove('bg-paused');
        }
        localStorage.setItem('app-bg-paused', JSON.stringify(isBgPaused));
    }, [theme, isBgPaused]);

    useEffect(() => {
        localStorage.setItem('app-sound', JSON.stringify(isSoundEnabled));

        const handleGlobalClick = () => {
            if (isSoundEnabled) {
                const audio = new Audio(clickSoundFile);
                audio.volume = 0.4;
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        };
        window.addEventListener('mousedown', handleGlobalClick);
        return () => window.removeEventListener('mousedown', handleGlobalClick);
    }, [isSoundEnabled]);


    useEffect(() => {
        localStorage.setItem('app-nav-position', navPosition);
    }, [navPosition]);

    useEffect(() => {
        localStorage.setItem('app-nav-scale', JSON.stringify(navScale));
    }, [navScale]);

    useEffect(() => {
        localStorage.setItem('app-nav-open', JSON.stringify(isNavOpen));
    }, [isNavOpen]);


    const toggleTheme = () => setTheme(prev => (prev === 'day' ? 'night' : 'day'));
    const toggleBgPause = () => setIsBgPaused(prev => !prev);
    const toggleSound = () => setIsSoundEnabled(prev => !prev);

    const cycleNavPosition = () => {
        const positions: NavbarPosition[] = ['right', 'bottom', 'left', 'top'];
        const currentIndex = positions.indexOf(navPosition);
        const nextIndex = (currentIndex + 1) % positions.length;
        setNavPosition(positions[nextIndex]);
    };

    const increaseNavScale = () => setNavScale(prev => Math.min(prev + 0.1, 1.5));
    const decreaseNavScale = () => setNavScale(prev => Math.max(prev - 0.1, 0.7));
    const toggleNav = () => setIsNavOpen(prev => !prev);

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme,
            isBgPaused, toggleBgPause,
            isSoundEnabled, toggleSound,
            navPosition, cycleNavPosition,
            navScale, increaseNavScale, decreaseNavScale,
            isNavOpen, toggleNav
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