// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';
const api = axios.create({ baseURL: API_BASE_URL });

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =========== AUTH FUNCTIONS ===========
export const loginUser = async (email, password) => {
  try {
    // Try admin login
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, { email, password });
      saveUserData(response.data, 'ADMIN');
      return { ...response.data, role: 'ADMIN' };
    } catch {}
    
    // Try staff login
    try {
      const response = await axios.post(`${API_BASE_URL}/api/staff/auth/login`, { email, password });
      saveUserData(response.data, 'STAFF');
      return { ...response.data, role: 'STAFF' };
    } catch {}
    
    // Try reception login
    try {
      const response = await axios.post(`${API_BASE_URL}/api/reception/auth/login`, { email, password });
      saveUserData(response.data, 'RECEPTION');
      return { ...response.data, role: 'RECEPTION' };
    } catch {}
    
    throw new Error('Invalid email or password');
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

const saveUserData = (responseData, role) => {
  const userData = responseData.admin || responseData.staff || responseData.reception || {};
  
  localStorage.setItem('token', responseData.token);
  localStorage.setItem('user', JSON.stringify({
    id: userData.id,
    name: userData.name || 'User',
    email: userData.email,
    role: role
  }));
};

// =========== ADMIN FUNCTIONS ===========
export const adminAPI = {
  // Staff Management
  getStaff: () => api.get('/api/staff'),
  addStaff: (data) => api.post('/api/staff', data),
  updateStaff: (id, data) => api.put(`/api/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/api/staff/${id}`),
  
  // Reception Management
  getReception: () => api.get('/api/reception'),
  addReception: (data) => api.post('/api/reception', data),
  updateReception: (id, data) => api.put(`/api/reception/${id}`, data),
  deleteReception: (id) => api.delete(`/api/reception/${id}`),
  
  // Photo Review
  getPendingPhotos: () => api.get('/api/admin/photos?status=PENDING'),
  reviewPhoto: (photoId, approve, reason) => 
    api.put(`/api/admin/photos/${photoId}/review`, { approve, rejectionReason: reason }),
  
  // Calendar/Appointments
  getAppointmentsByDate: (date) => api.get(`/api/appointments/date/${date}`),
  getAllAppointments: () => api.get('/api/appointments'),
  
  // Statistics
  getPhotoStats: () => api.get('/api/admin/photos/stats'),
  getPendingCount: () => api.get('/api/admin/photos/pending-count'),
};

// =========== STAFF FUNCTIONS ===========
export const staffAPI = {
  // Profile
  getProfile: () => api.get('/api/staff/me'),
  
  // Photo Upload
  uploadPhoto: (formData) => api.post('/api/staff/photos/upload', formData),
  getMyPhotos: (status) => api.get(`/api/staff/photos/my-photos${status ? `?status=${status}` : ''}`),
  deletePhoto: (photoId) => api.delete(`/api/staff/photos/${photoId}`),
  
  // Appointments
  getTodayAppointments: () => api.get('/api/staff/appointments/today'),
  getAppointmentsByDate: (date) => api.get(`/api/staff/appointments/date/${date}`),
  updateAppointmentStatus: (id, status) => 
    api.put(`/api/staff/appointments/${id}/status`, { status }),
};

// =========== PUBLIC FUNCTIONS ===========
export const publicAPI = {
  getGallery: (category) => api.get(`/api/public/gallery${category ? `?category=${category}` : ''}`),
  getGalleryCategories: () => api.get('/api/public/gallery/categories'),
  getGalleryStaff: () => api.get('/api/public/gallery/staff'),
};

export default api;