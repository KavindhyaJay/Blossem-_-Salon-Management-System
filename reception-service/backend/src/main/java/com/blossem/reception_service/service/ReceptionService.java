package com.blossem.reception_service.service;

import com.blossem.reception_service.DTO.ReceptionAppointmentRequest;
import com.blossem.reception_service.model.Booking;
import com.blossem.reception_service.model.Customer;
import com.blossem.reception_service.model.ReceptionAppointment;
import com.blossem.reception_service.repository.BookingRepository;
import com.blossem.reception_service.repository.CustomerRepository;
import com.blossem.reception_service.repository.ReceptionAppointmentRepository;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReceptionService {

    private final ReceptionAppointmentRepository repo;
    private final BookingRepository bookingRepo;
    private final CustomerRepository customerRepo;
    private final EmailService emailService;
    private final StaffDirectoryService staffDirectory;

    public ReceptionService(ReceptionAppointmentRepository repo,
            BookingRepository bookingRepo,
            CustomerRepository customerRepo,
            EmailService emailService,
            StaffDirectoryService staffDirectory) {
        this.repo = repo;
        this.bookingRepo = bookingRepo;
        this.customerRepo = customerRepo;
        this.emailService = emailService;
        this.staffDirectory = staffDirectory;
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
        if (email != null && !email.isBlank()) {
            Optional<Customer> customerOpt = lookupCustomerByEmail(email);
            if (customerOpt.isPresent() && customerOpt.get().getName() != null
                    && !customerOpt.get().getName().isBlank()) {
                return customerOpt.get().getName();
            }
        }
        if (fallbackName != null && !fallbackName.isBlank()) {
            return fallbackName;
        }
        return firstNonBlank(email, "Customer");
    }

    private String safeCustomerNameLookup(String email, String fallbackName) {
        String sanitizedFallback = (fallbackName != null && !fallbackName.isBlank()) ? fallbackName : null;
        if (email != null && !email.isBlank()) {
            return lookupCustomerByEmail(email)
                    .map(Customer::getName)
                    .filter(name -> name != null && !name.isBlank())
                    .orElseGet(() -> firstNonBlank(sanitizedFallback, email, "Customer"));
        }
        return firstNonBlank(sanitizedFallback, "Customer");
    }

    private Optional<Customer> lookupCustomerByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        try {
            return customerRepo.findByEmail(email);
        } catch (IncorrectResultSizeDataAccessException ex) {
            return customerRepo.findAllByEmailIgnoreCase(email.trim()).stream().findFirst();
        }
    }

    // Create reception appointment from request
    @Transactional
    public ReceptionAppointment createFromRequest(ReceptionAppointmentRequest req) {
        // Fetch customer name from customer collection using email
        String customerName = fetchCustomerName(req.getEmail(), req.getCustomerName());
        String paymentStatus = normalizePaymentValue(req.getPaymentStatus());
        if (paymentStatus == null) {
            paymentStatus = "Pending";
        }
        Double totalPayment = parseAmount(req.getAmount());
        String paymentCheckedInput = req.getPaymentChecked();
        String customerArrivedInput = req.getCustomerArrived();

        String bookingId = req.getBookingId();
        Booking linkedBooking = null;
        String staffEmailForAppointment = null;

        // Create booking if not provided
        if (bookingId == null || bookingId.isBlank()) {
            Booking newBooking = new Booking();
            newBooking.setEmail(req.getEmail()); // Save email in booking collection for linking
            newBooking.setServices(req.getServices());
            newBooking.setDate(req.getDate());
            newBooking.setTime(req.getTime());
            newBooking.setStaff(req.getStaff());
            String resolvedStaffEmail = resolveStaffEmail(req.getStaff(), req.getStaffEmail(), null);
            newBooking.setStaffEmail(resolvedStaffEmail);
            newBooking.setPaymentStatus(paymentStatus);
            newBooking.setTotalPayment(totalPayment);
            linkedBooking = bookingRepo.save(newBooking);
            bookingId = linkedBooking.getId();
            staffEmailForAppointment = resolvedStaffEmail;

        } else {
            final String bookingIdForLookup = bookingId;
            linkedBooking = bookingRepo.findById(bookingIdForLookup)
                    .orElseThrow(() -> new RuntimeException("Provided bookingId not found: " + bookingIdForLookup));
            boolean bookingUpdated = false;
            if (!Arrays.equals(linkedBooking.getServices(), req.getServices())) {
                linkedBooking.setServices(cloneServices(req.getServices()));
                bookingUpdated = true;
            }
            if (!Objects.equals(linkedBooking.getDate(), req.getDate())) {
                linkedBooking.setDate(req.getDate());
                bookingUpdated = true;
            }
            if (!Objects.equals(linkedBooking.getTime(), req.getTime())) {
                linkedBooking.setTime(req.getTime());
                bookingUpdated = true;
            }
            if (!Objects.equals(linkedBooking.getStaff(), req.getStaff())) {
                linkedBooking.setStaff(req.getStaff());
                bookingUpdated = true;
            }
            String resolvedStaffEmail = resolveStaffEmail(req.getStaff(), req.getStaffEmail(),
                    linkedBooking.getStaffEmail());
            if (!Objects.equals(linkedBooking.getStaffEmail(), resolvedStaffEmail)) {
                linkedBooking.setStaffEmail(resolvedStaffEmail);
                bookingUpdated = true;
            }
            if (req.getEmail() != null && !req.getEmail().isBlank()
                    && !Objects.equals(linkedBooking.getEmail(), req.getEmail())) {
                linkedBooking.setEmail(req.getEmail());
                bookingUpdated = true;
            }
            if (!Objects.equals(linkedBooking.getPaymentStatus(), paymentStatus)) {
                linkedBooking.setPaymentStatus(paymentStatus);
                bookingUpdated = true;
            }
            if (totalPayment != null && !Objects.equals(linkedBooking.getTotalPayment(), totalPayment)) {
                linkedBooking.setTotalPayment(totalPayment);
                bookingUpdated = true;
            }
            if (bookingUpdated) {
                linkedBooking = bookingRepo.save(linkedBooking);
            }
            staffEmailForAppointment = resolveStaffEmail(req.getStaff(), req.getStaffEmail(),
                    linkedBooking.getStaffEmail());
        }

        String normalizedPaymentChecked = "No";
        String normalizedCustomerArrived = "No";

        // Reuse existing reception appointment for the booking if present to avoid
        // duplicates
        ReceptionAppointment ap = resolveAppointmentForBookingSnapshot(bookingId, req.getEmail(), req.getDate(),
                req.getTime()).orElse(null);
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
        ap.setStaffEmail(firstNonBlank(staffEmailForAppointment,
                linkedBooking != null ? linkedBooking.getStaffEmail() : null));
        ap.setPaymentStatus(paymentStatus);
        Double appointmentTotal = totalPayment != null
                ? totalPayment
                : (linkedBooking != null ? linkedBooking.getTotalPayment() : null);
        ap.setTotalPayment(safeDouble(appointmentTotal));
        if (isNewAppointment) {
            ap.setPaymentChecked(normalizedPaymentChecked);
        } else if (paymentCheckedInput != null) {
            ap.setPaymentChecked(
                    normalizeYesNoValue(paymentCheckedInput,
                            ap.getPaymentChecked() != null ? ap.getPaymentChecked() : normalizedPaymentChecked));
        }
        ap.setReceptionNotes(req.getReceptionNotes());
        if (isNewAppointment) {
            ap.setCustomerArrived(normalizedCustomerArrived);
        } else if (customerArrivedInput != null) {
            ap.setCustomerArrived(
                    normalizeYesNoValue(customerArrivedInput,
                            ap.getCustomerArrived() != null ? ap.getCustomerArrived() : normalizedCustomerArrived));
        }
        ap.setUpdatedAt(Instant.now());

        return repo.save(ap);
    }

    // Create from existing booking
    @Transactional
    public ReceptionAppointment createFromExistingBooking(String bookingId) {
        return createFromExistingBooking(bookingId, null, null);
    }

    // Create from existing booking with email
    @Transactional
    public ReceptionAppointment createFromExistingBooking(String bookingId, String email) {
        return createFromExistingBooking(bookingId, email, null);
    }

    // Create from existing booking with email and fallback name
    @Transactional
    public ReceptionAppointment createFromExistingBooking(String bookingId, String email, String fallbackCustomerName) {
        Booking b = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // Use email from booking if not provided, or use provided email
        String emailToUse = firstNonBlank(email, b.getEmail());

        // Update booking's email if email was provided but booking doesn't have it
        if (email != null && !email.isBlank() && (b.getEmail() == null || b.getEmail().isBlank())) {
            b.setEmail(email);
            bookingRepo.save(b);
        }

        String customerName = safeCustomerNameLookup(emailToUse, fallbackCustomerName);
        String bookingPaymentChecked = "No";
        String bookingCustomerArrived = "No";

        ReceptionAppointment ap = resolveAppointmentForBookingSnapshot(b.getId(), emailToUse, b.getDate(), b.getTime())
                .orElse(null);
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
        ap.setStaffEmail(ensureBookingStaffEmail(b));
        ap.setPaymentStatus(b.getPaymentStatus());
        ap.setTotalPayment(safeDouble(b.getTotalPayment()));
        ap.setReceptionNotes(null);
        if (isNewAppointment) {
            ap.setPaymentChecked(bookingPaymentChecked);
            ap.setCustomerArrived(bookingCustomerArrived);
        } else {
            if (ap.getPaymentChecked() == null || ap.getPaymentChecked().isBlank()) {
                ap.setPaymentChecked(bookingPaymentChecked);
            }
            if (ap.getCustomerArrived() == null || ap.getCustomerArrived().isBlank()) {
                ap.setCustomerArrived(bookingCustomerArrived);
            }
        }
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
        String resolvedStaffEmail = resolveStaffEmail(req.getStaff(), req.getStaffEmail(), existing.getStaffEmail());
        existing.setStaffEmail(resolvedStaffEmail);
        String requestedPaymentStatus = normalizePaymentValue(req.getPaymentStatus());
        if (requestedPaymentStatus != null) {
            existing.setPaymentStatus(requestedPaymentStatus);
        }
        Double amountValue = parseAmount(req.getAmount());
        if (amountValue != null) {
            existing.setTotalPayment(amountValue);
        }
        String normalizedCustomerArrived = null;
        if (req.getCustomerArrived() != null) {
            normalizedCustomerArrived = normalizeYesNoValue(req.getCustomerArrived(), existing.getCustomerArrived());
            existing.setCustomerArrived(normalizedCustomerArrived);
        }
        String normalizedPaymentChecked = null;
        if (req.getPaymentChecked() != null) {
            normalizedPaymentChecked = normalizeYesNoValue(req.getPaymentChecked(), existing.getPaymentChecked());
            existing.setPaymentChecked(normalizedPaymentChecked);
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
                booking.setStaffEmail(resolvedStaffEmail != null ? resolvedStaffEmail : booking.getStaffEmail());
                if (requestedPaymentStatus != null) {
                    booking.setPaymentStatus(requestedPaymentStatus);
                }
                if (amountValue != null) {
                    booking.setTotalPayment(amountValue);
                }
                bookingRepo.save(booking);
            }
        }

        return repo.save(existing);
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value;
            }
        }
        return null;
    }

    private String normalizeYesNoValue(String value, String defaultValue) {
        String fallback = (defaultValue == null || defaultValue.trim().isEmpty()) ? "No" : defaultValue.trim();
        String fallbackNormalized = fallback.equalsIgnoreCase("Yes") ? "Yes" : "No";
        if (value == null || value.trim().isEmpty()) {
            return fallbackNormalized;
        }
        return value.trim().equalsIgnoreCase("Yes") ? "Yes" : "No";
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
        String bookingStaffEmail = ensureBookingStaffEmail(booking);

        Optional<ReceptionAppointment> maybeAp = findAppointmentByBookingId(bookingId);
        ReceptionAppointment ap;

        if (maybeAp.isPresent()) {
            ap = maybeAp.get();
            ap.setCustomerArrived("Yes");
            ap.setStaffEmail(bookingStaffEmail);
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setUpdatedAt(Instant.now());
        } else {
            // create new reception appointment if not exist
            ap = new ReceptionAppointment();
            ap.setBookingId(booking.getId());
            String bookingEmail = booking.getEmail();
            ap.setEmail(bookingEmail);
            ap.setCustomerName(safeCustomerNameLookup(bookingEmail, null));
            ap.setServices(booking.getServices());
            ap.setDate(booking.getDate());
            ap.setTime(booking.getTime());
            ap.setStaff(booking.getStaff());
            ap.setStaffEmail(bookingStaffEmail);
            ap.setPaymentStatus(booking.getPaymentStatus());
            ap.setPaymentChecked("No");
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setCustomerArrived("Yes");
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

    // Update payment status by booking ID
    @Transactional
    public ReceptionAppointment updatePaymentStatusByBookingId(String bookingId, String newPaymentValue) {
        String paymentValue = normalizePaymentValue(newPaymentValue);
        if (paymentValue == null) {
            throw new IllegalArgumentException("payment value must not be blank");
        }

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setPaymentStatus(paymentValue);
        bookingRepo.save(booking);
        String bookingStaffEmail = ensureBookingStaffEmail(booking);

        Optional<ReceptionAppointment> maybeAp = findAppointmentByBookingId(bookingId);
        ReceptionAppointment ap;

        if (maybeAp.isPresent()) {
            ap = maybeAp.get();
            ap.setPaymentStatus(paymentValue);
            ap.setStaffEmail(bookingStaffEmail);
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setUpdatedAt(Instant.now());
        } else {
            // create minimal reception appointment if missing
            ap = new ReceptionAppointment();
            ap.setBookingId(booking.getId());
            String bookingEmail = booking.getEmail();
            ap.setEmail(bookingEmail);
            ap.setCustomerName(safeCustomerNameLookup(bookingEmail, null));
            ap.setServices(booking.getServices());
            ap.setDate(booking.getDate());
            ap.setTime(booking.getTime());
            ap.setStaff(booking.getStaff());
            ap.setStaffEmail(bookingStaffEmail);
            ap.setPaymentStatus(paymentValue);
            ap.setPaymentChecked("No");
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            ap.setCustomerArrived("No");
            Instant now = Instant.now();
            ap.setCreatedAt(now);
            ap.setUpdatedAt(now);
        }

        return repo.save(ap);
    }

    // Update paymentChecked flag by reception appointment ID
    @Transactional
    public ReceptionAppointment updatePaymentChecked(String appointmentId, String paymentCheckedValue) {
        String normalized = normalizeYesNoValue(paymentCheckedValue, "No");
        ReceptionAppointment ap = getById(appointmentId);
        ap.setPaymentChecked(normalized);
        ap.setUpdatedAt(Instant.now());
        ReceptionAppointment saved = repo.save(ap);
        return saved;
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

            Optional<ReceptionAppointment> existingOpt = findAppointmentByBookingId(booking.getId());
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

    private boolean applyBookingSnapshotToReception(Booking booking, ReceptionAppointment ap) {
        boolean changed = false;
        String bookingStaffEmail = ensureBookingStaffEmail(booking);

        if (!Objects.equals(ap.getBookingId(), booking.getId())) {
            ap.setBookingId(booking.getId());
            changed = true;
        }
        if (!Objects.equals(ap.getEmail(), booking.getEmail())) {
            ap.setEmail(booking.getEmail());
            changed = true;
        }
        if (ap.getCustomerName() == null || ap.getCustomerName().isBlank()) {
            String derivedName = safeCustomerNameLookup(booking.getEmail(), null);
            if (derivedName != null && !derivedName.isBlank()) {
                ap.setCustomerName(derivedName);
                changed = true;
            }
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
        if (!Objects.equals(ap.getStaffEmail(), bookingStaffEmail)) {
            ap.setStaffEmail(bookingStaffEmail);
            changed = true;
        }
        if (!Objects.equals(ap.getPaymentStatus(), booking.getPaymentStatus())) {
            ap.setPaymentStatus(booking.getPaymentStatus());
            changed = true;
        }
        if (!totalsMatch(ap.getTotalPayment(), booking.getTotalPayment())) {
            ap.setTotalPayment(safeDouble(booking.getTotalPayment()));
            changed = true;
        }
        if (ap.getPaymentChecked() == null || ap.getPaymentChecked().isBlank()) {
            ap.setPaymentChecked("No");
            changed = true;
        }
        if (ap.getCustomerArrived() == null || ap.getCustomerArrived().isBlank()) {
            ap.setCustomerArrived("No");
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

    private String resolveStaffEmail(String staffName, String explicitEmail, String fallback) {
        if (explicitEmail != null && !explicitEmail.isBlank()) {
            return explicitEmail.trim();
        }
        if (staffName != null && !staffName.isBlank()) {
            return staffDirectory.findEmailByName(staffName.trim()).orElse(fallback);
        }
        return fallback;
    }

    private String ensureBookingStaffEmail(Booking booking) {
        if (booking == null) {
            return null;
        }
        String resolved = resolveStaffEmail(booking.getStaff(), booking.getStaffEmail(), booking.getStaffEmail());
        if (!Objects.equals(resolved, booking.getStaffEmail())) {
            booking.setStaffEmail(resolved);
            bookingRepo.save(booking);
        }
        return resolved;
    }

    private Optional<ReceptionAppointment> findAppointmentByBookingId(String bookingId) {
        if (bookingId == null || bookingId.isBlank()) {
            return Optional.empty();
        }
        try {
            return repo.findByBookingId(bookingId);
        } catch (IncorrectResultSizeDataAccessException ex) {
            List<ReceptionAppointment> matches = repo.findAllByBookingId(bookingId);
            if (matches.isEmpty()) {
                return Optional.empty();
            }
            matches.sort(Comparator
                    .comparing(ReceptionAppointment::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                    .reversed());
            List<String> duplicateIds = matches.stream()
                    .skip(1)
                    .map(ReceptionAppointment::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            if (!duplicateIds.isEmpty()) {
                repo.deleteAllById(duplicateIds);
            }
            return Optional.of(matches.get(0));
        }
    }

    private Optional<ReceptionAppointment> resolveAppointmentForBookingSnapshot(String bookingId, String email,
            String date, String time) {
        if (bookingId != null && !bookingId.isBlank()) {
            Optional<ReceptionAppointment> byBooking = findAppointmentByBookingId(bookingId);
            if (byBooking.isPresent()) {
                return byBooking;
            }
        }

        boolean hasIdentity = email != null && !email.isBlank()
                && date != null && !date.isBlank()
                && time != null && !time.isBlank();

        if (!hasIdentity) {
            return Optional.empty();
        }

        return repo.findFirstByEmailIgnoreCaseAndDateAndTime(email.trim(), date.trim(), time.trim());
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