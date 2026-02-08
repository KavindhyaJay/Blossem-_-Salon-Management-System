package com.salonapp.salonbackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "payments")
public class PaymentDoc {

    @Id
    private String id;

    private String appointmentId;   // link to booking
    private String customerEmail;   // link to customer

    private double amount;
    private String paymentMethod;   // PAYHERE, CASH
    private String paymentStatus;   // PAID, FAILED

    private String transactionId;
}
