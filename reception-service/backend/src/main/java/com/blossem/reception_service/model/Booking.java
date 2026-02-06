package com.blossem.reception_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonAlias;
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
    @JsonProperty("paymentStatus")
    @JsonAlias({ "payment" })
    @Field("payment")
    private String paymentStatus; // Paid or Pending indicator

    @JsonProperty("total_payment")
    @Field("totalPayment")
    private Double totalPayment; // numeric amount synced to external collection

    @JsonProperty("customer_arrived")
    @Field("customer_arrived")
    private String customerArrived; // "Yes" or "No"

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

    @JsonProperty("paymentStatus")
    public String getPaymentStatus() {
        return paymentStatus;
    }

    @JsonProperty("paymentStatus")
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    @JsonProperty("total_payment")
    public Double getTotalPayment() {
        return totalPayment;
    }

    @JsonProperty("total_payment")
    public void setTotalPayment(Double totalPayment) {
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

}
