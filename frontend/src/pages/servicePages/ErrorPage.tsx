import {Link, useLocation} from "react-router-dom";
import {Paths} from "../../utils/types.ts";

const ErrorPage = () => {

    const { state } = useLocation();
    const code = state?.code ?? 404;

    return (
        <div className='container'>
            {code === 404? <h1 style={{color:"yellow"}}>404 | Not found</h1> :
                <div>
                    <h1>403 – Forbidden</h1>
                    <p>You don't have permission to access this page.</p>
                </div>
                }
            <Link to={Paths.HOME} style={{color:"yellow"}}>Go back to Home</Link>
        </div>
    );
};

export default ErrorPage;