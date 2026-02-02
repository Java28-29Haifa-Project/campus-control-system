
import { useParams } from "react-router-dom";
import TicketSupportDetailsPage from "./TicketSupportDetailsPage";
import {mockTickets} from "../../mocks/ticketMocks.ts";
import TicketSupportDetailsMocksPage from "./supportMocks/TicketSupportDetailsMocksPage.tsx";

const TicketSupportDetails = () => {
    const { id } = useParams<{ id: string }>();

    const useMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === "true";

    return (
        <div>
            {useMockTickets ? (
                <TicketSupportDetailsMocksPage ticket={(mockTickets.find(
                    (t) => t.requestId === id))!} />
            ) : (
                <TicketSupportDetailsPage />
            )}
        </div>
    );
};

export default TicketSupportDetails;
