import LoginForm from "../components/loginform/LoginForm.tsx";
import * as React from "react";

import { useOutletContext } from "react-router-dom";

type Props = {
    isDarkMode: boolean;
};


type ContextType = {
    playClickSound: () => void;
};

const Home: React.FC<Props> = ({ isDarkMode }) => {

    const { playClickSound } = useOutletContext<ContextType>();

    return (
        <div>

            <LoginForm isDarkMode={isDarkMode} onPlayClick={playClickSound} />
        </div>
    );
};

export default Home;