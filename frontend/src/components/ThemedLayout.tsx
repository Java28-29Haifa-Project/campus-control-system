import React from 'react';

import { useTheme } from '../context/ThemeContext';

import './ThemedLayout.css';


const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface ThemedLayoutProps {
    imageName: string;
    children?: React.ReactNode;
}

const ThemedLayout: React.FC<ThemedLayoutProps> = ({ imageName, children }) => {
    const { theme } = useTheme();

    const themeSuffix = capitalize(theme);

    const finalImageName = `${imageName}${themeSuffix}.png`;


    const imageUrl = new URL(`../assets/images/${finalImageName}`, import.meta.url).href;

    return (
        <div className="themed-page-container">

            <div className="themed-image-side">
                <img src={imageUrl} alt={`${imageName} Illustration`} />
            </div>


            {children && (
                <div className="themed-content-side">

                    <div className="content-wrapper">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemedLayout;