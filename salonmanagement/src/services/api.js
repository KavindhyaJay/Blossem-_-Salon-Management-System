// src/services/api.js
const API_BASE_URL = 'http://localhost:8081/api';

export const staffAPI = {
  // Get all staff from Spring Boot backend
  getAllStaff: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error - getAllStaff:', error);
      throw error;
    }
  },

  // Add new staff to Spring Boot
  addStaff: async (staffData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error - addStaff:', error);
      throw error;
    }
  },

  // Update staff in Spring Boot - SIMPLE VERSION
  updateStaff: async (id, staffData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error - updateStaff:', error);
      throw error;
    }
  },

  // Delete staff from Spring Boot - SIMPLE VERSION
  deleteStaff: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error - deleteStaff:', error);
      throw error;
    }
  },
};