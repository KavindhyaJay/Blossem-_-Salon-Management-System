import api from './api';

const RESOURCE = '/reception_appointments';

export const receptionService = {
    // Get all appointments
    getAllAppointments: async () => {
        const response = await api.get(RESOURCE);
        return response.data;
    },

    // Get appointment by ID
    getAppointmentById: async (id) => {
        const response = await api.get(`${RESOURCE}/${id}`);
        return response.data;
    },

    // Create new appointment
    createAppointment: async (appointmentData) => {
        const response = await api.post(RESOURCE, appointmentData);
        return response.data;
    },

    // Update appointment
    updateAppointment: async (id, appointmentData) => {
        const response = await api.put(`${RESOURCE}/${id}`, appointmentData);
        return response.data;
    },

    // Delete appointment
    deleteAppointment: async (id) => {
        await api.delete(`${RESOURCE}/${id}`);
    },

    // Mark customer as arrived
    markArrived: async (id, staffEmail = null) => {
        const url = staffEmail
            ? `${RESOURCE}/${id}/arrived?staffEmail=${encodeURIComponent(staffEmail)}`
            : `${RESOURCE}/${id}/arrived`;
        const response = await api.post(url);
        return response.data;
    },

    // Update payment check
    updatePaymentCheck: async (id, paymentChecked) => {
        const response = await api.post(`${RESOURCE}/${id}/payment-check?paymentChecked=${paymentChecked}`);
        return response.data;
    },
};

