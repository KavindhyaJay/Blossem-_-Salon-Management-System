import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL
    }),
    tagTypes: ['Appointments'],
    endpoints: (builder) => ({
        // Get all appointments
        getAllAppointments: builder.query({
            query: () => '/reception_appointments',
            providesTags: ['Appointments'],
        }),

        // Get single appointment
        getAppointmentById: builder.query({
            query: (id) => `/reception_appointments/${id}`,
        }),

        // Create new appointment
        createAppointments: builder.mutation({
            query: (appointmentData) => ({
                url: '/reception_appointments',
                method: 'POST',
                body: appointmentData,
            }),
            invalidatesTags: ['Appointments'],
        }),

        // Update appointment
        updateAppointment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/reception_appointments/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Appointments'],
        }),

        // Delete appointment
        deleteAppointment: builder.mutation({
            query: (id) => ({
                url: `/reception_appointments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Appointments'],
        }),
    }),
});

export const {
    useGetAllAppointmentsQuery,
    useGetAppointmentByIdQuery,
    useCreateAppointmentsMutation,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation,
} = api;