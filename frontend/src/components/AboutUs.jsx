import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-header">
          <h2 className="about-title">About SceneSync</h2>
          <p className="about-subtitle">
            We're pioneering the next generation of creative tools with our revolutionary AI-powered scene design platform. Built by creators for creators, SceneSync combines cutting-edge artificial intelligence with intuitive design principles to deliver an unparalleled creative experience. Our platform enables teams to collaborate in real-time, streamline workflows, and bring imaginative visions to life with unprecedented speed and precision.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-cards">
            <div className="about-card card-top-left">
              <div className="card-circle"></div>
              <div className="card-content">
                <h3 className="card-title">Innovation</h3>
                <p className="card-description">
                  Our advanced AI algorithms understand creative intent, suggesting intelligent compositions and automating complex design tasks. Machine learning models trained on millions of professional scenes provide context-aware recommendations that enhance rather than replace human creativity.
                </p>
              </div>
            </div>

            <div className="about-card card-top-right">
              <div className="card-circle"></div>
              <div className="card-content">
                <h3 className="card-title">Collaboration</h3>
                <p className="card-description">
                  Real-time synchronization allows teams to work together seamlessly from anywhere in the world. Live cursors, instant updates, and version control ensure everyone stays on the same page. Built-in communication tools and shared workspaces make remote collaboration feel like you're in the same room.
                </p>
              </div>
            </div>

            <div className="about-card card-bottom-left">
              <div className="card-circle"></div>
              <div className="card-content">
                <h3 className="card-title">Performance</h3>
                <p className="card-description">
                  Optimized rendering pipelines deliver lightning-fast performance even with complex scenes. Our cloud infrastructure scales automatically to handle demanding projects, while intelligent caching and predictive loading ensure smooth interactions. Experience professional-grade speed without compromising quality.
                </p>
              </div>
            </div>

            <div className="about-card card-bottom-right">
              <div className="card-circle"></div>
              <div className="card-content">
                <h3 className="card-title">Security</h3>
                <p className="card-description">
                  Enterprise-grade encryption protects your creative assets at every stage. SOC 2 compliance, regular security audits, and advanced threat detection ensure your work remains confidential. Role-based access controls and detailed audit trails provide complete visibility and control over your projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
