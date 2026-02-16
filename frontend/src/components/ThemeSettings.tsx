import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './ThemeSettings.css';


import { FaArrowsAlt, FaPlus, FaMinus, FaChevronRight, FaChevronLeft, FaChevronUp, FaChevronDown } from "react-icons/fa";

import settingsDayImg from '../assets/images/settingsDay.png';
import settingsNightImg from '../assets/images/settingsNight.png';
import buttonDayImg from '../assets/images/buttonDay.png';
import buttonNightImg from '../assets/images/buttonNight.png';
import musicOnDay from '../assets/images/MusicOnDay.png';
import musicOffDay from '../assets/images/MusicOffDay.png';
import musicOnNight from '../assets/images/MusicOnNight.png';
import musicOffNight from '../assets/images/MusicOffNight.png';
import pauseDay from '../assets/images/PauseBackgroundDay.png';
import pauseNight from '../assets/images/PauseBackgroundNight.png';
import playDay from '../assets/images/playBackgroundDay.png';
import playNight from '../assets/images/PlayBackgroundNight.png';

type Props = {
    hideControls?: boolean;
}


const SIDEBAR_ROUTES = [
    '/dashboard',
    '/ticket',
    '/incident',
    '/support',
    '/alarm',
    '/logs',
    '/health',
    '/profile'
];

const ThemeSettings: React.FC<Props> = ({ hideControls }) => {
    const {
        theme, toggleTheme,
        isBgPaused, toggleBgPause,
        isSoundEnabled, toggleSound,
        navPosition, cycleNavPosition, increaseNavScale, decreaseNavScale,
        isNavOpen, toggleNav
    } = useTheme();

    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();


    const isOnSidebarPage = SIDEBAR_ROUTES.some(route => location.pathname.startsWith(route));


    const shouldHideControls = hideControls || !isOnSidebarPage;

    const currentSettingsIcon = theme === 'day' ? settingsDayImg : settingsNightImg;
    const themeToggleIcon = theme === 'day' ? buttonDayImg : buttonNightImg;

    let playPauseIcon = theme === 'day'
        ? (isBgPaused ? playDay : pauseDay)
        : (isBgPaused ? playNight : pauseNight);

    let soundIcon = theme === 'day'
        ? (isSoundEnabled ? musicOnDay : musicOffDay)
        : (isSoundEnabled ? musicOnNight : musicOffNight);

    const getArrowIcon = () => {
        if (navPosition === 'right') return isNavOpen ? <FaChevronRight /> : <FaChevronLeft />;
        if (navPosition === 'left') return isNavOpen ? <FaChevronLeft /> : <FaChevronRight />;
        if (navPosition === 'top') return isNavOpen ? <FaChevronUp /> : <FaChevronDown />;
        if (navPosition === 'bottom') return isNavOpen ? <FaChevronDown /> : <FaChevronUp />;
        return <FaChevronRight />;
    };

    return (
        <div className="theme-settings-container">


            <div className={`settings-panel vertical ${isOpen ? 'open' : ''}`}>
                <button className="theme-toggle-btn" onClick={toggleTheme} title="Switch Theme">
                    <img src={themeToggleIcon} alt="Theme" />
                </button>
                <button className="theme-toggle-btn" onClick={toggleSound} title="Sound">
                    <img src={soundIcon} alt="Sound" />
                </button>
                <button className="theme-toggle-btn" onClick={toggleBgPause} title="Background Animation">
                    <img src={playPauseIcon} alt="Animation" />
                </button>
            </div>


            {!shouldHideControls && (
                <div className={`settings-panel horizontal ${isOpen ? 'open' : ''}`}>

                    <button className="control-btn" onClick={toggleNav} title={isNavOpen ? "Hide Menu" : "Show Menu"}>
                        {getArrowIcon()}
                    </button>

                    <button className="control-btn" onClick={cycleNavPosition} title="Move Menu">
                        <FaArrowsAlt />
                    </button>

                    <button className="control-btn" onClick={increaseNavScale} title="Zoom In">
                        <FaPlus />
                    </button>

                    <button className="control-btn" onClick={decreaseNavScale} title="Zoom Out">
                        <FaMinus />
                    </button>

                </div>
            )}


            <button
                className="settings-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img
                    src={currentSettingsIcon}
                    alt="Settings"
                    className={isOpen ? 'spin' : ''}
                />
            </button>
        </div>
    );
};

export default ThemeSettings;