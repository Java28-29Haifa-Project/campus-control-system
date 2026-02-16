import React, { useEffect, useState } from "react";
import "./ThemedLayout.css";

import { useTheme } from "../context/ThemeContext";


import TicketDay from "../assets/images/TicketDay.png";
import TicketNight from "../assets/images/TicketNight.png";

import IncidentDay from "../assets/images/IncidentDay.png";
import IncidentNight from "../assets/images/IncidentNight.png";

import HomeDay from "../assets/images/HomeDay.png";
import HomeNight from "../assets/images/HomeNight.png";

import HealthDay from "../assets/images/HealthDay.png";
import HealthNight from "../assets/images/HealthNight.png";

import AlarmsDay from "../assets/images/AlarmsDay.png";
import AlarmsNight from "../assets/images/AlarmsNight.png";

import LogsDay from "../assets/images/LogsDay.png";
import LogsNight from "../assets/images/LogsNight.png";

import DorficDay from "../assets/images/DorficDay.png";
import DorficNight from "../assets/images/DorficNight.png";


const IMAGES: Record<string, { day: string; night: string }> = {
    Ticket: { day: TicketDay, night: TicketNight },
    Incident: { day: IncidentDay, night: IncidentNight },
    Home: { day: HomeDay, night: HomeNight },
    Health: { day: HealthDay, night: HealthNight },
    Alarms: { day: AlarmsDay, night: AlarmsNight },
    Alarm: { day: AlarmsDay, night: AlarmsNight },
    Logs: { day: LogsDay, night: LogsNight },
    Dorfic: { day: DorficDay, night: DorficNight },
};

interface ThemedLayoutProps {
    children: React.ReactNode;
    imageName?: string;
    isWide?: boolean;
    isFullWidth?: boolean;
}

interface ContainerSize {
    width: number | null;
    height: number | null;
}

const ThemedLayout: React.FC<ThemedLayoutProps> = ({
                                                       children,
                                                       imageName = "Ticket",
                                                       isWide = false,
                                                       isFullWidth = false
                                                   }) => {

    const { theme } = useTheme();
    const isNight = theme === 'night';


    const [size, setSize] = useState<ContainerSize>(() => {
        const saved = localStorage.getItem("layout-size");
        if (saved) {
            try { return JSON.parse(saved); } catch  { return { width: null, height: null }; }
        }
        return { width: null, height: null };
    });

    useEffect(() => {
        localStorage.setItem("layout-size", JSON.stringify(size));
    }, [size]);

    const resize = (dimension: 'width' | 'height', delta: number) => {
        setSize(prev => {
            const currentVal = prev[dimension] ?? (dimension === 'width' ? 800 : 600);
            const newVal = currentVal + delta;
            if (newVal < 350) return prev;
            return { ...prev, [dimension]: newVal };
        });
    };



    const currentSet = IMAGES[imageName] || IMAGES["Ticket"];
    const imageSrc = isNight ? currentSet.night : currentSet.day;

    return (
        <div className={`themed-page-container ${isWide ? "wide-mode" : ""}`}>
            <div className="layout-content-wrapper">


                <div className="themed-image-side">
                    <img src={imageSrc} alt={`${imageName} Illustration`} key={imageSrc} />
                </div>


                <div className="themed-content-side">
                    <div
                        className={`content-wrapper ${isWide ? "wide" : ""}`}
                        style={isWide && !isFullWidth ? {

                            width: size.width ? `${size.width}px` : undefined,
                            height: size.height ? `${size.height}px` : undefined,
                            flex: size.height ? 'none' : undefined
                        } : {}}
                    >

                        {isWide && !isFullWidth && (
                            <div className="resize-controls-panel">

                                <button onClick={() => resize('width', -80)} title="Squeeze width">◀</button>
                                <button onClick={() => resize('width', 80)} title="Expand width">▶</button>

                                <div className="resize-divider"></div>


                                <button onClick={() => resize('height', -60)} title="Squeeze height">▲</button>
                                <button onClick={() => resize('height', 60)} title="Expand height">▼</button>
                            </div>
                        )}

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemedLayout;