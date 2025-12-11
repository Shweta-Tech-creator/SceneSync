import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import SplashScreen from './SplashScreen'
import Header from './components/Header'
import Hero from './components/Hero'
import WhyChooseUs from './components/WhyChooseUs-new'
import AboutUs from './components/AboutUs'
import ContactUs from './components/ContactUs'
import AuthSuccess from './components/AuthSuccess'
import Features from './pages/Features'
import StoryboardEditor from './components/Storyboard/StoryboardEditor'
import AuthModal from './components/AuthModal'
import AcceptInvitation from './components/AcceptInvitation'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        // Redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

const Home = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [showStoryboard, setShowStoryboard] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
            setTimeout(() => setShowContent(true), 100);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {showSplash && <SplashScreen />}
            {!showSplash && (
                <div className={`main-app ${showContent ? 'fade-in' : ''}`} >
                    <Header showStoryboard={showStoryboard} setShowStoryboard={setShowStoryboard} />
                    {showStoryboard ? (
                        <StoryboardEditor />
                    ) : (
                        <main>
                            <Hero />
                            <WhyChooseUs />
                            <AboutUs />
                            <ContactUs />
                        </main>
                    )}
                </div>
            )}
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth/success" element={<AuthSuccess />} />
                    <Route
                        path="/accept-invitation/:token"
                        element={
                            <ProtectedRoute>
                                <AcceptInvitation />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/features"
                        element={
                            <ProtectedRoute>
                                <Features />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Features />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/storyboard"
                        element={
                            <ProtectedRoute>
                                <StoryboardEditor />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
