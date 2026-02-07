package com.blossem.backend.service;

import com.blossem.backend.model.*;
import com.blossem.backend.repository.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Booking processBooking(BookingRequest request) {

        // 1️⃣ SAVE CUSTOMER
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());

        Customer savedCustomer = customerRepository.save(customer);

        // 2️⃣ SAVE LOGIN FOR THIS CUSTOMER
        Login login = new Login();
        login.setEmail(request.getEmail());
        login.setUsername(request.getUsername());
        login.setPassword(passwordEncoder.encode(request.getPassword()));

        loginRepository.save(login);

        double totalPayment = 0;

        for (String service : request.getServices()) {
            switch (service) {
                case "Nail Art" -> totalPayment += 3000;
                case "Hair Styling" -> totalPayment += 2500;
                case "Spa Treatment" -> totalPayment += 5000;
                case "facial" -> totalPayment += 3500;
                case "Professional Makeup" -> totalPayment += 4000;
                case "hair cut" -> totalPayment += 6000;
                case "hair color" -> totalPayment += 9000;
            }
        }

        // 3️⃣ SAVE BOOKING FOR THIS CUSTOMER
        Booking booking = new Booking();
        booking.setEmail(request.getEmail());
        booking.setServices(request.getServices());
        booking.setStaff(request.getStaff());
        booking.setDate(request.getDate());
        booking.setTime(request.getTime());
        booking.setTotalPayment(totalPayment);
        booking.setPayment(request.getPayment());

        return bookingRepository.save(booking);
    }
}
