// src/components/Steps.js
import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Scissors, User, 
  Check, ChevronDown, ChevronUp, Search 
} from 'lucide-react';
import { SERVICE_CATEGORIES, STAFF, TIME_SLOTS } from '../data';

// --- Progress Bar ---
export const ProgressBar = ({ step }) => {
  if (step === 'HOME' || step === 'SUMMARY') return null;
  
  const steps = ['Services', 'Staff', 'Date', 'Time'];
  
  return (
    <div className="progress-container">
      {steps.map((label, index) => {
        let isActive = false;
        if (step === 'SERVICE' && index === 0) isActive = true;
        if (step === 'STAFF' && index === 1) isActive = true;
        if (step === 'DATE' && index === 2) isActive = true;
        if (step === 'TIME' && index === 3) isActive = true;
        
        return (
          <div key={label} className={`progress-step ${isActive ? 'active' : ''}`}>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- Home Step ---
export const Home = ({ onNext }) => (
  <div className="hero-section">
    <div className="hero-content">
      <h1 className="logo-text">Blossem <span className="text-red">Salon</span></h1>
      <h2>Premium Beauty & Excellence</h2>
      <p>Transform your look with our expert stylists in a luxurious setting.</p>
      <button className="btn-primary" onClick={() => onNext('METHOD')}>
        Book Appointment
      </button>
    </div>
  </div>
);

// --- Method Step ---
export const Method = ({ onNext, onBack, onUpdate }) => (
  <div className="step-container">
    <div className="header-row">
      <button className="btn-back" onClick={() => onBack('HOME')}>
        <ChevronLeft size={16}/> Back
      </button>
      <h2>Booking Method</h2>
      <div style={{width: 60}}></div>
    </div>
    
    <div className="card-grid-2">
      <div 
        className="card clickable" 
        onClick={() => { onUpdate('method', 'service'); onNext('SERVICE'); }}
      >
        <div className="icon-circle"><Scissors /></div>
        <h3>Book by Service</h3>
        <p>Select treatments first, then choose staff.</p>
      </div>
      
      <div 
        className="card clickable" 
        onClick={() => { onUpdate('method', 'staff'); onNext('STAFF'); }}
      >
        <div className="icon-circle"><User /></div>
        <h3>Book by Staff</h3>
        <p>Choose your favorite stylist first.</p>
      </div>
    </div>
  </div>
);

// --- Services Step (With Filtering Logic) ---
export const Services = ({ booking, onNext, onBack, onToggle }) => {
  const [expandedCat, setExpandedCat] = useState(null);

  const handleExpand = (id) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  // --- FILTER LOGIC ---
  let availableCategories = SERVICE_CATEGORIES;

  // If user booked by staff AND selected a specific person, only show their specialties
  if (booking.method === 'staff' && booking.staff && booking.staff.id !== 'any') {
    availableCategories = SERVICE_CATEGORIES.filter(category => 
      booking.staff.specialties.includes(category.id)
    );
  }

  return (
    <div className="step-container">
      <div className="header-row">
        <button className="btn-back" onClick={() => onBack('METHOD')}>
          <ChevronLeft size={16}/> Back
        </button>
        <h2>Select Treatments</h2>
        <div style={{width: 60}}></div>
      </div>

      {/* Show context if filtered by staff */}
      {booking.method === 'staff' && booking.staff && booking.staff.id !== 'any' && (
        <div style={{marginBottom: 15, fontSize: 14, color: '#666', background: '#f9f9f9', padding: 10, borderRadius: 8}}>
          Showing services provided by <strong>{booking.staff.name}</strong>
        </div>
      )}
      
      <div className="service-list">
        {availableCategories.map(category => (
          <div key={category.id} className="category-group">
            {/* Category Header */}
            <div className="category-header" onClick={() => handleExpand(category.id)}>
              <div>
                <h3>{category.name}</h3>
                <div className="category-desc">{category.description}</div>
              </div>
              {expandedCat === category.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {/* Sub-Services List */}
            {expandedCat === category.id && (
              <div className="sub-service-list">
                {category.items.map(item => {
                  const isSelected = booking.services.find(s => s.id === item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={`sub-service-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onToggle(item, category.id)} 
                    >
                      <div className="sub-service-info">
                        <h4>{item.name}</h4>
                        <div className="sub-service-meta">
                          {item.duration} • Rs {item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="check-box-circle">
                         {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {availableCategories.length === 0 && (
            <div style={{padding: 20, textAlign: 'center', color: '#888'}}>
                No services available for this selection.
            </div>
        )}
      </div>

      <div className="footer-action">
        {booking.services.length > 0 && (
           <button 
             className="btn-primary full-width" 
             // IF booked by staff -> Go to Date (skip staff selection)
             // IF booked by service -> Go to Staff (to pick who does them)
             onClick={() => onNext(booking.method === 'staff' ? 'DATE' : 'STAFF')}
           >
             Continue ({booking.services.length} selected)
           </button>
        )}
      </div>
    </div>
  );
};

// --- Staff Step ---
export const Staff = ({ booking, onNext, onBack, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedServiceId, setExpandedServiceId] = useState(booking.services[0]?.id || null);

  const toggleServiceAccordion = (id) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  // --- CASE 1: Book By Service (Accordion View) ---
  if (booking.method === 'service') {
    return (
      <div className="step-container">
        <div className="header-row">
          <button className="btn-back" onClick={() => onBack('SERVICE')}>
            <ChevronLeft size={16}/> Back
          </button>
          <h2>Select Staff</h2>
          <div style={{width: 60}}></div>
        </div>

        <div className="staff-list-container">
          {booking.services.map(service => {
            const relatedStaff = STAFF.filter(staff => 
              staff.specialties.includes(service.categoryId)
            );
            
            const isOpen = expandedServiceId === service.id;
            const currentSelection = booking.staff?.[service.id];

            return (
              <div key={service.id} className="service-staff-group">
                <div className="service-staff-header" onClick={() => toggleServiceAccordion(service.id)}>
                  <span>{service.name}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {isOpen && (
                  <div className="staff-selection-list">
                    {/* No Preference */}
                    <div 
                      className={`staff-card ${currentSelection?.id === 'any' ? 'selected' : ''}`}
                      onClick={() => { 
                         // IMPORTANT: Save as map: { serviceId: staffObject }
                         const updatedStaff = { ...booking.staff, [service.id]: {id: 'any', name: 'No Preference'} };
                         onUpdate('staff', updatedStaff);
                      }}
                    >
                      <div style={{
                        width: 45, height: 45, background: '#f0f0f0', borderRadius: '50%', 
                        display:'flex', alignItems:'center', justifyContent:'center', marginRight: 15
                      }}>
                        <User size={20} color="#666"/>
                      </div>
                      <div className="staff-details">
                        <h3>No Preference</h3>
                        <p>Any available specialist</p>
                      </div>
                    </div>

                    {/* Specific Staff */}
                    {relatedStaff.map(staff => (
                      <div 
                        key={staff.id} 
                        className={`staff-card ${currentSelection?.id === staff.id ? 'selected' : ''}`}
                        onClick={() => {
                           const updatedStaff = { ...booking.staff, [service.id]: staff };
                           onUpdate('staff', updatedStaff);
                        }}
                      >
                        <img src={staff.image} alt={staff.name} />
                        <div className="staff-details">
                          <h3>{staff.name}</h3>
                          <p>{staff.role}</p>
                        </div>
                      </div>
                    ))}
                    
                    {relatedStaff.length === 0 && (
                      <div style={{padding: 10, color: '#888', fontStyle: 'italic', fontSize: 13}}>
                        No specific specialists found for this service.
                      </div>
                    )}
                  </div>
                )}

                {!isOpen && (
                   <div className="selected-staff-preview" onClick={() => toggleServiceAccordion(service.id)}>
                      <div style={{display:'flex', alignItems:'center', gap: 10}}>
                         {currentSelection ? (
                            <>
                              {currentSelection.image ? (
                                <img src={currentSelection.image} alt="" style={{width: 30, height: 30, borderRadius: '50%'}}/>
                              ) : (
                                <User size={18} color="#666"/>
                              )}
                              <span style={{fontWeight: 500, fontSize: 14}}>{currentSelection.name}</span>
                            </>
                         ) : (
                           <span style={{color: '#888', fontSize: 14}}>Select a stylist...</span>
                         )}
                      </div>
                      <span style={{fontSize: 12, color: 'var(--primary-red)', fontWeight: 500}}>Change</span>
                   </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="footer-action">
           <button 
             className="btn-primary full-width" 
             onClick={() => onNext('DATE')}
           >
             Continue
           </button>
        </div>
      </div>
    );
  }

  // --- CASE 2: Book By Staff (Standard Search View) ---
  let availableStaff = STAFF;
  if (searchTerm) {
    availableStaff = availableStaff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  return (
    <div className="step-container">
      <div className="header-row">
        <button className="btn-back" onClick={() => onBack('METHOD')}>
          <ChevronLeft size={16}/> Back
        </button>
        <h2>Select Stylist</h2>
        <div style={{width: 60}}></div>
      </div>
      
      <div className="staff-search-wrapper" style={{marginBottom: 15, position: 'relative'}}>
        <Search size={18} style={{position: 'absolute', left: 12, top: 12, color: '#888'}} />
        <input 
          type="text" 
          placeholder="Search stylist..." 
          style={{width: '100%', padding: '10px 10px 10px 40px', borderRadius: 8, border: '1px solid #ddd'}}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="staff-list">
        <div 
           className={`staff-card ${booking.staff?.id === 'any' ? 'selected' : ''}`}
           onClick={() => { onUpdate('staff', {id: 'any', name: 'No Preference'}); onNext('SERVICE'); }}
        >
           <div style={{
             width: 50, height: 50, background: '#f0f0f0', borderRadius: '50%', 
             display:'flex', alignItems:'center', justifyContent:'center', marginRight: 15
           }}>
             <User size={24} color="#666"/>
           </div>
           <div className="staff-details">
             <h3>No Preference</h3>
             <p>Any available specialist</p>
           </div>
        </div>

        {availableStaff.map(staff => (
          <div 
            key={staff.id} 
            className={`staff-card ${booking.staff?.id === staff.id ? 'selected' : ''}`}
            onClick={() => { onUpdate('staff', staff); onNext('SERVICE'); }}
          >
            <img src={staff.image} alt={staff.name} />
            <div className="staff-details">
              <h3>{staff.name}</h3>
              <p>{staff.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Date Step ---
export const DateSelect = ({ onNext, onBack, onUpdate }) => {
  // 1. State to keep track of the month currently being viewed
  const [viewDate, setViewDate] = useState(new Date()); 
  
  // 2. Get "Today" to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

  // 3. Helper: Get formatted Month & Year (e.g., "February 2026")
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  // 4. Helper: Calculate how many days are in this specific month
  const daysInMonth = new Date(year, viewDate.getMonth() + 1, 0).getDate();

  // 5. Helper: Find out which day of the week the 1st of the month falls on (0=Sun, 1=Mon...)
  const firstDayOfMonth = new Date(year, viewDate.getMonth(), 1).getDay();

  // 6. Navigation Handlers
  const handlePrevMonth = () => {
    // Prevent going back past the current real month
    const prevMonthDate = new Date(year, viewDate.getMonth() - 1, 1);
    if (prevMonthDate.getMonth() < today.getMonth() && prevMonthDate.getFullYear() === today.getFullYear()) return;
    
    setViewDate(new Date(year, viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    // Construct the clicked date object
    const selectedDate = new Date(year, viewDate.getMonth(), day);
    
    // Check if it's in the past
    if (selectedDate < today) return;

    // Format YYYY-MM-DD for your backend
    const formattedDate = `${year}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    onUpdate('date', formattedDate);
    onNext('TIME');
  };

  return (
    <div className="step-container">
      <div className="header-row">
        <button className="btn-back" onClick={() => onBack('STAFF')}>
          <ChevronLeft size={16}/> Back
        </button>
        <h2>Select Date</h2>
        <div style={{width: 60}}></div>
      </div>
      
      <div className="calendar-mock">
        {/* Calendar Header with Navigation */}
        <div className="cal-header">
          <ChevronLeft 
            size={20} 
            onClick={handlePrevMonth} 
            style={{cursor: 'pointer', opacity: viewDate <= today ? 0.3 : 1}} 
          />
          <span>{monthName} {year}</span>
          <ChevronRight 
            size={20} 
            onClick={handleNextMonth} 
            style={{cursor: 'pointer'}} 
          />
        </div>

        <div className="cal-grid">
          {/* Day Names */}
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="cal-day-name">{d}</div>
          ))}

          {/* Empty Slots for days before the 1st of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="cal-day empty" />
          ))}

          {/* Actual Days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const checkDate = new Date(year, viewDate.getMonth(), day);
            const isPast = checkDate < today;
            const isSelected = false; // You can compare with booking.date if needed

            return (
              <div 
                key={day} 
                className={`cal-day ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => !isPast && handleDateClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Time Step (UPDATED NAV) ---
export const TimeSelect = ({ booking, onNext, onBack, onUpdate }) => (
  <div className="step-container">
    <div className="header-row">
      <button className="btn-back" onClick={() => onBack('DATE')}>
        <ChevronLeft size={16}/> Back
      </button>
      <h2>Select Time</h2>
      <div style={{width: 60}}></div>
    </div>
    
    <div className="time-grid">
      {TIME_SLOTS.map(time => (
        <button 
          key={time} 
          className={`time-btn ${booking.time === time ? 'selected' : ''}`}
          onClick={() => { onUpdate('time', time); }}
        >
          {time}
        </button>
      ))}
    </div>
    
    <div className="footer-action">
      {booking.time && (
         // UPDATED: Navigates directly to SUMMARY, skipping Info
         <button className="btn-primary full-width" onClick={() => onNext('SUMMARY')}>
           Continue
         </button>
      )}
    </div>
  </div>
);

// --- Summary Step ---
export const Summary = ({ booking, onBack, onCancel, onEdit }) => {
  const totalCost = booking.services.reduce((acc, curr) => acc + curr.price, 0);

  const handleConfirm = () => {
    // 1. Prepare Staff String
    let staffName = "No Preference";
    if (booking.method === 'staff') {
        staffName = booking.staff?.name || "No Preference";
    } else if (booking.method === 'service') {
        const staffList = booking.services.map(s => {
            const assigned = booking.staff?.[s.id];
            return `${s.name}: ${assigned?.name || "Any"}`;
        });
        staffName = staffList.join(', ');
    }

    // 2. Build Payload
    const payload = {
      name: booking.customer.name,
      phone: booking.customer.phone || "0000000000",
      email: booking.customer.email,
      username: booking.customer.username,
      password: booking.customer.password,
      services: booking.services.map(s => s.name),
      staff: staffName, 
      date: booking.date,
      time: booking.time,
      payment: totalCost.toString()
    };

    console.log("Sending Payload: - Steps.js:533", payload);

    // 3. Send to Backend
    fetch('http://localhost:8081/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error("Server Error");
        return response.json();
    })
    .then(data => {
        alert("Booking Confirmed! ID: " + data.bookingId);
        window.location.reload(); 
    })
    .catch(error => {
        console.error("Error: - Steps.js:550", error);
        alert("Booking Failed. Check console.");
    });
  };

  return (
    <div className="step-container">
       <div className="header-row">
        <button className="btn-back" onClick={() => onBack('TIME')}>
          <ChevronLeft size={16}/> Back
        </button>
        <h2>Booking Summary</h2>
        <div style={{width: 60}}></div>
      </div>
      
      <div className="summary-card">
        
        
        {/* Services */}
        <div className="summary-section">
          <h3>Services</h3>
          {booking.services.map(s => (
            <div key={s.id} className="summary-row">
              <span>{s.name}</span>
              <span>Rs {s.price.toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>Rs {totalCost.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Appointment (List View Support) */}
        <div className="summary-section">
           <h3>Appointment</h3>
           <p><strong>Date:</strong> {booking.date}</p>
           <p><strong>Time:</strong> {booking.time}</p>
           
           <div style={{marginTop: '12px'}}>
             <strong>Stylist(s):</strong>
             
             {/* CASE 1: Booked by Staff */}
             {booking.method === 'staff' && (
                <p style={{margin: '5px 0 0 0', color: '#333'}}>
                  {booking.staff?.name || "No Preference"}
                </p>
             )}

             {/* CASE 2: Booked by Service */}
             {booking.method === 'service' && (
                <ul style={{margin: '8px 0 0 0', padding: 0, listStyle: 'none'}}>
                  {booking.services.map(service => {
                    const assignedStaff = booking.staff?.[service.id];
                    return (
                      <li key={service.id} style={{
                          fontSize: '14px', 
                          marginBottom: '6px', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          borderBottom: '1px dashed #eee',
                          paddingBottom: '4px'
                      }}>
                        <span style={{color: '#7a7979', fontWeight: 700, fontSize: '15px'}}>{service.name}</span>
                        <span style={{fontWeight: 700, color: '#7a7979', fontSize: '15px'}}>
                          {assignedStaff?.name || "No Preference"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
             )}
           </div>
        </div>
        
        <div className="summary-actions">
          <button className="btn-success full-width" onClick={handleConfirm}>
            Confirm Booking
          </button>
          
          <button 
            className="btn-outline full-width" 
            style={{marginTop: '5px',marginBottom: '10px', color: '#007bff', borderColor: '#007bff'}}
            onClick={onEdit}
          >
            Edit Booking Details
          </button>

          <div className="secondary-actions">
            <button className="btn-outline text-red" onClick={onCancel}>
              Cancel & Exit...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};