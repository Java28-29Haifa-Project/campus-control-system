import { Outlet } from "react-router-dom";
import type { RouteType } from "../utils/types.ts";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar.tsx";

import bgDay from "../assets/images/BlobAndBubbleDay.gif";

import bgNight from "../assets/images/BlobAndBubbleNight.gif";


import logoDay from "../assets/images/CCS-Daylogo.png";

import logoNight from "../assets/images/CCS-Nightlogo.png";


import bubbleDay from "../assets/images/bubbleDay.gif";

import bubbleNight from "../assets/images/bubbleNight.gif";


import btnDay from "../assets/images/Day.png";

import btnNight from "../assets/images/Night.png";


import soundOnImg from "../assets/images/soundOn.png";

import soundOffImg from "../assets/images/soundOff.png";


import bubbleThemeAudio from "../assets/audio/BubbleTheme.mp3";

import bubbleClickAudio from "../assets/audio/BubbleClick.mp3";

type Props = {
    items: RouteType[];
    isDarkMode: boolean;
    onToggleTheme: () => void;
};

const RootLayout: React.FC<Props> = ({ items, isDarkMode, onToggleTheme }) => {

    const currentBg = isDarkMode ? bgNight : bgDay;
    const currentLogo = isDarkMode ? logoNight : logoDay;
    const currentBubble = isDarkMode ? bubbleNight : bubbleDay;
    const currentBtn = isDarkMode ? btnNight : btnDay;


    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const fadeIntervalRef = useRef<number | null>(null);
    const [clickAudio] = useState(new Audio(bubbleClickAudio));

    const playClickSound = () => {
        clickAudio.currentTime = 0;
        clickAudio.volume = 0.5;
        clickAudio.play().catch(e => console.error(e));
    };

    const toggleMusic = () => {
        playClickSound();
        const audio = audioRef.current;
        if (!audio) return;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

        if (isMusicPlaying) {
            setIsMusicPlaying(false);
            fadeIntervalRef.current = setInterval(() => {
                if (audio.volume > 0.05) audio.volume -= 0.05;
                else {
                    audio.volume = 0;
                    audio.pause();
                    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                }
            }, 50);
        } else {
            setIsMusicPlaying(true);
            audio.volume = 0;
            audio.play().catch(e => console.log(e));
            fadeIntervalRef.current = setInterval(() => {
                if (audio.volume < 0.95) audio.volume += 0.05;
                else {
                    audio.volume = 1;
                    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                }
            }, 50);
        }
    };

    const handleThemeToggle = () => {
        playClickSound();
        onToggleTheme();
    }


    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;

            const targetWidth = 1920;
            const targetHeight = 1080;


            const scale = Math.min(
                window.innerWidth / targetWidth,
                window.innerHeight / targetHeight
            );

            containerRef.current.style.transform = `scale(${scale})`;
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="layout-wrapper" style={{ color: isDarkMode ? '#fff' : '#333' }}>
            <audio ref={audioRef} src={bubbleThemeAudio} loop />


            <img src={currentBg} alt="background" className="background-layer" />


            <div className="app-container" ref={containerRef}>


                <div className="brand-container-fixed">
                    <img src={currentLogo} alt="Logo" className="logo" />
                    <img src={currentBubble} alt="Bubbles" className="bubbles-deco" />
                </div>


                <button className="theme-toggle-fixed" onClick={handleThemeToggle}>
                    <img src={currentBtn} alt="Toggle Theme" />
                </button>
                <button className="sound-toggle-fixed" onClick={toggleMusic}>
                    <img src={isMusicPlaying ? soundOnImg : soundOffImg} alt="Toggle Sound" />
                </button>


                <Navbar items={items} isDarkMode={isDarkMode} onPlayClick={playClickSound} />


                <div className="container">
                    <Outlet context={{ playClickSound }} />
                </div>
            </div>
        </div>
    );
};

export default RootLayout;