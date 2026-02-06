import api from "./api";

const RESOURCE = "bookings";

export const fetchAll = () => api.get(RESOURCE);
export const fetchByDate = (date) => api.get(`${RESOURCE}/date/${date}`);
export const createBooking = (data) => api.post(RESOURCE, data);
export const updateBooking = (id, data) => api.put(`${RESOURCE}/${id}`, data);
export const deleteBooking = (id) => api.delete(`${RESOURCE}/${id}`);
export const markPaid = (id) => api.patch(`${RESOURCE}/${id}/paid`);
export const markPending = (id) => api.patch(`${RESOURCE}/${id}/pending`);
export const markReady = (id) => api.patch(`${RESOURCE}/${id}/ready`);
export const markComplete = (id) => api.patch(`${RESOURCE}/${id}/complete`);
export const assignStaff = (id, staff) =>
    api.patch(`${RESOURCE}/${id}/assign?staff=${encodeURIComponent(staff)}`);
export const fetchByStatus = (status) => api.get(`${RESOURCE}/status/${status}`);
