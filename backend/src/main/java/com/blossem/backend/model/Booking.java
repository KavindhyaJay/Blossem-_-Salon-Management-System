package com.blossem.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String bookingId;
    private String email;
    private String customerName;
    private List<String> services; // Using List to hold multiple services
    private String date;
    private String time;
    private List<String>  staff;
    private double totalPayment;
    //private String payment; // e.g., "3000" or "Paid"

    public void setCustomerId(String customerId) {
    }
}