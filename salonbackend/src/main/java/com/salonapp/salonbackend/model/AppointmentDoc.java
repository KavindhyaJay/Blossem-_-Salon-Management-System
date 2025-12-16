package com.salonapp.salonbackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "bookings")
public class AppointmentDoc {

    @Id
    private String id;

    private String email;
    private String customerName;

    private List<String> services;

    private String date;
    private String time;
    private String staff;

    private String bookingStatus;   // BOOKED, CUSTOMER_ARRIVED
    private String paymentStatus;   // PAID, PENDING
}
