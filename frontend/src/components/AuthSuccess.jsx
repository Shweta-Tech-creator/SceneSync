import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken, user, loading } = useAuth();
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const token = searchParams.get('token');

        if (token && !user) {
            setStatus('validating');
            localStorage.setItem('token', token);
            loginWithToken(token);
        } else if (!token && !user) {
            setStatus('no_token');
            // Only redirect if we're sure there's no token
            setTimeout(() => navigate('/?error=auth_failed', { replace: true }), 2000);
        }
    }, [searchParams, loginWithToken, user, navigate]);

    useEffect(() => {
        if (user) {
            setStatus('success');
            setTimeout(() => navigate('/features', { replace: true }), 500);
        }
    }, [user, navigate]);

    const getStatusMessage = () => {
        switch (status) {
            case 'processing': return 'Processing authentication...';
            case 'setting_token': return 'Setting up your session...';
            case 'validating': return 'Validating your account...';
            case 'success': return 'Success! Redirecting...';
            case 'failed': return 'Authentication failed...';
            case 'no_token': return 'No authentication token...';
            default: return 'Authenticating...';
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#0B0F28',
            color: 'white'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }}></div>
                <h2>Authenticating...</h2>
                <p style={{ opacity: 0.7 }}>{getStatusMessage()}</p>
                <p style={{ opacity: 0.3, fontSize: '0.8rem', marginTop: '20px' }}>
                    Status: {status}
                </p>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AuthSuccess;
