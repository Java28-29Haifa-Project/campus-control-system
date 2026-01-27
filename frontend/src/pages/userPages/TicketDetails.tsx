
import TicketDetailsMocksPage from "./ticketMocksPages/TicketDetailsMocksPage.tsx";
import TicketDetailsPage from "./TicketDetailsPage.tsx";

const TicketDetails = () => {

    const useMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === 'true';

    return (
        <div >
            {useMockTickets? <TicketDetailsMocksPage/> : <TicketDetailsPage/>}

        </div>
    );
};

export default TicketDetails;