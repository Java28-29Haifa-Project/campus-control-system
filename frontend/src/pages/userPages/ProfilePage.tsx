import React from "react";
import ThemedLayout from "../../components/ThemedLayout";
import { useAppSelector } from "../../state/hooks.ts";

const ProfilePage: React.FC = () => {

    const { user } = useAppSelector((state) => state.auth);

    if (!user) {
        return (
            <ThemedLayout imageName="Logs">
                <div className="login-wrapper">Loading profile...</div>
            </ThemedLayout>
        );
    }

    return (

        <ThemedLayout imageName="Logs">
            <div className="login-wrapper">
                <h1>My Profile</h1>

                <div style={{ marginTop: '20px', textAlign: 'left', width: '100%' }}>
                    <div className="input-group">
                        <label style={{display: 'block', marginBottom: '5px', opacity: 0.7}}>Username</label>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold' }}>
                            {user.username}
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '15px' }}>
                        <label style={{display: 'block', marginBottom: '5px', opacity: 0.7}}>Email</label>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                            {user.email}
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '15px' }}>
                        <label style={{display: 'block', marginBottom: '5px', opacity: 0.7}}>Role</label>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold', color: '#ff8c00' }}>
                            {user.role}
                        </div>
                    </div>
                </div>
            </div>
        </ThemedLayout>
    );
};

export default ProfilePage;