import React, { useState } from 'react';

import { useTheme } from '../context/ThemeContext';

import './ThemeSettings.css';


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



const ThemeSettings = () => {
    const {
        theme, toggleTheme,
        isBgPaused, toggleBgPause,
        isSoundEnabled, toggleSound
    } = useTheme();

    const [isOpen, setIsOpen] = useState(false);

    const currentSettingsIcon = theme === 'day' ? settingsDayImg : settingsNightImg;
    const themeToggleIcon = theme === 'day' ? buttonDayImg : buttonNightImg;


    let playPauseIcon;
    if (theme === 'day') {
        playPauseIcon = isBgPaused ? playDay : pauseDay;
    } else {
        playPauseIcon = isBgPaused ? playNight : pauseNight;
    }


    let soundIcon;
    if (theme === 'day') {

        soundIcon = isSoundEnabled ? musicOnDay : musicOffDay;
    } else {

        soundIcon = isSoundEnabled ? musicOnNight : musicOffNight;
    }

    return (
        <div className="theme-settings-container">

            <div className={`theme-panel ${isOpen ? 'open' : ''}`}>


                <button
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title="Switch Theme"
                >
                    <img src={themeToggleIcon} alt="Toggle Theme" />
                </button>


                <button
                    className="theme-toggle-btn"
                    onClick={toggleSound}
                    title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
                >
                    <img src={soundIcon} alt="Toggle Sound" />
                </button>


                <button
                    className="theme-toggle-btn"
                    onClick={toggleBgPause}
                    title={isBgPaused ? "Play Animation" : "Pause Animation"}
                >
                    <img src={playPauseIcon} alt="Play/Pause Background" />
                </button>

            </div>


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