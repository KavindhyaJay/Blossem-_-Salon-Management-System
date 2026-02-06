import api from './api';

const RESOURCE = 'reception_appointments';

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const normalizeFlagValue = (value, fallback = 'No') => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    return value;
};

const normalizePaymentStatus = (value) => {
    if (value === undefined || value === null || value === '') {
        return 'Pending';
    }
    const normalized = value.toString().trim();
    if (!normalized) {
        return 'Pending';
    }
    const lower = normalized.toLowerCase();
    if (lower === 'paid') {
        return 'Paid';
    }
    if (lower === 'pending') {
        return 'Pending';
    }
    return normalized;
};

const normalizeAppointment = (raw = {}) => {
    const totalPayment = firstDefined(raw.totalPayment, raw.total_payment);
    const customerArrived = normalizeFlagValue(firstDefined(raw.customerArrived, raw.customer_arrived));
    const paymentStatus = normalizePaymentStatus(firstDefined(raw.paymentStatus, raw.payment));
    const paymentChecked = normalizeFlagValue(
        firstDefined(
            raw.paymentChecked,
            raw.payment_checked,
            raw.receptionPaymentChecked,
            raw.reception_payment_checked
        )
    );
    const notes = firstDefined(raw.receptionNotes, raw.reception_notes, raw.notes);

    return {
        ...raw,
        id: raw.id ?? raw._id ?? raw.bookingId ?? raw.booking_id,
        totalPayment,
        total_payment: totalPayment ?? raw.total_payment,
        customerArrived,
        customer_arrived: customerArrived,
        paymentStatus,
        payment: paymentStatus,
        paymentChecked,
        payment_checked: paymentChecked,
        receptionNotes: notes,
        notes,
    };
};

const normalizeResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map(normalizeAppointment);
    }
    if (data && typeof data === 'object') {
        return normalizeAppointment(data);
    }
    return data;
};

export const receptionService = {
    // Trigger backend sync from bookings
    syncFromBookings: async () => {
        const response = await api.post(`${RESOURCE}/sync-from-bookings`);
        return response.data;
    },

    // Get all appointments
    getAllAppointments: async () => {
        const response = await api.get(RESOURCE);
        return normalizeResponse(response.data);
    },

    // Get appointment by ID
    getAppointmentById: async (id) => {
        const response = await api.get(`${RESOURCE}/${id}`);
        return normalizeResponse(response.data);
    },

    // Create new appointment
    createAppointment: async (appointmentData) => {
        const response = await api.post(RESOURCE, appointmentData);
        return normalizeResponse(response.data);
    },

    // Update appointment
    updateAppointment: async (id, appointmentData) => {
        const response = await api.put(`${RESOURCE}/${id}`, appointmentData);
        return normalizeResponse(response.data);
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
        return normalizeResponse(response.data);
    },

    // Update payment status via booking id
    updatePaymentStatus: async (bookingId, status) => {
        const response = await api.post(`${RESOURCE}/booking/${bookingId}/payment?status=${encodeURIComponent(status)}`);
        return normalizeResponse(response.data);
    },

    // Update receptionist payment check flag
    updatePaymentCheck: async (appointmentId, paymentChecked) => {
        const response = await api.post(
            `${RESOURCE}/${appointmentId}/payment-check?paymentChecked=${encodeURIComponent(paymentChecked)}`
        );
        return normalizeResponse(response.data);
    },
};

