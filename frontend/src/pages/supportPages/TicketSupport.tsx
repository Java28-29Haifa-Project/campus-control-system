import TicketSupportTable from "./TicketSupportTable.tsx";
import TicketSupportMocksTable from "./supportMocks/TicketSupportMocksTable.tsx";
import ThemedLayout from "../../components/ThemedLayout";

const TicketSupport = () => {
    const useMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === 'true';

    return (

        <ThemedLayout imageName="Ticket" isWide={true}>
            {useMockTickets ? <TicketSupportMocksTable/> : <TicketSupportTable/>}
        </ThemedLayout>
    );
};

export default TicketSupport;