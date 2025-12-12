import React from 'react';
import './DashboardSlider.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardSlider = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                            <span className="icon">📊</span> Project Dashboard
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=script')} className="slider-nav-item">
                            <span className="icon">📝</span> Scene Script
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=breakdown')} className="slider-nav-item">
                            <span className="icon">🤖</span> AI Scene Breakdown
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=storyboard')} className="slider-nav-item">
                            <span className="icon">🎨</span> Storyboard
                        </button>
                        <button onClick={() => handleNavigation('/features?tab=shotsequence')} className="slider-nav-item">
                            <span className="icon">🎬</span> Shot Sequence
                        </button>
                    </nav>

                    <div className="slider-footer">
                        {user ? (
                            <button onClick={handleLogout} className="slider-logout-btn">
                                Logout
                            </button>
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
