package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Booking;
import com.salonapp.salonbackend.service.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping("/hash/{bookingId}")
    public String getHash(@PathVariable String bookingId) {
        Booking b = service.getPaymentByBookingId(bookingId);
        if (b == null)
            return "error";

        String merchantId = "1233947"; // Update this with your Merchant ID
        String merchantSecret = "MzYwMzQxNTMxNzM4OTQ1MTc0Mjk4ODU1NDQ5OTA5OTg3NTkxNDA="; // Update this
        String orderId = bookingId;
        String amount = String.format("%.2f", b.getTotalPayment());
        String currency = "LKR";

        String merchantSecretMd5 = getMd5(merchantSecret).toUpperCase();
        String hash = getMd5(merchantId + orderId + amount + currency + merchantSecretMd5).toUpperCase();

        return hash;
    }

    private String getMd5(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            java.math.BigInteger no = new java.math.BigInteger(1, messageDigest);
            String hashtext = no.toString(16);
            while (hashtext.length() < 32)
                hashtext = "0" + hashtext;
            return hashtext;
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
