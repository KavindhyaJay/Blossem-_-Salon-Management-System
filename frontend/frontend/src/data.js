// src/data.js

export const SERVICE_CATEGORIES = [
  {
    id: 'nails',
    name: 'Nail Care & Art',
    description: 'Manicures, extensions, and custom art',
    items: [
      { id: 'n1', name: 'Classic Manicure', price: 2000, duration: '45 min' },
      { id: 'n2', name: 'Gel Polish Application', price: 3000, duration: '60 min' },
      { id: 'n3', name: 'Acrylic Extensions', price: 5500, duration: '120 min' },
      { id: 'n4', name: 'Nail Art (Per Finger)', price: 500, duration: '15 min' },
    ]
  },
  {
    id: 'hair',
    name: 'Hair Styling & Cuts',
    description: 'Cuts, blowdries, and treatments',
    items: [
      { id: 'h1', name: 'Ladies Cut & Blowdry', price: 4000, duration: '60 min' },
      { id: 'h2', name: 'Hair Botox Treatment', price: 12000, duration: '120 min' },
      { id: 'h3', name: 'Roots Coloring', price: 5000, duration: '90 min' },
    ]
  },
  {
    id: 'facial',
    name: 'Face & Skin',
    description: 'Rejuvenating facials and cleanup',
    items: [
      { id: 'f1', name: 'Clean Up', price: 3500, duration: '45 min' },
      { id: 'f2', name: 'Gold Facial', price: 6000, duration: '90 min' },
      { id: 'f3', name: 'Hydra Facial', price: 8500, duration: '90 min' },
    ]
  }
];

export const STAFF = [
  { 
    id: 1, 
    name: 'Tanya Dias', 
    role: 'Nail Artist', 
    specialties: ['nails'], // Links to category ID
    image: '/images/thinu.jpg' 
  },
  { 
    id: 2, 
    name: 'Katherine Lopez', 
    role: 'Senior Hair Stylist', 
    specialties: ['hair'], 
    image: '/images/sithara.jpg' 
  },
  { 
    id: 3, 
    name: 'Risty Murphy', 
    role: 'Skincare Specialist', 
    specialties: ['facial', 'nails'], // Can do multiple things
    image: '/images/rivish.jpg' 
  },
  { 
    id: 4, 
    name: 'Raisin Cooper', 
    role: 'Hair & Makeup', 
    specialties: ['hair', 'facial'], 
    image: '/images/sithara.jpg' 
  },
];

export const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];