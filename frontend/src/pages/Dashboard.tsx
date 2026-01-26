import ThemedLayout from "../components/ThemedLayout";

const Dashboard = () => {
    return (
        <ThemedLayout imageName="Home">
            <div style={{ textAlign: 'left', width: '100%' }}>
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '900',
                    margin: 0,
                    textTransform: 'uppercase',


                    background: 'linear-gradient(90deg, #FFB800, #FF8A00)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',

                    display: 'inline-block',
                    lineHeight: 1
                }}>
                    WELCOME!
                </h1>
            </div>
        </ThemedLayout>
    );
};

export default Dashboard;