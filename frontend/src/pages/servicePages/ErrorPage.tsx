import { useNavigate } from "react-router-dom";
import {useEffect} from "react";


const ErrorPage = () => {

    const navigate = useNavigate();

    useEffect(() => {
        navigate('/error');
    }, [])


    return (
        <div className='container'>
            <h1>404 | Not found</h1>
        </div>
    );
};

export default ErrorPage;