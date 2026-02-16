import CreateIncidentMocks from "./supportMocks/CreateIncidentMocks.tsx";
import CreateFormIncident from "./CreateFormIncident.tsx";

const CreateIncident = () => {

    const useMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === 'true';

    return (
        <div >
            {useMockTickets? <CreateIncidentMocks /> : <CreateFormIncident/>}
        </div>
    );
}

export default CreateIncident;