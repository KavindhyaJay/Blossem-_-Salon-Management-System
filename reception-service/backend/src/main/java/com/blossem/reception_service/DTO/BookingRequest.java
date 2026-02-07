package com.blossem.reception_service.DTO;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public class BookingRequest {

    @NotBlank
    private String customerName;

    private String email; // optional: if provided, will create reception appointment

    private String[] services;

    @NotBlank
    private String date;

    @NotBlank
    private String time;

    private String staff;
    private String staffEmail;

    @JsonProperty("paymentStatus")
    @JsonAlias({ "payment" })
    private String paymentStatus; // optional

    private Double totalPayment; // optional numeric amount
    private Boolean createReceptionAppointment = Boolean.TRUE;

    public BookingRequest() {
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public String getStaffEmail() {
        return staffEmail;
    }

    public void setStaffEmail(String staffEmail) {
        this.staffEmail = staffEmail;
    }

    @JsonProperty("paymentStatus")
    public String getPaymentStatus() {
        return paymentStatus;
    }

    @JsonProperty("paymentStatus")
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Double getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(Double totalPayment) {
        this.totalPayment = totalPayment;
    }

    public Boolean getCreateReceptionAppointment() {
        return createReceptionAppointment;
    }

    public void setCreateReceptionAppointment(Boolean createReceptionAppointment) {
        this.createReceptionAppointment = createReceptionAppointment;
    }
}
