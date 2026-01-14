import {useState} from "react";
import './health.css';
import {healthApi} from "../../api/healthApi.ts";


const HealthPage = () => {

    const [status, setStatus] = useState<string>("");

    const healthCheck = async () => {
        try{
            const data = await healthApi();
            setStatus(JSON.stringify(data, null, 2));
        }catch(e){
            setStatus("Error, check console");
        }
    }

    return (
        <div className='wrapper'>
            <h1 >Health Page</h1>
            <button onClick={healthCheck} className='health-button'>Check health</button>
            <p>The status of health is: </p>
            <h1 >{status}</h1>
        </div>
    );
};

export default HealthPage;