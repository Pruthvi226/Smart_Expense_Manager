package com.smartexpensemanager.scheduler;

import com.smartexpensemanager.repository.IdempotencyKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SchedulerService.class);
    private final IdempotencyKeyRepository idempotencyKeyRepository;

    public SchedulerService(IdempotencyKeyRepository idempotencyKeyRepository) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
    }

    // Daily at 01:00 AM: Clean up expired idempotency keys
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void cleanupExpiredIdempotencyKeys() {
        log.info("Cron Job: Cleaning up expired idempotency keys...");
        try {
            idempotencyKeyRepository.deleteByExpiresAtBefore(LocalDateTime.now());
            log.info("Cron Job: Expired idempotency keys cleanup finished.");
        } catch (Exception e) {
            log.error("Cron Job Error during idempotency key cleanup: {}", e.getMessage());
        }
    }

    // Daily at 08:00 AM: Evaluate budget usage & send warning digests
    @Scheduled(cron = "0 0 8 * * ?")
    public void runDailyBudgetUsageCheck() {
        log.info("Cron Job: Executing daily budget usage check...");
    }

    // Weekly every Monday at 09:00 AM: Dispatch weekly report alerts
    @Scheduled(cron = "0 0 9 ? * MON")
    public void sendWeeklyReports() {
        log.info("Cron Job: Dispatching weekly summary reports...");
    }

    // Monthly on the 1st at 06:00 AM: Process monthly report & recurring expenses
    @Scheduled(cron = "0 0 6 1 * ?")
    public void processMonthlyReportsAndRecurringExpenses() {
        log.info("Cron Job: Processing monthly reports and recurring expense allocations...");
    }
}
