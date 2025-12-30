import React from 'react';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e, section) => {
    e.preventDefault();
    console.log(`Navigating to: ${section}`);
    // You can add actual navigation logic here
  };

  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🌸</span>
              <h3>Salon Blossoms</h3>
            </div>
            <p className="footer-tagline">
              Elevating beauty experiences with professional care and attention to detail.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>Quick Links</h4>
              <button onClick={(e) => handleLinkClick(e, 'dashboard')} className="footer-link">
                Dashboard
              </button>
              <button onClick={(e) => handleLinkClick(e, 'appointments')} className="footer-link">
                Appointments
              </button>
              <button onClick={(e) => handleLinkClick(e, 'staff-management')} className="footer-link">
                Staff Management
              </button>
              <button onClick={(e) => handleLinkClick(e, 'services')} className="footer-link">
                Services
              </button>
            </div>

            <div className="link-group">
              <h4>Support</h4>
              <button onClick={(e) => handleLinkClick(e, 'help-center')} className="footer-link">
                Help Center
              </button>
              <button onClick={(e) => handleLinkClick(e, 'documentation')} className="footer-link">
                Documentation
              </button>
              <button onClick={(e) => handleLinkClick(e, 'contact-support')} className="footer-link">
                Contact Support
              </button>
              <button onClick={(e) => handleLinkClick(e, 'system-status')} className="footer-link">
                System Status
              </button>
            </div>

            <div className="link-group">
              <h4>Contact Us</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <span>Phone: +1 (555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <span>Email: support@salonblossoms.com</span>
                </div>
                <div className="contact-item">
                  <span>Address: 123 Beauty Street, City, State 12345</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} Salon Blossoms. All rights reserved.
          </div>
          <div className="footer-legal">
            <button onClick={(e) => handleLinkClick(e, 'privacy-policy')} className="legal-link">
              Privacy Policy
            </button>
            <button onClick={(e) => handleLinkClick(e, 'terms-of-service')} className="legal-link">
              Terms of Service
            </button>
            <button onClick={(e) => handleLinkClick(e, 'cookie-policy')} className="legal-link">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;