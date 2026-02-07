package com.salonapp.salonbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "bookings")
public class Appointment {

    @Id
    private String id;

    private String email;         // Customer email
    private List<String> services;
    private String date;
    private String time;
    private String staff;
    private String staffEmail;    // Staff email
    private int totalPayment;
    private String payment;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getServices() { return services; }
    public void setServices(List<String> services) { this.services = services; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getStaff() { return staff; }
    public void setStaff(String staff) { this.staff = staff; }

    public String getStaffEmail() { return staffEmail; }
    public void setStaffEmail(String staffEmail) { this.staffEmail = staffEmail; }

    public int getTotalPayment() { return totalPayment; }
    public void setTotalPayment(int totalPayment) { this.totalPayment = totalPayment; }

    public String getPayment() { return payment; }
    public void setPayment(String payment) { this.payment = payment; }
}
