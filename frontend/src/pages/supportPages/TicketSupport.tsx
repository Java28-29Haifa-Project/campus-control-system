import TicketSupportTable from "./TicketSupportTable.tsx";
import TicketSupportMocksTable from "./supportMocks/TicketSupportMocksTable.tsx";
import React from "react";

type Props = {
    detailsBasePath: string;
};

const TicketSupport:React.FC<Props> = ({detailsBasePath}) => {

    //TODO delete mocks
    const useMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === 'true';
    return (
        <div >
            {useMockTickets? <TicketSupportMocksTable/> : <TicketSupportTable detailsBasePath={detailsBasePath} />}
        </div>
    );
};

export default TicketSupport;