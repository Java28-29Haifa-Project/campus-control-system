import {useState} from "react";
import './health.css';
import {healthApi} from "../../../api/healthApi.ts";

import ThemedLayout from "../../../components/ThemedLayout";

const HealthPage = () => {
    const [status, setStatus] = useState<string>("");

    const healthCheck = async () => {
        try {
            const data = await healthApi();

            setStatus(JSON.stringify(data, null, 2));

        } catch  {
            setStatus("Error, check console");
        }
    }

    return (
        <ThemedLayout imageName="Health">

            <div className='wrapper'>

                <h1>Health Page</h1>

                <button onClick={healthCheck} className='health-button'>Check health</button>

                <p>The status of health is: </p>
                <h3>{status}</h3>
            </div>
        </ThemedLayout>
    );
};
export default HealthPage;