package com.blossem.reception_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "reception_appointments")
public class ReceptionAppointment {

    @Id
    private String id;

    private String email; // email to link with customer collection
    private String bookingId; // link to bookings collection (can be null if created by reception)
    private String customerName; // fetched from customer collection using email
    private String[] services;
    private String date;
    private String time;
    private String staff;
    private String payment; // payment status from booking (e.g., "Paid", "Pending")
    private String customerArrived; // "Yes" or "No"
    private String receptionPaymentChecked; // "Yes" or "No"
    private String receptionNotes;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public ReceptionAppointment() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String[] getServices() {
        return services;
    }

    public void setServices(String[] services) {
        this.services = services;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getStaff() {
        return staff;
    }

    public void setStaff(String staff) {
        this.staff = staff;
    }

    public String getPayment() {
        return payment;
    }

    public void setPayment(String payment) {
        this.payment = payment;
    }

    public String getCustomerArrived() {
        return customerArrived;
    }

    public void setCustomerArrived(String customerArrived) {
        this.customerArrived = customerArrived;
    }

    public String getReceptionPaymentChecked() {
        return receptionPaymentChecked;
    }

    public void setReceptionPaymentChecked(String receptionPaymentChecked) {
        this.receptionPaymentChecked = receptionPaymentChecked;
    }

    public String getReceptionNotes() {
        return receptionNotes;
    }

    public void setReceptionNotes(String receptionNotes) {
        this.receptionNotes = receptionNotes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
