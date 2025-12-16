package com.blossem.reception_service.service;

import com.blossem.reception_service.DTO.ReceptionAppointmentRequest;
import com.blossem.reception_service.model.Booking;
import com.blossem.reception_service.model.Customer;
import com.blossem.reception_service.model.ReceptionAppointment;
import com.blossem.reception_service.model.BookingStatus;
import com.blossem.reception_service.model.PaymentStatus;
import com.blossem.reception_service.repository.BookingRepository;
import com.blossem.reception_service.repository.CustomerRepository;
import com.blossem.reception_service.repository.ReceptionAppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ReceptionService {

    private final ReceptionAppointmentRepository repo;
    private final BookingRepository bookingRepo;
    private final CustomerRepository customerRepo;
    private final EmailService emailService;

    public ReceptionService(ReceptionAppointmentRepository repo,
            BookingRepository bookingRepo,
            CustomerRepository customerRepo,
            EmailService emailService) {
        this.repo = repo;
        this.bookingRepo = bookingRepo;
        this.customerRepo = customerRepo;
        this.emailService = emailService;
    }

    public List<ReceptionAppointment> listAll() {
        return repo.findAll();
    }

    public ReceptionAppointment getById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reception appointment not found: " + id));
    }

    /**
     * Fetch customer name from customer collection using email.
     * If customer not found, throw an exception or use provided customerName as
     * fallback.
     */
    private String fetchCustomerName(String email, String fallbackName) {
        Optional<Customer> customerOpt = customerRepo.findByEmail(email);
        if (customerOpt.isPresent()) {
            return customerOpt.get().getName();
        }
        // If customer not found but fallback name provided, use it
        if (fallbackName != null && !fallbackName.isBlank()) {
            return fallbackName;
        }
        throw new RuntimeException("Customer not found with email: " + email + " and no customer name provided");
    }

    // Create reception appointment from request
    @Transactional
    public ReceptionAppointment createFromRequest(ReceptionAppointmentRequest req) {
        // Fetch customer name from customer collection using email
        String customerName = fetchCustomerName(req.getEmail(), req.getCustomerName());
        String paymentStatus = req.getPayment() != null ? req.getPayment()
                : (req.getAmount() != null ? req.getAmount() : "Pending");

        String bookingId = req.getBookingId();

        // Create booking if not provided
        if (bookingId == null || bookingId.isBlank()) {
            Booking newBooking = new Booking();
            newBooking.setEmail(req.getEmail()); // Save email in booking collection for linking
            newBooking.setCustomerName(customerName);
            newBooking.setServices(req.getServices());
            newBooking.setDate(req.getDate());
            newBooking.setTime(req.getTime());
            newBooking.setStaff(req.getStaff());
            newBooking.setPayment(paymentStatus);
            newBooking.setBookingStatus(BookingStatus.CUSTOMER_NOT_ARRIVED);
            // Map payment status
            if (paymentStatus != null && (paymentStatus.equalsIgnoreCase("Paid") || paymentStatus.equals("Yes"))) {
                newBooking.setPaymentStatus(PaymentStatus.PAID);
            } else {
                newBooking.setPaymentStatus(PaymentStatus.PENDING);
            }
            Booking savedBooking = bookingRepo.save(newBooking);
            bookingId = savedBooking.getId();
        } else if (!bookingRepo.existsById(bookingId)) {
            throw new RuntimeException("Provided bookingId not found: " + bookingId);
        }

        // Create reception appointment
        ReceptionAppointment ap = new ReceptionAppointment();
        ap.setBookingId(bookingId);
        ap.setEmail(req.getEmail());
        ap.setCustomerName(customerName);
        ap.setServices(req.getServices());
        ap.setDate(req.getDate());
        ap.setTime(req.getTime());
        ap.setStaff(req.getStaff());
        ap.setPayment(paymentStatus);
        ap.setReceptionNotes(req.getReceptionNotes());
        ap.setCustomerArrived(req.getCustomerArrived() != null ? req.getCustomerArrived() : "No");
        ap.setReceptionPaymentChecked(
                req.getReceptionPaymentChecked() != null ? req.getReceptionPaymentChecked() : "No");
        ap.setCreatedAt(Instant.now());
        ap.setUpdatedAt(Instant.now());

        return repo.save(ap);
    }

    // Create from existing booking
    @Transactional
    public ReceptionAppointment createFromExistingBooking(String bookingId) {
        return createFromExistingBooking(bookingId, null);
    }

    // Create from existing booking with email
    @Transactional
    public ReceptionAppointment createFromExistingBooking(String bookingId, String email) {
        Booking b = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // Use email from booking if not provided, or use provided email
        String emailToUse = (email != null && !email.isBlank()) ? email : b.getEmail();

        // Update booking's email if email was provided but booking doesn't have it
        if (email != null && !email.isBlank() && (b.getEmail() == null || b.getEmail().isBlank())) {
            b.setEmail(email);
            bookingRepo.save(b);
        }

        // Fetch customer name from customer collection using email
        String customerName = b.getCustomerName();
        if (emailToUse != null && !emailToUse.isBlank()) {
            try {
                customerName = fetchCustomerName(emailToUse, b.getCustomerName());
            } catch (Exception e) {
                // Use booking's customer name if customer not found
                System.err.println("Customer not found with email: " + emailToUse + ", using booking name");
            }
        }

        ReceptionAppointment ap = new ReceptionAppointment();
        ap.setBookingId(b.getId());
        ap.setEmail(emailToUse); // Use the email from booking or provided email
        ap.setCustomerName(customerName);
        ap.setServices(b.getServices());
        ap.setDate(b.getDate());
        ap.setTime(b.getTime());
        ap.setStaff(b.getStaff());
        ap.setPayment(b.getPayment());
        ap.setReceptionNotes(null);
        // Map booking status to customerArrived
        if (b.getBookingStatus() == BookingStatus.CUSTOMER_ARRIVED) {
            ap.setCustomerArrived("Yes");
        } else {
            ap.setCustomerArrived("No");
        }
        // Map payment status to receptionPaymentChecked
        if (b.getPaymentStatus() == PaymentStatus.PAID) {
            ap.setReceptionPaymentChecked("Yes");
        } else {
            ap.setReceptionPaymentChecked("No");
        }
        ap.setCreatedAt(Instant.now());
        ap.setUpdatedAt(Instant.now());

        return repo.save(ap);
    }

    // Update reception appointment (syncs with Booking collection)
    @Transactional
    public ReceptionAppointment update(String id, ReceptionAppointmentRequest req) {
        ReceptionAppointment existing = getById(id);

        // Fetch customer name if email is provided
        String customerName = existing.getCustomerName();
        if (req.getEmail() != null && !req.getEmail().equals(existing.getEmail())) {
            customerName = fetchCustomerName(req.getEmail(), req.getCustomerName());
            existing.setEmail(req.getEmail());
        } else if (req.getCustomerName() != null) {
            customerName = req.getCustomerName();
        }

        existing.setCustomerName(customerName);
        existing.setServices(req.getServices());
        existing.setDate(req.getDate());
        existing.setTime(req.getTime());
        existing.setStaff(req.getStaff());
        if (req.getPayment() != null) {
            existing.setPayment(req.getPayment());
        } else if (req.getAmount() != null) {
            existing.setPayment(req.getAmount());
        }
        if (req.getCustomerArrived() != null) {
            existing.setCustomerArrived(req.getCustomerArrived());
        }
        if (req.getReceptionPaymentChecked() != null) {
            existing.setReceptionPaymentChecked(req.getReceptionPaymentChecked());
        }
        existing.setReceptionNotes(req.getReceptionNotes());
        existing.setUpdatedAt(Instant.now());

        // Sync with Booking collection if bookingId exists
        if (existing.getBookingId() != null && !existing.getBookingId().isBlank()) {
            Optional<Booking> bookingOpt = bookingRepo.findById(existing.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                // Update email if changed
                if (req.getEmail() != null && !req.getEmail().equals(booking.getEmail())) {
                    booking.setEmail(req.getEmail());
                }
                booking.setCustomerName(customerName);
                booking.setServices(req.getServices());
                booking.setDate(req.getDate());
                booking.setTime(req.getTime());
                booking.setStaff(req.getStaff());
                if (req.getPayment() != null) {
                    booking.setPayment(req.getPayment());
                } else if (req.getAmount() != null) {
                    booking.setPayment(req.getAmount());
                }
                // Map customerArrived to BookingStatus
                if (existing.getCustomerArrived() != null) {
                    if (existing.getCustomerArrived().equalsIgnoreCase("Yes")) {
                        booking.setBookingStatus(BookingStatus.CUSTOMER_ARRIVED);
                    } else {
                        booking.setBookingStatus(BookingStatus.CUSTOMER_NOT_ARRIVED);
                    }
                }
                // Map receptionPaymentChecked to PaymentStatus
                if (existing.getReceptionPaymentChecked() != null) {
                    if (existing.getReceptionPaymentChecked().equalsIgnoreCase("Yes")) {
                        booking.setPaymentStatus(PaymentStatus.PAID);
                    } else {
                        booking.setPaymentStatus(PaymentStatus.PENDING);
                    }
                }
                bookingRepo.save(booking);
            }
        }

        return repo.save(existing);
    }

    // Mark customer as arrived by reception appointment ID
    @Transactional
    public ReceptionAppointment markArrivedById(String id, String staffEmail) {
        ReceptionAppointment ap = getById(id);
        ap.setCustomerArrived("Yes");
        ap.setUpdatedAt(Instant.now());

        // Update Booking collection if bookingId exists
        if (ap.getBookingId() != null && !ap.getBookingId().isBlank()) {
            Optional<Booking> bookingOpt = bookingRepo.findById(ap.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                booking.setBookingStatus(BookingStatus.CUSTOMER_ARRIVED);
                bookingRepo.save(booking);
            }
        }

        ReceptionAppointment savedAp = repo.save(ap);

        // Notify staff via email
        if (staffEmail != null && !staffEmail.isBlank()) {
            emailService.sendStaffNotification(
                    staffEmail,
                    savedAp.getEmail(), // customer email
                    savedAp.getCustomerName(),
                    savedAp.getServices(),
                    savedAp.getDate(),
                    savedAp.getTime());
        }

        return savedAp;
    }

    // Mark customer as arrived by booking ID
    @Transactional
    public ReceptionAppointment markArrivedByBookingId(String bookingId, String staffEmail) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setBookingStatus(BookingStatus.CUSTOMER_ARRIVED);
        bookingRepo.save(booking);

        Optional<ReceptionAppointment> maybeAp = repo.findByBookingId(bookingId);
        ReceptionAppointment ap;

        if (maybeAp.isPresent()) {
            ap = maybeAp.get();
            ap.setCustomerArrived("Yes");
            ap.setUpdatedAt(Instant.now());
        } else {
            // create new reception appointment if not exist
            ap = new ReceptionAppointment();
            ap.setBookingId(booking.getId());
            // Use email from booking collection
            ap.setEmail(booking.getEmail());
            ap.setCustomerName(booking.getCustomerName());
            ap.setServices(booking.getServices());
            ap.setDate(booking.getDate());
            ap.setTime(booking.getTime());
            ap.setStaff(booking.getStaff());
            ap.setPayment(booking.getPayment());
            ap.setCustomerArrived("Yes");
            if (booking.getPaymentStatus() == PaymentStatus.PAID) {
                ap.setReceptionPaymentChecked("Yes");
            } else {
                ap.setReceptionPaymentChecked("No");
            }
            ap.setCreatedAt(Instant.now());
            ap.setUpdatedAt(Instant.now());
        }

        ReceptionAppointment savedAp = repo.save(ap);

        // Notify staff via email
        if (staffEmail != null && !staffEmail.isBlank()) {
            emailService.sendStaffNotification(
                    staffEmail,
                    savedAp.getEmail() != null ? savedAp.getEmail() : "", // customer email
                    savedAp.getCustomerName(),
                    savedAp.getServices(),
                    savedAp.getDate(),
                    savedAp.getTime());
        }

        return savedAp;
    }

    // Update payment check status by reception appointment ID
    @Transactional
    public ReceptionAppointment updatePaymentCheckById(String id, String paymentChecked) {
        ReceptionAppointment ap = getById(id);
        ap.setReceptionPaymentChecked(paymentChecked);
        ap.setUpdatedAt(Instant.now());

        // Update Booking collection if bookingId exists
        if (ap.getBookingId() != null && !ap.getBookingId().isBlank()) {
            Optional<Booking> bookingOpt = bookingRepo.findById(ap.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                if (paymentChecked != null && paymentChecked.equalsIgnoreCase("Yes")) {
                    booking.setPaymentStatus(PaymentStatus.PAID);
                    booking.setPayment("Paid");
                } else {
                    booking.setPaymentStatus(PaymentStatus.PENDING);
                }
                bookingRepo.save(booking);
            }
        }

        return repo.save(ap);
    }

    // Update payment status by booking ID
    @Transactional
    public ReceptionAppointment updatePaymentStatusByBookingId(String bookingId, PaymentStatus newStatus) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setPaymentStatus(newStatus);
        if (newStatus == PaymentStatus.PAID) {
            booking.setPayment("Paid");
        } else {
            booking.setPayment("Pending");
        }
        bookingRepo.save(booking);

        Optional<ReceptionAppointment> maybeAp = repo.findByBookingId(bookingId);
        ReceptionAppointment ap;

        if (maybeAp.isPresent()) {
            ap = maybeAp.get();
            if (newStatus == PaymentStatus.PAID) {
                ap.setReceptionPaymentChecked("Yes");
                ap.setPayment("Paid");
            } else {
                ap.setReceptionPaymentChecked("No");
                ap.setPayment("Pending");
            }
            ap.setUpdatedAt(Instant.now());
        } else {
            // create minimal reception appointment if missing
            ap = new ReceptionAppointment();
            ap.setBookingId(booking.getId());
            ap.setEmail(booking.getEmail()); // Use email from booking collection
            ap.setCustomerName(booking.getCustomerName());
            ap.setServices(booking.getServices());
            ap.setDate(booking.getDate());
            ap.setTime(booking.getTime());
            ap.setStaff(booking.getStaff());
            ap.setPayment(booking.getPayment());
            if (newStatus == PaymentStatus.PAID) {
                ap.setReceptionPaymentChecked("Yes");
            } else {
                ap.setReceptionPaymentChecked("No");
            }
            ap.setCustomerArrived("No");
            ap.setCreatedAt(Instant.now());
            ap.setUpdatedAt(Instant.now());
        }

        return repo.save(ap);
    }

    // Delete reception appointment (also deletes from Booking collection if linked)
    @Transactional
    public void delete(String id) {
        ReceptionAppointment ap = getById(id);

        // Delete from Booking collection if bookingId exists
        if (ap.getBookingId() != null && !ap.getBookingId().isBlank()) {
            bookingRepo.deleteById(ap.getBookingId());
        }

        // Delete from Reception collection
        repo.deleteById(id);
    }
}