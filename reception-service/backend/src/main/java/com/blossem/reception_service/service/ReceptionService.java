package com.blossem.reception_service.service;

import com.blossem.reception_service.DTO.ReceptionAppointmentRequest;
import com.blossem.reception_service.model.Booking;
import com.blossem.reception_service.model.Customer;
import com.blossem.reception_service.model.ReceptionAppointment;
import com.blossem.reception_service.repository.BookingRepository;
import com.blossem.reception_service.repository.CustomerRepository;
import com.blossem.reception_service.repository.ReceptionAppointmentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
        Double totalPayment = parseAmount(req.getAmount());

        String bookingId = req.getBookingId();
        Booking linkedBooking;

        // Create booking if not provided
        if (bookingId == null || bookingId.isBlank()) {
            Booking newBooking = new Booking();
            newBooking.setEmail(req.getEmail()); // Save email in booking collection for linking
            newBooking.setServices(req.getServices());
            newBooking.setDate(req.getDate());
            newBooking.setTime(req.getTime());
            newBooking.setStaff(req.getStaff());
            newBooking.setPayment(paymentStatus);
            newBooking.setTotalPayment(totalPayment);
            linkedBooking = bookingRepo.save(newBooking);
            bookingId = linkedBooking.getId();
        } else {
            Optional<Booking> existingBookingOpt = bookingRepo.findById(bookingId);
            if (existingBookingOpt.isEmpty()) {
                throw new RuntimeException("Provided bookingId not found: " + bookingId);
            }
            linkedBooking = existingBookingOpt.get();
            if (totalPayment != null) {
                linkedBooking.setTotalPayment(totalPayment);
                bookingRepo.save(linkedBooking);
            }
        }

        // Reuse existing reception appointment for the booking if present to avoid
        // duplicates
        ReceptionAppointment ap = null;
        if (bookingId != null && !bookingId.isBlank()) {
            ap = repo.findByBookingId(bookingId).orElse(null);
        }
        boolean isNewAppointment = (ap == null);
        if (isNewAppointment) {
            ap = new ReceptionAppointment();
            ap.setCreatedAt(Instant.now());
        }
        ap.setBookingId(bookingId);
        ap.setEmail(req.getEmail());
        ap.setCustomerName(customerName);
        ap.setServices(req.getServices());
        ap.setDate(req.getDate());
        ap.setTime(req.getTime());
        ap.setStaff(req.getStaff());
        ap.setPayment(paymentStatus);
        Double appointmentTotal = totalPayment != null
                ? totalPayment
                : (linkedBooking != null ? linkedBooking.getTotalPayment() : null);
        ap.setTotalPayment(safeDouble(appointmentTotal));
        ap.setReceptionNotes(req.getReceptionNotes());
        String customerArrived = req.getCustomerArrived() != null ? req.getCustomerArrived() : "No";
        String paymentChecked = req.getReceptionPaymentChecked() != null ? req.getReceptionPaymentChecked() : "No";
        ap.setCustomerArrived(customerArrived);
        ap.setPaymentChecked(paymentChecked);
        ap.setUpdatedAt(Instant.now());

        // Sync customer_arrived and payment_checked to booking
        if (linkedBooking != null) {
            linkedBooking.setCustomerArrived(customerArrived);
            linkedBooking.setPaymentChecked(paymentChecked);
            bookingRepo.save(linkedBooking);
        }

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
        String customerName = null;
        if (emailToUse != null && !emailToUse.isBlank()) {
            try {
                customerName = fetchCustomerName(emailToUse, emailToUse);
            } catch (Exception e) {
                customerName = emailToUse;
            }
        }
        if (customerName == null || customerName.isBlank()) {
            customerName = "Customer";
        }

        ReceptionAppointment ap = repo.findByBookingId(b.getId()).orElse(null);
        boolean isNewAppointment = (ap == null);
        if (isNewAppointment) {
            ap = new ReceptionAppointment();
            ap.setCreatedAt(Instant.now());
        }
        ap.setBookingId(b.getId());
        ap.setEmail(emailToUse); // Use the email from booking or provided email
        ap.setCustomerName(customerName);
        ap.setServices(b.getServices());
        ap.setDate(b.getDate());
        ap.setTime(b.getTime());
        ap.setStaff(b.getStaff());
        ap.setPayment(b.getPayment());
        ap.setTotalPayment(safeDouble(b.getTotalPayment()));
        ap.setReceptionNotes(null);
        ap.setCustomerArrived(b.getCustomerArrived() != null ? b.getCustomerArrived() : "No");
        ap.setPaymentChecked(
                b.getPaymentChecked() != null ? b.getPaymentChecked()
                        : ("Paid".equalsIgnoreCase(b.getPayment()) || "Yes".equalsIgnoreCase(b.getPayment()) ? "Yes"
                                : "No"));
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
        Double amountValue = parseAmount(req.getAmount());
        if (amountValue != null) {
            existing.setTotalPayment(amountValue);
        }
        if (req.getCustomerArrived() != null) {
            existing.setCustomerArrived(req.getCustomerArrived());
        }
        if (req.getReceptionPaymentChecked() != null) {
            existing.setPaymentChecked(req.getReceptionPaymentChecked());
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
                booking.setServices(req.getServices());
                booking.setDate(req.getDate());
                booking.setTime(req.getTime());
                booking.setStaff(req.getStaff());
                if (req.getPayment() != null) {
                    booking.setPayment(req.getPayment());
                } else if (req.getAmount() != null) {
                    booking.setPayment(req.getAmount());
                }
                if (amountValue != null) {
                    booking.setTotalPayment(amountValue);
                }
                if (req.getCustomerArrived() != null) {
                    booking.setCustomerArrived(req.getCustomerArrived());
                }
                if (req.getReceptionPaymentChecked() != null) {
                    booking.setPaymentChecked(req.getReceptionPaymentChecked());
                }
                bookingRepo.save(booking);
            }
        }

        return repo.save(existing);
    }

    private Double parseAmount(String amount) {
        if (amount == null) {
            return null;
        }
        String sanitized = amount.replaceAll("[^0-9.]", "");
        if (sanitized.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(sanitized);
        } catch (NumberFormatException ex) {
            System.err.println("Ignoring invalid amount: " + amount);
            return null;
        }
    }

    // Mark customer as arrived by reception appointment ID
    @Transactional
    public ReceptionAppointment markArrivedById(String id, String staffEmail) {
        ReceptionAppointment ap = getById(id);
        ap.setCustomerArrived("Yes");
        ap.setUpdatedAt(Instant.now());

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

        Optional<ReceptionAppointment> maybeAp = repo.findByBookingId(bookingId);
        ReceptionAppointment ap;

        if (maybeAp.isPresent()) {
            ap = maybeAp.get();
            ap.setCustomerArrived("Yes");
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setUpdatedAt(Instant.now());
        } else {
            // create new reception appointment if not exist
            ap = new ReceptionAppointment();
            ap.setBookingId(booking.getId());
            String bookingEmail = booking.getEmail();
            ap.setEmail(bookingEmail);
            String customerName;
            if (bookingEmail != null && !bookingEmail.isBlank()) {
                try {
                    customerName = fetchCustomerName(bookingEmail, bookingEmail);
                } catch (RuntimeException ex) {
                    customerName = bookingEmail;
                }
            } else {
                customerName = "Customer";
            }
            ap.setCustomerName(customerName);
            ap.setServices(booking.getServices());
            ap.setDate(booking.getDate());
            ap.setTime(booking.getTime());
            ap.setStaff(booking.getStaff());
            ap.setPayment(booking.getPayment());
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setCustomerArrived("Yes");
            ap.setPaymentChecked(
                    booking.getPaymentChecked() != null ? booking.getPaymentChecked()
                            : ("Paid".equalsIgnoreCase(booking.getPayment())
                                    || "Yes".equalsIgnoreCase(booking.getPayment())
                                            ? "Yes"
                                            : "No"));
            ap.setCreatedAt(Instant.now());
            ap.setUpdatedAt(Instant.now());
        }

        ReceptionAppointment savedAp = repo.save(ap);

        // Sync with Booking collection if bookingId exists
        if (savedAp.getBookingId() != null && !savedAp.getBookingId().isBlank()) {
            Optional<Booking> bookingOpt = bookingRepo.findById(savedAp.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking2 = bookingOpt.get();
                booking2.setCustomerArrived("Yes");
                bookingRepo.save(booking2);
            }
        }

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
        String normalizedCheck = normalizePaymentChecked(paymentChecked);
        ap.setPaymentChecked(normalizedCheck);
        if ("Yes".equalsIgnoreCase(normalizedCheck)) {
            ap.setPayment("Paid");
        } else if (shouldResetToPending(ap.getPayment())) {
            ap.setPayment("Pending");
        }
        ap.setUpdatedAt(Instant.now());

        // Update Booking collection if bookingId exists
        if (ap.getBookingId() != null && !ap.getBookingId().isBlank()) {
            Optional<Booking> bookingOpt = bookingRepo.findById(ap.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                booking.setPaymentChecked(normalizedCheck);
                if ("Yes".equalsIgnoreCase(normalizedCheck)) {
                    booking.setPayment("Paid");
                } else if (shouldResetToPending(booking.getPayment())) {
                    booking.setPayment("Pending");
                }
                bookingRepo.save(booking);
            }
        }

        return repo.save(ap);
    }

    // Update payment status by booking ID
    @Transactional
    public ReceptionAppointment updatePaymentStatusByBookingId(String bookingId, String newPaymentValue) {
        String paymentValue = normalizePaymentValue(newPaymentValue);
        if (paymentValue == null) {
            throw new IllegalArgumentException("payment value must not be blank");
        }

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setPayment(paymentValue);
        bookingRepo.save(booking);

        Optional<ReceptionAppointment> maybeAp = repo.findByBookingId(bookingId);
        ReceptionAppointment ap;
        boolean paid = isPaidValue(paymentValue);

        if (maybeAp.isPresent()) {
            ap = maybeAp.get();
            ap.setPaymentChecked(paid ? "Yes" : "No");
            ap.setPayment(paymentValue);
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setUpdatedAt(Instant.now());
        } else {
            // create minimal reception appointment if missing
            ap = new ReceptionAppointment();
            ap.setBookingId(booking.getId());
            String bookingEmail = booking.getEmail();
            ap.setEmail(bookingEmail);
            ap.setCustomerName(fetchCustomerName(bookingEmail, bookingEmail));
            ap.setServices(booking.getServices());
            ap.setDate(booking.getDate());
            ap.setTime(booking.getTime());
            ap.setStaff(booking.getStaff());
            ap.setPayment(paymentValue);
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setPaymentChecked(paid ? "Yes" : "No");
            ap.setCustomerArrived("No");
            Instant now = Instant.now();
            ap.setCreatedAt(now);
            ap.setUpdatedAt(now);
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

    /**
     * Backfill/sync reception appointments from all existing bookings.
     * Creates missing entries and refreshes existing ones with booking data.
     */
    @Transactional
    public SyncSummary syncBookingsIntoReception() {
        List<Booking> bookings = bookingRepo.findAll();
        int created = 0;
        int updated = 0;

        for (Booking booking : bookings) {
            if (booking.getId() == null || booking.getId().isBlank()) {
                continue; // skip malformed booking records
            }

            Optional<ReceptionAppointment> existingOpt = repo.findByBookingId(booking.getId());
            if (existingOpt.isPresent()) {
                ReceptionAppointment ap = existingOpt.get();
                boolean changed = applyBookingSnapshotToReception(booking, ap);
                if (changed) {
                    ap.setUpdatedAt(Instant.now());
                    repo.save(ap);
                    updated++;
                }
            } else {
                createFromExistingBooking(booking.getId(), booking.getEmail());
                created++;
            }
        }

        return new SyncSummary(bookings.size(), created, updated);
    }

    /**
     * Removes duplicate reception appointments by bookingId (primary) or
     * email+date+time fallback, keeping the most recently updated record.
     */
    @Transactional
    public DedupSummary deduplicateAppointments() {
        List<ReceptionAppointment> ordered = repo.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"));
        Map<String, String> seenKeys = new HashMap<>();
        List<String> idsToDelete = new ArrayList<>();

        for (ReceptionAppointment ap : ordered) {
            if (ap.getId() == null) {
                continue;
            }
            String dedupKey = buildDedupKey(ap);
            if (dedupKey == null) {
                continue;
            }
            if (seenKeys.containsKey(dedupKey)) {
                idsToDelete.add(ap.getId());
            } else {
                seenKeys.put(dedupKey, ap.getId());
            }
        }

        if (!idsToDelete.isEmpty()) {
            repo.deleteAllById(idsToDelete);
        }

        return new DedupSummary(ordered.size(), ordered.size() - idsToDelete.size(), idsToDelete.size());
    }

    private String buildDedupKey(ReceptionAppointment ap) {
        if (ap.getBookingId() != null && !ap.getBookingId().isBlank()) {
            return "booking:" + ap.getBookingId();
        }
        String email = ap.getEmail();
        String date = ap.getDate();
        String time = ap.getTime();
        if ((email == null || email.isBlank()) && (date == null || date.isBlank())
                && (time == null || time.isBlank())) {
            return null;
        }
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        String normalizedDate = date != null ? date.trim() : "";
        String normalizedTime = time != null ? time.trim() : "";
        return normalizedEmail + '|' + normalizedDate + '|' + normalizedTime;
    }

    private String normalizePaymentValue(String paymentValue) {
        if (paymentValue == null) {
            return null;
        }
        String trimmed = paymentValue.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.equalsIgnoreCase("PAID")) {
            return "Paid";
        }
        if (trimmed.equalsIgnoreCase("PENDING")) {
            return "Pending";
        }
        return trimmed;
    }

    private boolean isPaidValue(String paymentValue) {
        if (paymentValue == null) {
            return false;
        }
        String trimmed = paymentValue.trim();
        return trimmed.equalsIgnoreCase("Paid") || trimmed.equalsIgnoreCase("Yes");
    }

    private boolean shouldResetToPending(String currentPayment) {
        if (currentPayment == null) {
            return true;
        }
        String trimmed = currentPayment.trim();
        return trimmed.isEmpty() || trimmed.equalsIgnoreCase("Paid") || trimmed.equalsIgnoreCase("Pending");
    }

    private String normalizePaymentChecked(String paymentChecked) {
        if (paymentChecked == null) {
            return "No";
        }
        return paymentChecked.equalsIgnoreCase("Yes") ? "Yes" : "No";
    }

    private boolean applyBookingSnapshotToReception(Booking booking, ReceptionAppointment ap) {
        boolean changed = false;

        if (!Objects.equals(ap.getBookingId(), booking.getId())) {
            ap.setBookingId(booking.getId());
            changed = true;
        }
        if (!Objects.equals(ap.getEmail(), booking.getEmail())) {
            ap.setEmail(booking.getEmail());
            changed = true;
        }
        if (!Arrays.equals(ap.getServices(), booking.getServices())) {
            ap.setServices(cloneServices(booking.getServices()));
            changed = true;
        }
        if (!Objects.equals(ap.getDate(), booking.getDate())) {
            ap.setDate(booking.getDate());
            changed = true;
        }
        if (!Objects.equals(ap.getTime(), booking.getTime())) {
            ap.setTime(booking.getTime());
            changed = true;
        }
        if (!Objects.equals(ap.getStaff(), booking.getStaff())) {
            ap.setStaff(booking.getStaff());
            changed = true;
        }
        if (!Objects.equals(ap.getPayment(), booking.getPayment())) {
            ap.setPayment(booking.getPayment());
            changed = true;
        }
        if (!totalsMatch(ap.getTotalPayment(), booking.getTotalPayment())) {
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            changed = true;
        }

        String arrivedValue = determineCustomerArrivedValue(booking.getCustomerArrived());
        if (!Objects.equals(ap.getCustomerArrived(), arrivedValue)) {
            ap.setCustomerArrived(arrivedValue);
            changed = true;
        }

        String paymentCheckedValue = derivePaymentCheckedFromBooking(booking);
        if (!Objects.equals(ap.getPaymentChecked(), paymentCheckedValue)) {
            ap.setPaymentChecked(paymentCheckedValue);
            changed = true;
        }

        return changed;
    }

    private double safeDouble(Double value) {
        return value != null ? value : 0.0;
    }

    private boolean totalsMatch(double appointmentTotal, Double bookingTotal) {
        if (bookingTotal == null) {
            return Double.compare(appointmentTotal, 0.0) == 0;
        }
        return Double.compare(appointmentTotal, bookingTotal) == 0;
    }

    private String[] cloneServices(String[] services) {
        return services == null ? null : services.clone();
    }

    private String determineCustomerArrivedValue(String customerArrived) {
        return (customerArrived == null || customerArrived.isBlank()) ? "No" : customerArrived;
    }

    private String derivePaymentCheckedFromBooking(Booking booking) {
        if (booking.getPaymentChecked() != null && !booking.getPaymentChecked().isBlank()) {
            return normalizePaymentChecked(booking.getPaymentChecked());
        }
        return isPaidValue(booking.getPayment()) ? "Yes" : "No";
    }

    public static class SyncSummary {
        private final int bookingsProcessed;
        private final int appointmentsCreated;
        private final int appointmentsUpdated;

        public SyncSummary(int bookingsProcessed, int appointmentsCreated, int appointmentsUpdated) {
            this.bookingsProcessed = bookingsProcessed;
            this.appointmentsCreated = appointmentsCreated;
            this.appointmentsUpdated = appointmentsUpdated;
        }

        public int getBookingsProcessed() {
            return bookingsProcessed;
        }

        public int getAppointmentsCreated() {
            return appointmentsCreated;
        }

        public int getAppointmentsUpdated() {
            return appointmentsUpdated;
        }
    }

    public static class DedupSummary {
        private final int totalBefore;
        private final int totalAfter;
        private final int removed;

        public DedupSummary(int totalBefore, int totalAfter, int removed) {
            this.totalBefore = totalBefore;
            this.totalAfter = totalAfter;
            this.removed = removed;
        }

        public int getTotalBefore() {
            return totalBefore;
        }

        public int getTotalAfter() {
            return totalAfter;
        }

        public int getRemoved() {
            return removed;
        }
    }
}