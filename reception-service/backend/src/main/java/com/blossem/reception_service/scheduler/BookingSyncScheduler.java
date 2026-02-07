package com.blossem.reception_service.scheduler;

import com.blossem.reception_service.service.ReceptionService;
import com.blossem.reception_service.service.ReceptionService.SyncSummary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Periodically mirrors new/updated booking documents into the reception
 * appointments collection so front-desk screens stay up to date even if
 * bookings
 * are inserted outside the reception service APIs.
 */
@Component
public class BookingSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingSyncScheduler.class);

    private final ReceptionService receptionService;
    private final AtomicBoolean syncInProgress = new AtomicBoolean(false);

    public BookingSyncScheduler(ReceptionService receptionService) {
        this.receptionService = receptionService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        runSync("startup");
    }

    @Scheduled(initialDelayString = "${reception.sync.initial-delay-ms:5000}", fixedDelayString = "${reception.sync.fixed-delay-ms:15000}")
    public void syncBookingsIntoReception() {
        runSync("scheduled");
    }

    private void runSync(String triggerSource) {
        if (!syncInProgress.compareAndSet(false, true)) {
            log.debug("Reception sync already running, skipping {} trigger", triggerSource);
            return;
        }

        try {
            SyncSummary summary = receptionService.syncBookingsIntoReception();
            log.info("Auto reception sync (triggered by {}) processed {} bookings ({} created, {} updated)",
                    triggerSource,
                    summary.getBookingsProcessed(),
                    summary.getAppointmentsCreated(),
                    summary.getAppointmentsUpdated());
        } catch (Exception ex) {
            log.error("Automatic reception sync ({}) failed", triggerSource, ex);
        } finally {
            syncInProgress.set(false);
        }
    }
}
