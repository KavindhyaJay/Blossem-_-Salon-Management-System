import React, { useState } from 'react';
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa6";
import { Scissors } from 'lucide-react';
import './App.css'; 
import { 
  Home, Method, Services, Staff, DateSelect, 
  TimeSelect, Info, Summary, ProgressBar 
} from './components/Steps';

function App() {
  const [step, setStep] = useState('HOME');
  
  // Define initial state
  const initialBookingState = {
    method: null,      
    services: [],      
    staff: {},       
    date: null,        
    time: null,        
    customer: { 
      name: '', 
      email: '', 
      phone: '' 
    }
  };

  const [booking, setBooking] = useState(initialBookingState);

  // Navigation Handlers
  const handleNext = (nextStep) => setStep(nextStep);
  const handleBack = (prevStep) => setStep(prevStep);
  
  // --- RESET HANDLER ---
  const handleCancel = () => {
    setBooking(initialBookingState);
    setStep('HOME');
    window.scrollTo(0, 0); // Scroll to top when cancelling
  };

  // --- SMART SCROLL HANDLER ---
  const handleNavClick = (e, sectionId) => {
    e.preventDefault(); // Stop default anchor jump

    // 1. If we are NOT on Home, go to Home first
    if (step !== 'HOME') {
      setStep('HOME');
      
      // Wait 100ms for React to render the Home component, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // 2. If we are already on Home, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const updateBooking = (key, value) => {
    setBooking(prev => ({ ...prev, [key]: value }));
  };

  const toggleService = (serviceItem, categoryId) => {
    const exists = booking.services.find(s => s.id === serviceItem.id);
    
    if (exists) {
      updateBooking('services', booking.services.filter(s => s.id !== serviceItem.id));
    } else {
      const serviceWithCategory = { ...serviceItem, categoryId };
      updateBooking('services', [...booking.services, serviceWithCategory]);
    }
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="logo" onClick={handleCancel}> 
          <div style={{background: 'var(--primary-red)', padding: 6, borderRadius: 8, marginRight: 8, display: 'flex'}}>
            <Scissors size={20} color="white"/>
          </div>
          Blossem<span>Salon</span>
        </div>
        
        {/* UPDATED NAV LINKS */}
        <div className="nav-links">
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
          <a href="#reviews" onClick={(e) => handleNavClick(e, 'reviews')}>Reviews</a>
          <a href="#locations" onClick={(e) => handleNavClick(e, 'locations')}>Location</a>
        </div>
      </nav>

      <ProgressBar step={step} />
      
      <div className="main-content">
        {step === 'HOME' && <Home onNext={handleNext} />}
        
        {step === 'METHOD' && (
          <Method onNext={handleNext} onBack={handleBack} onUpdate={updateBooking} />
        )}
        
        {step === 'SERVICE' && (
          <Services 
            booking={booking} 
            onNext={handleNext} 
            onBack={handleBack} 
            onToggle={toggleService} 
          />
        )}
        
        {step === 'STAFF' && (
          <Staff 
            booking={booking} 
            onNext={handleNext} 
            onBack={handleBack} 
            onUpdate={updateBooking} 
          />
        )}
        
        {step === 'DATE' && (
          <DateSelect 
            onNext={handleNext} 
            onBack={handleBack} 
            onUpdate={updateBooking} 
          />
        )}
        
        {step === 'TIME' && (
          <TimeSelect 
            booking={booking} 
            onNext={handleNext} 
            onBack={handleBack} 
            onUpdate={updateBooking} 
          />
        )}
        
        {step === 'INFO' && (
          <Info 
            booking={booking} 
            onNext={handleNext} 
            onBack={handleBack} 
            onUpdate={updateBooking} 
          />
        )}
        
        {step === 'SUMMARY' && (
          <Summary 
            booking={booking} 
            onBack={handleBack} 
            onCancel={handleCancel}
            onEdit={() => setStep('METHOD')} 
          />
        )}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="socials">
            <span><FaInstagram className="icon" /> Instagram</span>
            <span><FaFacebook className="icon" /> Facebook</span>
            <span><FaTwitter className="icon" /> Twitter</span>
          </div>
          <p>© 2025 Blossem Salon. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;