import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="create-word">Create</span> smarter scenes, <br />
                        <span className="faster-word">faster.</span>
                    </h1>
                    <p className="hero-subtitle">
                        The AI-assisted scene layout and storyboard builder for modern creators.
                        Visualize your story, collaborate with your team, and bring your vision to life.
                        SceneSync combines intelligent scene composition with real-time collaboration tools,
                        enabling filmmakers, content creators, and design teams to streamline their creative workflow.
                        From concept to final storyboard, our platform helps you craft compelling narratives
                        with precision and speed, transforming your creative ideas into visual masterpieces.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary-lg">Start Creating</button>
                        <button className="btn-outline-lg">Watch Demo</button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="cinematic-composition">
                        {/* Background Glows */}
                        <div className="glow-orb blue-orb"></div>
                        <div className="glow-orb yellow-orb"></div>

                        {/* Main Frame */}
                        <div className="frame frame-main">
                            <div className="frame-header">
                                <div className="frame-dots">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                                <div className="frame-title">Scene 1 - Exterior</div>
                            </div>
                            <div className="frame-content">
                                <img src="https://i.pinimg.com/1200x/98/ec/06/98ec06dad207d96e5f11ab14d5a8b424.jpg" alt="Scene Background" className="frame-bg-image" />
                                <div className="grid-lines"></div>

                                {/* Scene Elements */}
                                <div className="scene-block block-1">
                                    <img src="https://i.pinimg.com/736x/09/d9/81/09d981fc8d9922147d20019fb08fd17f.jpg" alt="Camera A Scene" className="block-image" />
                                </div>
                                <div className="scene-block block-2">
                                    <img src="https://i.pinimg.com/1200x/7b/32/a7/7b32a7507c6d6c9aa2f51da007c13543.jpg" alt="Subject Scene" className="block-image" />
                                </div>
                            </div>

                            {/* Floating UI */}
                            <div className="floating-ui ui-timeline">
                                <div className="timeline-bar"></div>
                                <div className="timeline-cursor"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    {/* AI Card Removed */}

                    <div className="floating-card card-users">
                        <div className="user-avatar u1"></div>
                        <div className="user-avatar u2"></div>
                        <div className="user-avatar u3"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
