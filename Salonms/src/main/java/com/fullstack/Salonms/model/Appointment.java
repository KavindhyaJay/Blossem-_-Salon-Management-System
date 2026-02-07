// File: Appointment.java - COMPLETELY UPDATED
package com.fullstack.Salonms.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reception_appointments")
public class Appointment {
    @Id
    private String id;

    // Fields from your database
    private String email;
    private String bookingId;
    private String customerName;
    private List<String> services;
    private String date; // Format: "2026-01-03"
    private String time; // Format: "10:00 AM"
    private String staff;

    // Payment fields - CHANGED from 'amount' to match database
    private Double totalPayment; // This is the actual payment field in your database
    private String payment; // "Paid", "Pending", etc.
    private String paymentChecked; // "Yes", "No"

    private String customer_arrived; // "Yes", "No"

    // Status fields
    private String bookingStatus; // e.g., CONFIRMED, CANCELLED, COMPLETED
    private String paymentStatus; // e.g., PENDING, PAID, PARTIAL

    private Date createdAt;
    private Date updatedAt;
    private String _class; // Keep this field

    // Constructors, getters and setters are handled by @Data annotation
    // But if you need custom ones:

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

    public List<String> getServices() {
        return services;
    }

    public void setServices(List<String> services) {
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

    public Double getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(Double totalPayment) {
        this.totalPayment = totalPayment;
    }

    public String getPayment() {
        return payment;
    }

    public void setPayment(String payment) {
        this.payment = payment;
    }

    public String getPaymentChecked() {
        return paymentChecked;
    }

    public void setPaymentChecked(String paymentChecked) {
        this.paymentChecked = paymentChecked;
    }

    public String getCustomer_arrived() {
        return customer_arrived;
    }

    public void setCustomer_arrived(String customer_arrived) {
        this.customer_arrived = customer_arrived;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String get_class() {
        return _class;
    }

    public void set_class(String _class) {
        this._class = _class;
    }
}