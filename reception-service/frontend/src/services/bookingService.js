import api from "./api";

export const fetchAll = () => api.get("/");
export const fetchByDate = (date) => api.get(`/date/${date}`);
export const createBooking = (data) => api.post("/", data);
export const updateBooking = (id, data) => api.put(`/${id}`, data);
export const deleteBooking = (id) => api.delete(`/${id}`);
export const markPaid = (id) => api.patch(`/${id}/paid`);
export const markPending = (id) => api.patch(`/${id}/pending`);
export const markReady = (id) => api.patch(`/${id}/ready`);
export const markComplete = (id) => api.patch(`/${id}/complete`);
export const assignStaff = (id, staff) => api.patch(`/${id}/assign?staff=${encodeURIComponent(staff)}`);
export const fetchByStatus = (status) => api.get(`/status/${status}`);
