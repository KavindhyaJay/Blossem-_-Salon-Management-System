package com.salonapp.salonbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings") // payments are included in bookings
public class Payment {
    @Id
    private String id;
    private String customerEmail;
    private String staffEmail;
    private int totalPayment;
    private String payment;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getStaffEmail() { return staffEmail; }
    public void setStaffEmail(String staffEmail) { this.staffEmail = staffEmail; }
    public int getTotalPayment() { return totalPayment; }
    public void setTotalPayment(int totalPayment) { this.totalPayment = totalPayment; }
    public String getPayment() { return payment; }
    public void setPayment(String payment) { this.payment = payment; }
}
