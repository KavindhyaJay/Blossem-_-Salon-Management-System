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
  
  // Define initial state separately so we can reuse it for resetting
  const initialBookingState = {
    method: null,      
    services: [],      
    staff: {},       
    date: null,        
    time: null,        
    customer: { 
      name: '', 
      email: '', 
      phone: '', 
      username: '', 
      password: '' 
    }
  };

  const [booking, setBooking] = useState(initialBookingState);

  // Navigation Handlers
  const handleNext = (nextStep) => setStep(nextStep);
  const handleBack = (prevStep) => setStep(prevStep);
  
  // --- NEW RESET HANDLER ---
  const handleCancel = () => {
    // 1. Clear all data
    setBooking(initialBookingState);
    // 2. Go back to Home
    setStep('HOME');
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
        <div className="logo" onClick={handleCancel}> {/* Clicking Logo also resets now */}
          <div style={{background: 'var(--primary-red)', padding: 6, borderRadius: 8, marginRight: 8, display: 'flex'}}>
            <Scissors size={20} color="white"/>
          </div>
          Blossem<span>Salon</span>
        </div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#reviews">Reviews</a>
          <a href="#location">Location</a>
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
        
        {/* Step 8: Final Summary & Confirmation */}
        {step === 'SUMMARY' && (
          <Summary 
            booking={booking} 
            onBack={handleBack} 
            onCancel={handleCancel}  // <--- Passed the new reset function here
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