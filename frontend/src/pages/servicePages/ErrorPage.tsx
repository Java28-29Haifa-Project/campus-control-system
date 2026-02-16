import { useNavigate, useLocation } from "react-router-dom";
import { Paths } from "../../utils/types.ts";
import ThemedLayout from "../../components/ThemedLayout";
import '../../styles/forms.css';

const ErrorPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const code = state?.code ?? 404;

    return (

        <ThemedLayout imageName="Dorfic">


            <div className="login-wrapper" style={{textAlign: 'center', alignItems: 'center'}}>


                <h1 style={{fontSize: '80px', margin: '0', lineHeight: '1'}}>
                    {code}
                </h1>

                <h2 style={{marginTop: '10px', textTransform: 'uppercase', opacity: 0.9}}>
                    {code === 404 ? "Page Not Found" : "Access Denied"}
                </h2>

                <p style={{ opacity: 0.7, marginBottom: '30px', fontSize: '16px' }}>
                    {code === 404
                        ? "“OopS! u r lost in space lol 0_x"
                        : "Sorry, you don't have permission to be here."}
                </p>


                <div className="error-actions">
                    <button
                        onClick={() => navigate(-1)}
                        className="error-btn secondary"
                    >
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate(Paths.HOME)}
                        className="error-btn"
                    >
                        Home
                    </button>
                </div>

            </div>
        </ThemedLayout>
    );
};

export default ErrorPage;