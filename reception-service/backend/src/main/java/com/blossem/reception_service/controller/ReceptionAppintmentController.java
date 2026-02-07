package com.blossem.reception_service.controller;

import com.blossem.reception_service.DTO.ReceptionAppointmentRequest;
import com.blossem.reception_service.model.ReceptionAppointment;
import com.blossem.reception_service.service.ReceptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reception_appointments")
@CrossOrigin
public class ReceptionAppintmentController {

    private final ReceptionService service;

    public ReceptionAppintmentController(ReceptionService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReceptionAppointment> listAll() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public ReceptionAppointment getOne(@PathVariable String id) {
        return service.getById(id);
    }

    /**
     * Create reception appointment. If bookingId is null, this endpoint will create
     * a booking first.
     */
    @PostMapping
    public ReceptionAppointment create(@RequestBody ReceptionAppointmentRequest req) {
        return service.createFromRequest(req);
    }

    /**
     * Create reception appointment from an existing booking (by booking id).
     * Optionally provide email as query parameter to fetch customer name from
     * customer collection.
     */
    @PostMapping("/from-booking/{bookingId}")
    public ReceptionAppointment createFromBooking(@PathVariable String bookingId,
            @RequestParam(required = false) String email) {
        return service.createFromExistingBooking(bookingId, email);
    }

    @PutMapping("/{id}")
    public ReceptionAppointment update(@PathVariable String id, @RequestBody ReceptionAppointmentRequest req) {
        return service.update(id, req);
    }

    /**
     * Mark customer as arrived by reception appointment ID.
     * Updates customerArrived to "Yes" in reception_appointments and bookingStatus
     * in bookings.
     * Optional staffEmail used to notify staff via email.
     */
    @PostMapping("/{id}/arrived")
    public ReceptionAppointment markArrived(@PathVariable String id,
            @RequestParam(required = false) String staffEmail) {
        return service.markArrivedById(id, staffEmail);
    }

    /**
     * Mark booking as arrived: updates bookings.bookingStatus and
     * reception_appointments.customerArrived.
     * Optional staffEmail used to notify staff.
     */
    @PostMapping("/booking/{bookingId}/arrived")
    public ReceptionAppointment markArrivedByBooking(@PathVariable String bookingId,
            @RequestParam(required = false) String staffEmail) {
        return service.markArrivedByBookingId(bookingId, staffEmail);
    }

    /**
     * Update payment by bookingId (updates both booking and reception appointment)
     */
    @PostMapping("/booking/{bookingId}/payment")
    public ReceptionAppointment updatePayment(@PathVariable String bookingId,
            @RequestParam String status) {
        return service.updatePaymentStatusByBookingId(bookingId, status);
    }

    /**
     * Update paymentChecked flag for a reception appointment by ID.
     */
    @PostMapping("/{id}/payment-check")
    public ReceptionAppointment updatePaymentCheck(@PathVariable String id,
            @RequestParam String paymentChecked) {
        return service.updatePaymentChecked(id, paymentChecked);
    }

    /**
     * Bulk-sync reception appointments from the bookings collection.
     */
    @PostMapping("/sync-from-bookings")
    public ReceptionService.SyncSummary syncFromBookings() {
        return service.syncBookingsIntoReception();
    }

    @PostMapping("/deduplicate")
    public ReceptionService.DedupSummary deduplicate() {
        return service.deduplicateAppointments();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
