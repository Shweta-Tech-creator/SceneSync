import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AcceptInvitation.css';

const AcceptInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, signup } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, success, error, needsLogin, signup
    const [message, setMessage] = useState('');
    const [project, setProject] = useState(null);
    const [invitationEmail, setInvitationEmail] = useState('');

    // Signup form state
    const [signupData, setSignupData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [signupError, setSignupError] = useState('');

    useEffect(() => {
        console.log('AcceptInvitation component mounted');
        console.log('User:', user);
        console.log('Token:', token);

        if (user && token) {
            console.log('User is logged in, accepting invitation...');
            acceptInvitation();
        } else if (!user) {
            console.log('User not logged in, fetching invitation details...');
            fetchInvitationDetails();
        }
    }, [user, token]);

    const fetchInvitationDetails = async () => {
        try {
            // Fetch invitation details to pre-fill the email
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invitations/details/${token}`);
            const data = await response.json();

            if (data.success) {
                setInvitationEmail(data.email);
                setSignupData(prev => ({ ...prev, email: data.email }));
                setStatus('signup');
                setMessage('Create an account to accept this invitation');
            } else {
                setStatus('error');
                setMessage(data.message || 'Invalid invitation link');
            }
        } catch (error) {
            console.error('Error fetching invitation details:', error);
            setStatus('signup');
            setMessage('Create an account to accept this invitation');
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setSignupError('');

        // Validation
        if (!signupData.username || !signupData.email || !signupData.password) {
            setSignupError('All fields are required');
            return;
        }

        if (signupData.password !== signupData.confirmPassword) {
            setSignupError('Passwords do not match');
            return;
        }

        if (signupData.password.length < 6) {
            setSignupError('Password must be at least 6 characters');
            return;
        }

        try {
            setStatus('loading');
            setMessage('Creating your account...');

            // Sign up the user
            await signup(signupData.username, signupData.email, signupData.password);

            // Wait a moment for the auth context to update
            setTimeout(() => {
                window.location.reload(); // Reload to get the new user context
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            setStatus('signup');
            setSignupError(error.message || 'Failed to create account. Please try again.');
        }
    };

    const acceptInvitation = async () => {
        try {
            console.log('Sending accept invitation request...');
            const url = `${import.meta.env.VITE_API_URL}/api/invitations/accept/${token}`;
            console.log('URL:', url);
            console.log('User ID:', user._id);
            console.log('User Email:', user.email);
            console.log('User Name:', user.username);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id
                })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                console.log('Invitation accepted successfully!');
                setStatus('success');
                setMessage(data.message);
                setProject(data.project);

                // Clear the pending token
                sessionStorage.removeItem('pendingInvitationToken');

                // Redirect to dashboard after 4 seconds
                console.log('Will redirect in 4 seconds...');
                setTimeout(() => {
                    console.log('Redirecting to features page...');
                    navigate('/features');
                }, 4000);
            } else {
                console.error('Invitation acceptance failed:', data.message);
                setStatus('error');
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
            setStatus('error');
            setMessage('Failed to accept invitation. Please try again.');
        }
    };

    const handleLoginClick = () => {
        // Redirect to home page where they can log in
        navigate('/');
    };

    return (
        <div className="accept-invitation-container">
            <div className="accept-invitation-card">
                {status === 'loading' && (
                    <>
                        <div className="spinner"></div>
                        <h2>Processing...</h2>
                        <p>{message || 'Please wait while we process your request.'}</p>
                    </>
                )}

                {status === 'signup' && (
                    <>
                        <div className="info-icon">✉️</div>
                        <h2>Accept Invitation</h2>
                        <p className="info-text">{message}</p>
                        {invitationEmail && (
                            <p className="invited-email">Invited email: <strong>{invitationEmail}</strong></p>
                        )}

                        <form onSubmit={handleSignupSubmit} className="signup-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={signupData.username}
                                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={signupData.email}
                                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={signupData.password}
                                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                    placeholder="Create a password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={signupData.confirmPassword}
                                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>

                            {signupError && <p className="error-message">{signupError}</p>}

                            <button type="submit" className="signup-btn">
                                Create Account & Accept Invitation
                            </button>
                        </form>
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
                            onClick={() => navigate('/features')}
                        >
                            Go to Features
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AcceptInvitation;
