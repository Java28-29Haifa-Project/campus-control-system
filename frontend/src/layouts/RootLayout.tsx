import Navbar from "../components/Navbar.tsx";
import {Outlet} from "react-router-dom";
import type {RouteType} from "../utils/types.ts";
import * as React from "react";

type Props = {
    items: RouteType[];
};

const RootLayout:React.FC<Props> = ({items}) => {
    return (
        <div>
            <Navbar items={items} />
            <div className="container">
                <Outlet/>
            </div>
        </div>
    );
};

export default RootLayout;