package com.blossem.reception_service.DTO;

import jakarta.validation.constraints.NotBlank;

public class ReceptionAppointmentRequest {

    private String bookingId; // optional: if omitted create booking first

    @NotBlank
    private String email; // required: used to fetch customer name from customer collection

    private String customerName; // optional: will be fetched from customer collection if not provided

    private String[] services;

    @NotBlank
    private String date;

    @NotBlank
    private String time;

    private String staff;
    private String receptionNotes;
    private String amount; // payment amount/status (e.g., "2000", "Paid")
    private String payment; // payment status (e.g., "Paid", "Pending")
    private String customerArrived; // "Yes" or "No"
    private String receptionPaymentChecked; // "Yes" or "No"

    public ReceptionAppointmentRequest() {
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getReceptionNotes() {
        return receptionNotes;
    }

    public void setReceptionNotes(String receptionNotes) {
        this.receptionNotes = receptionNotes;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
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
}
