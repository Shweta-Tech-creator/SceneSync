import React, { useState } from 'react';
import axios from 'axios';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === 'email' ? 'email' : e.target.type === 'text' && e.target.placeholder === 'Subject' ? 'subject' : e.target.placeholder === 'Your Name' ? 'name' : 'message']: e.target.value
    });
  };

  // Improved handleChange to be more robust based on name attribute which we should add
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      // Using relative path assuming proxy or same origin, otherwise needs process.env.REACT_APP_API_URL or similar
      // But based on server.js cors config: origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174']
      // The generic practice here without a configured axios instance is often to trust the proxy or hardcode for dev if needed.
      // Given the user context, let's try a direct call or rely on a base URL if we knew one.
      // Looking at other files might help but standard practice is /api/...
      // Let's assume the backend runs on port 3000 as seen in server.js.
      // The frontend likely runs on 5173.
      // We should use the full URL if we aren't sure about proxy, or relative if there is a proxy.
      // Let's check if there's a config. Assuming localhost:3000 for now based on server.js

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Common Vite pattern

      await axios.post(`${API_URL}/api/contact`, formData);

      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (err) {
      console.error('Contact form error:', err);
      setStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || 'Something went wrong. Please try again.'
      });
    }
  };

  return (
    <>
      <section id="contact" className="contact-section">
        {/* Contact Us Header - Outside Container */}
        <div className="contact-header-external">
          <h1 className="contact-title-external">
            <span className="contact-word">Contact</span>
            <span className="us-word"> Us</span>
          </h1>
        </div>

        <div className="contact-wrapper">
          <div className="contact-container">
            {/* Left Column - Contact Form */}
            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleSubmit}>
                {status.success && (
                  <div className="alert success-alert" style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                    Message sent successfully!
                  </div>
                )}
                {status.error && (
                  <div className="alert error-alert" style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {status.error}
                  </div>
                )}

                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={status.loading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={status.loading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={status.loading}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    className="form-input form-textarea"
                    placeholder="Your Message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={status.loading}
                  ></textarea>
                </div>
                <button type="submit" className="send-button" disabled={status.loading}>
                  {status.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Right Column - Contact Info */}
            <div className="contact-info-container">
              <div className="contact-header">
                <h2 className="contact-title">Get In Touch</h2>
                <p className="contact-description">
                  We'd love to hear from you. Whether you have a question about our services,
                  pricing, or anything else, our team is ready to answer all your questions.
                </p>
              </div>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <div className="contact-text">
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="contact-text">
                    <h4>Email Us</h4>
                    <p>hello@scenecraft.ai</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  </div>
                  <div className="contact-text">
                    <h4>Website</h4>
                    <p>www.scenecraft.ai</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="contact-text">
                    <h4>Address</h4>
                    <p>123 Creative Street, Design City, DC 12345</p>
                  </div>
                </div>
              </div>

              <div className="social-section">
                <p className="social-title">Follow Us On</p>
                <div className="social-icons">
                  <div className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                  <div className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                  </div>
                  <div className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Image - Outside Grid */}
          <img
            src="https://i.pinimg.com/1200x/64/ac/69/64ac69c1c1c8b9c088528a54b21ab5ac.jpg"
            alt="Contact Us Background"
            className="contact-image-standalone"
          />
        </div>
      </section>

      {/* Premium Footer Section */}
      <footer className="premium-footer">
        <div className="footer-container">
          {/* Main Footer Content */}
          <div className="footer-main">
            {/* Left Side - Brand & Newsletter */}
            <div className="footer-left">
              <div className="brand-section">
                <div className="brand-logo">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="#FFD447" />
                    <path d="M8 12h16v8H8V12z" fill="#0a1f35" />
                    <circle cx="12" cy="16" r="2" fill="#FFD447" />
                    <circle cx="20" cy="16" r="2" fill="#FFD447" />
                  </svg>
                </div>
                <h3 className="brand-name">SceneSync</h3>
              </div>

              <div className="newsletter-section">
                <p className="newsletter-text">Subscribe to our newsletter for updates and tips</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email" className="newsletter-input" />
                  <button className="newsletter-button">Subscribe</button>
                </div>
              </div>
            </div>

            {/* Right Side - Links Columns */}
            <div className="footer-right">
              <div className="footer-column">
                <h4 className="column-title">Features</h4>
                <ul className="column-links">
                  <li><a href="#" className="footer-link">AI Scene Generation</a></li>
                  <li><a href="#" className="footer-link">Storyboard Creation</a></li>
                  <li><a href="#" className="footer-link">Team Collaboration</a></li>
                  <li><a href="#" className="footer-link">Export Options</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="column-title">Hours</h4>
                <ul className="column-links">
                  <li><span className="footer-link">Mon-Fri: 9AM-6PM</span></li>
                  <li><span className="footer-link">Saturday: 10AM-4PM</span></li>
                  <li><span className="footer-link">Sunday: Closed</span></li>
                  <li><span className="footer-link">Support: 24/7</span></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="column-title">Follow Us</h4>
                <div className="social-icons">
                  <a href="#" className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: '#ffffff' }}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" style={{ fill: '#ffffff' }} />
                    </svg>
                  </a>
                  <a href="#" className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: '#ffffff' }}>
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" style={{ fill: '#ffffff' }} />
                    </svg>
                  </a>
                  <a href="#" className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: '#ffffff' }}>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" style={{ fill: '#ffffff' }} />
                    </svg>
                  </a>
                  <a href="#" className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: '#ffffff' }}>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" style={{ fill: '#ffffff' }} />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className="footer-divider"></div>

          {/* Bottom Footer Bar */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p className="copyright">© 2024 SceneSync. All rights reserved.</p>
            </div>
            <div className="footer-bottom-right">
              <a href="#" className="footer-link-small">Privacy Policy</a>
              <a href="#" className="footer-link-small">Terms of Service</a>
              <a href="#" className="footer-link-small">Cookies Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ContactUs;
