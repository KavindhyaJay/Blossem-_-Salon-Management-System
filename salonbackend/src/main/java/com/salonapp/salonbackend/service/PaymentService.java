package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.AppointmentDoc;
import com.salonapp.salonbackend.model.PaymentDoc;
import com.salonapp.salonbackend.repository.AppointmentRepo;
import com.salonapp.salonbackend.repository.PaymentRepo;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepo paymentRepo;
    private final AppointmentRepo appointmentRepo;

    public PaymentService(PaymentRepo paymentRepo, AppointmentRepo appointmentRepo) {
        this.paymentRepo = paymentRepo;
        this.appointmentRepo = appointmentRepo;
    }

    public PaymentDoc pay(PaymentDoc payment) {

        PaymentDoc saved = paymentRepo.save(payment);

        AppointmentDoc appointment =
                appointmentRepo.findById(payment.getAppointmentId()).orElseThrow();

        appointment.setPaymentStatus("PAID");
        appointmentRepo.save(appointment);

        return saved;
    }
}

