package com.blossem.reception_service.model;

import java.math.BigDecimal;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String email; // email to link with customer collection and reception collection
    private String[] services;
    private String date;
    private String time;
    private String staff;
    private String payment; // optional free-text amount or status

    @JsonProperty("total_payment")
    @Field("totalPayment")
    private BigDecimal totalPayment; // numeric amount synced to external collection

    @JsonProperty("customer_arrived")
    @Field("customer_arrived")
    private String customerArrived; // "Yes" or "No"

    @JsonProperty("payment_checked")
    @Field("payment_checked")
    private String paymentChecked; // "Yes" or "No"

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

    @JsonProperty("total_payment")
    public BigDecimal getTotalPayment() {
        return totalPayment;
    }

    @JsonProperty("total_payment")
    public void setTotalPayment(BigDecimal totalPayment) {
        this.totalPayment = totalPayment;
    }

    @JsonProperty("customer_arrived")
    public String getCustomerArrived() {
        return customerArrived;
    }

    @JsonProperty("customer_arrived")
    public void setCustomerArrived(String customerArrived) {
        this.customerArrived = customerArrived;
    }

    @JsonProperty("payment_checked")
    public String getPaymentChecked() {
        return paymentChecked;
    }

    @JsonProperty("payment_checked")
    public void setPaymentChecked(String paymentChecked) {
        this.paymentChecked = paymentChecked;
    }
}
