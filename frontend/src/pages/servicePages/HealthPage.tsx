import {fetchHealth} from "../../api/client.ts";
import {useState} from "react";
import './health.css';


const HealthPage = () => {

    const [status, setStatus] = useState<string>("");

    const healthCheck = async () => {
        try{
            const data = await fetchHealth();
            setStatus(JSON.stringify(data, null, 2));
        }catch(e){
            setStatus("Error, check console");
        }
    }

    return (
        <div className='wrapper'>
            <h1 >Health Page</h1>
            <button onClick={healthCheck} className='health-button'>Check health</button>
            <p>The status of health is: <h3>{status}</h3></p>
        </div>
    );
};

export default HealthPage;