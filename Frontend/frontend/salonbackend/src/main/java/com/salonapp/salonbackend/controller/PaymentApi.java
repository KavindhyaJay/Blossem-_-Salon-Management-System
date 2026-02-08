package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.PaymentDoc;
import com.salonapp.salonbackend.service.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentApi {

    private final PaymentService service;

    public PaymentApi(PaymentService service) {
        this.service = service;
    }

    @PostMapping
    public PaymentDoc pay(@RequestBody PaymentDoc payment) {
        return service.pay(payment);
    }
}
