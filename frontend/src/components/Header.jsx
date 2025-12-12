import React, { useState } from 'react';
import './Header.css';
import AuthModal from './AuthModal';
import DashboardSlider from './DashboardSlider';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ viewMode, setViewMode, resetDashboard }) => {
    // ... (rest of component)


    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = React.useMemo(() => [new URLSearchParams(window.location.search)], [window.location.search]);

    React.useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'auth_failed' && !user) {
            setShowAuthModal(true);
            // Optionally clear the query param
            window.history.replaceState({}, document.title, "/");
        }
    }, [searchParams, user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAuthSuccess = () => {
        // User successfully authenticated
        navigate('/features');
    };

    return (
        <>
            <header className="main-header">
                <div className="header-container">
                    <div className="header-left">
                        {location.pathname === '/features' && (
                            <button
                                className="hamburger-menu-btn"
                                onClick={() => setShowDashboard(true)}
                                aria-label="Open Menu"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        )}
                        <div className="logo">
                            <div className="logo-text-header">
                                <span className="word-header scene-header">Scene</span>
                                <span className="word-header sync-header">Sync</span>
                            </div>
                        </div>
                    </div>
                    <nav className="main-nav">
                        <a href="#home" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
                        <a href="#features" className="nav-link" onClick={(e) => {
                            e.preventDefault();
                            if (user) {
                                navigate('/features');
                            } else {
                                setShowAuthModal(true);
                            }
                        }}>Features</a>
                        <a href="#about" className="nav-link" onClick={(e) => {
                            e.preventDefault();
                            const aboutSection = document.getElementById('about');
                            if (aboutSection) {
                                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}>About Us</a>
                        <a href="#contact" className="nav-link" onClick={(e) => {
                            e.preventDefault();
                            const contactSection = document.getElementById('contact');
                            if (contactSection) {
                                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}>Contact</a>
                    </nav>

                    <div className="header-actions">
                        {user ? (
                            <div className="profile-menu-container">
                                <button
                                    className="profile-icon-btn"
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="profile-avatar-img" />
                                    ) : (
                                        <div className="profile-avatar-placeholder">
                                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </button>

                                {showProfileDropdown && (
                                    <div className="profile-dropdown">
                                        <div className="profile-header">
                                            <div className="profile-name">{user.username || 'User'}</div>
                                            <div className="profile-email">{user.email}</div>
                                            <div className="profile-role-badge">{user.role || 'Artist'}</div>
                                        </div>
                                        <div className="profile-footer">
                                            <button className="dropdown-logout-btn" onClick={handleLogout}>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    className="nav-link login-link"
                                    onClick={() => setShowAuthModal(true)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Login
                                </button>
                                <button className="btn-primary-sm">Start Free</button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            <DashboardSlider
                isOpen={showDashboard}
                onClose={() => setShowDashboard(false)}
            />


        </>
    );
};

export default Header;
