import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AcceptInvitation.css';

const AcceptInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [project, setProject] = useState(null);

    useEffect(() => {
        if (user && token) {
            acceptInvitation();
        } else if (!user) {
            setStatus('error');
            setMessage('Please log in to accept this invitation');
        }
    }, [user, token]);

    const acceptInvitation = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invitations/accept/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                setProject(data.project);

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
            setStatus('error');
            setMessage('Failed to accept invitation. Please try again.');
        }
    };

    return (
        <div className="accept-invitation-container">
            <div className="accept-invitation-card">
                {status === 'loading' && (
                    <>
                        <div className="spinner"></div>
                        <h2>Processing Invitation...</h2>
                        <p>Please wait while we add you to the project.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-icon">✓</div>
                        <h2>Invitation Accepted!</h2>
                        <p>{message}</p>
                        {project && (
                            <p className="project-info">
                                You've been added to: <strong>{project.title}</strong>
                            </p>
                        )}
                        <p className="redirect-message">Redirecting to dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="error-icon">✗</div>
                        <h2>Invitation Error</h2>
                        <p>{message}</p>
                        <button
                            className="back-btn"
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AcceptInvitation;
