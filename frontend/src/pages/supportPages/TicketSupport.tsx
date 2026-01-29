import TicketSupportTable from "./TicketSupportTable.tsx";
import TicketSupportMocksTable from "./supportMocks/TicketSupportMocksTable.tsx";

const TicketSupport = () => {

    //TODO delete mocks
    const useMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === 'true';
    return (
        <div >
            {useMockTickets? <TicketSupportMocksTable/> : <TicketSupportTable/>}
        </div>
    );
};

export default TicketSupport;