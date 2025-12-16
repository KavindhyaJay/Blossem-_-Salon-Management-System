import api from './api';

export const receptionService = {
    // Get all appointments
    getAllAppointments: async () => {
        const response = await api.get('/');
        return response.data;
    },

    // Get appointment by ID
    getAppointmentById: async (id) => {
        const response = await api.get(`/${id}`);
        return response.data;
    },

    // Create new appointment
    createAppointment: async (appointmentData) => {
        const response = await api.post('/', appointmentData);
        return response.data;
    },

    // Update appointment
    updateAppointment: async (id, appointmentData) => {
        const response = await api.put(`/${id}`, appointmentData);
        return response.data;
    },

    // Delete appointment
    deleteAppointment: async (id) => {
        await api.delete(`/${id}`);
    },

    // Mark customer as arrived
    markArrived: async (id, staffEmail = null) => {
        const url = staffEmail
            ? `/${id}/arrived?staffEmail=${encodeURIComponent(staffEmail)}`
            : `/${id}/arrived`;
        const response = await api.post(url);
        return response.data;
    },

    // Update payment check
    updatePaymentCheck: async (id, paymentChecked) => {
        const response = await api.post(`/${id}/payment-check?paymentChecked=${paymentChecked}`);
        return response.data;
    },
};

