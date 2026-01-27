import TicketListPage from "./TicketListPage.tsx";
import TicketListMocksPage from "./ticketMocksPages/TicketListMocksPage.tsx";

const Ticket = () => {

    //TODO delete mocks
    const useMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === 'true';

    return (
        <div >
            {useMockTickets? <TicketListMocksPage /> : <TicketListPage/>}
        </div>
    );
};

export default Ticket;