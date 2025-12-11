import React from 'react';
import './SplashScreen.css';

const SplashScreen = () => {
    return (
        <div className="splash-container">
            <div className="background-effects">
                <div className="grid-overlay"></div>
                <div className="radial-glow glow-1"></div>
                <div className="radial-glow glow-2"></div>
                <div className="radial-glow glow-3"></div>
            </div>

            <div className="content-wrapper">
                <div className="logo-container">
                    <div className="logo-text">
                        <span className="word scene">Scene</span>
                        <span className="word sync">Sync</span>
                    </div>

                    <div className="particles">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`particle particle-${i + 1}`}></div>
                        ))}
                    </div>

                    <div className="light-streak-container">
                        <div className="light-streak"></div>
                        <div className="light-streak-glow"></div>
                    </div>
                </div>

                <div className="tagline">
                    Bring Your Stories to Life
                </div>

                <div className="film-strip-decoration">
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
