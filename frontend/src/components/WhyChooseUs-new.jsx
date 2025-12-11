import React, { useEffect, useRef } from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
    const sectionRef = useRef(null);
    const imageBlockRef = useRef(null);
    const contentCardRef = useRef(null);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        if (imageBlockRef.current) {
            observer.observe(imageBlockRef.current);
        }
        if (contentCardRef.current) {
            observer.observe(contentCardRef.current);
        }

        return () => {
            if (imageBlockRef.current) {
                observer.unobserve(imageBlockRef.current);
            }
            if (contentCardRef.current) {
                observer.unobserve(contentCardRef.current);
            }
        };
    }, []);

    return (
        <section className="why-choose-us" ref={sectionRef}>
            <div className="container">
                {/* Header Section */}
                <div className="section-header">
                    <div className="subtitle-container">
                        <div className="decorative-line"></div>
                        <span className="subtitle">WHY SCENECRAFT</span>
                        <div className="decorative-line"></div>
                    </div>
                    <h2 className="section-title">
                        <span className="transform-word">Transform Your Ideas Into</span>
                        <span className="stories-word">Stunning Visual Stories</span>
                    </h2>
                    <p className="section-description">
                        SceneSync empowers creators, filmmakers, and storytellers to bring their visions to life
                        with our cutting-edge AI-powered scene generation technology. Create professional-quality
                        storyboards and scenes in seconds, not hours.
                    </p>
                </div>

                {/* Content Section */}
                <div className="content-grid">
                    {/* Left Column - Image Block */}
                    <div className="image-block" ref={imageBlockRef}>
                        <div className="image-container">
                            <img
                                src="https://i.pinimg.com/736x/c1/b4/39/c1b439680ba3153c82f90789b5704bb0.jpg"
                                alt="SceneSync AI Scene Generator"
                                className="product-image"
                            />
                            <div className="glow-effect"></div>
                        </div>
                    </div>

                    {/* Right Column - Content Card */}
                    <div className="content-card" ref={contentCardRef}>
                        <h3 className="card-title">Where Creativity Meets Technology</h3>
                        <p className="card-description">
                            Experience the future of visual storytelling with SceneSync's revolutionary AI engine.
                            Our platform combines advanced machine learning with intuitive design tools to deliver
                            breathtaking scenes that match your creative vision perfectly. Whether you are a filmmaker,
                            content creator, it empowers you to generate professional-quality
                            storyboards and scenes in seconds, not hours.
                        </p>
                        <div className="button-group">
                            <button className="btn-primary">
                                Start Creating
                            </button>
                            <button className="btn-secondary">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
