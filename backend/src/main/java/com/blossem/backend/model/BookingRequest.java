package com.blossem.backend.model;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequest {
    private String name;
    private String phone;
    private String email;
    //private String username;
    //private String password;

    private List<String> services;
    private List<String> staff;
    private String date;
    private String time;
    private double totalPayment;
    //private String payment;
}
