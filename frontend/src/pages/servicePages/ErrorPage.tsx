import {Link, useLocation, useNavigate} from "react-router-dom";
import {Paths} from "../../types/types.ts";


const ErrorPage = () => {

    const { state } = useLocation();
    const navigate = useNavigate();

    const code = state?.code ?? 404;

    return (
        <div className='container'>
            {code === 404? <h1 style={{color:"yellow"}}>404 | Not found</h1> :
                <div style={{color:"yellow"}}>
                    <h1>403 – Forbidden</h1>
                    <p>You don't have permission to access this page.</p>
                </div>
                }
                <br/>
            <div style={{ marginTop: 16 }}>
                <button onClick={() => navigate(-1)}>Back</button>{" "}
                <Link to={Paths.HOME}
                      style={{
                          color:"yellow",
                          fontSize:"30px",
                          border:"1px solid yellow",
                          padding: "10px"}}
                >
                    Go to Home</Link>
            </div>
        </div>
    );
};

export default ErrorPage;