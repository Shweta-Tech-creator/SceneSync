import React from 'react';
import './DashboardSlider.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardSlider = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = React.useState({ contributors: 0, projects: 0 });

    React.useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                try {
                    console.log('Fetching stats for user:', user);
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/user-stats`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    const data = await response.json();
                    console.log('Stats response:', data);
                    if (data.success) {
                        setStats({
                            contributors: data.totalCollaborators || 0,
                            projects: data.totalProjects || 0
                        });
                        console.log('Stats updated:', { contributors: data.totalCollaborators, projects: data.totalProjects });
                    } else {
                        console.error('Stats fetch failed:', data.message);
                    }
                } catch (error) {
                    console.error('Error fetching stats:', error);
                }
            }
        };

        if (isOpen) {
            fetchStats();
        }
    }, [isOpen, user]);

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        onClose();
    };

    return (
        <>
            <div
                className={`dashboard-slider-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />
            <div className={`dashboard-slider ${isOpen ? 'open' : ''}`}>
                <div className="slider-header">
                    <div className="slider-logo">
                        <span className="slider-word scene">Scene</span>
                        <span className="slider-word sync">Sync</span>
                    </div>
                    <button className="slider-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="slider-content">
                    {user && (
                        <div className="user-profile-section">
                            <div className="slider-avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} />
                                ) : (
                                    <span>{user.username?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="user-info">
                                <h3>{user.username}</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>
                    )}

                    <nav className="slider-nav">
                        <button onClick={() => handleNavigation('/features')} className="slider-nav-item">
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                            </svg>
                            Project Dashboard
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=script')} className="slider-nav-item">
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Scene Script
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=breakdown')} className="slider-nav-item">
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            </svg>
                            AI Scene Breakdown
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=storyboard')} className="slider-nav-item">
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Storyboard
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=shotSequence')} className="slider-nav-item">
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                            Shot Sequence
                        </button>
                    </nav>

                    <div className="slider-footer">
                        {user ? (
                            <div className="stats-container">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.contributors}</div>
                                        <div className="stat-label">Contributors</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.projects}</div>
                                        <div className="stat-label">Projects</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => handleNavigation('/')} className="slider-login-btn">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardSlider;
