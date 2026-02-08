package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.service.PaymentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Appointment> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{bookingId}")
    public Appointment getPaymentByBooking(@PathVariable String bookingId) {
        return service.getPaymentByBookingId(bookingId);
    }

    @GetMapping("/status/{status}")
    public List<Appointment> getPaymentsByStatus(@PathVariable String status) {
        return service.getPaymentsByStatus(status);
    }

    @PostMapping("/confirm/{id}")
    public Appointment confirmPayment(@PathVariable String id) {
        Appointment a = service.getPaymentByBookingId(id);
        a.setPayment("PAID");
        return service.save(a);
    }

    @GetMapping("/hash/{bookingId}")
    public String getHash(@PathVariable String bookingId) {
        Appointment a = service.getPaymentByBookingId(bookingId);
        if (a == null)
            return "error";

        String merchantId = "121XXXX"; // Replace with your Merchant ID
        String merchantSecret = "YOUR_MERCHANT_SECRET"; // Replace with your Merchant Secret
        String orderId = bookingId;
        String amount = String.format("%.2f", a.getPrice());
        String currency = "LKR";

        // Hash generation logic: MD5(merchant_id + order_id + amount + currency +
        // MD5(merchant_secret))
        String merchantSecretMd5 = getMd5(merchantSecret).toUpperCase();
        String hash = getMd5(merchantId + orderId + amount + currency + merchantSecretMd5).toUpperCase();

        return hash;
    }

    @PostMapping("/notify")
    public void payhereNotify(@RequestParam("merchant_id") String merchant_id,
            @RequestParam("order_id") String order_id,
            @RequestParam("payhere_amount") String payhere_amount,
            @RequestParam("payhere_currency") String payhere_currency,
            @RequestParam("status_code") String status_code,
            @RequestParam("md5sig") String md5sig) {

        // Ideally, you should verify the md5sig here as well for security

        if ("2".equals(status_code)) { // 2 = success in PayHere
            Appointment a = service.getPaymentByBookingId(order_id);
            if (a != null) {
                a.setPayment("PAID");
                service.save(a);
            }
        }
    }

    private String getMd5(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            java.math.BigInteger no = new java.math.BigInteger(1, messageDigest);
            String hashtext = no.toString(16);
            while (hashtext.length() < 32) {
                hashtext = "0" + hashtext;
            }
            return hashtext;
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
