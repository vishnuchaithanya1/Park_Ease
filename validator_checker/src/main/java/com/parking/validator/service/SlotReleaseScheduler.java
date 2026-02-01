package com.parking.validator.service;

import com.parking.validator.model.Booking;
import com.parking.validator.model.Slot;
import com.parking.validator.repository.BookingRepository;
import com.parking.validator.repository.SlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Background service that automatically releases slots when booking time ends.
 * Runs every minute to check for expired bookings.
 */
@Service
public class SlotReleaseScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SlotReleaseScheduler.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private WebSocketService webSocketService;

    /**
     * Scheduled task that runs every minute to release expired bookings.
     * Finds all bookings with status "BOOKED" where endTime has passed,
     * updates them to "COMPLETED", and releases the slots.
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds (1 minute)
    public void releaseExpiredSlots() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Find all active bookings where endTime has passed
            List<Booking> allBookedBookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.BOOKED
                            && b.getEndTime() != null
                            && b.getEndTime().isBefore(now))
                    .toList();

            if (!allBookedBookings.isEmpty()) {
                logger.info("🔄 Found {} expired booking(s). Releasing slots...", allBookedBookings.size());

                for (Booking booking : allBookedBookings) {
                    try {
                        // Update booking status to COMPLETED
                        booking.setStatus(Booking.BookingStatus.COMPLETED);
                        bookingRepository.save(booking);

                        // Release the slot
                        if (booking.getSlot() != null) {
                            Slot slot = booking.getSlot();
                            slot.setAvailable(true);
                            slotRepository.save(slot);

                            // Emit WebSocket update for real-time UI refresh
                            webSocketService.emitSlotUpdate(slot);

                            logger.info("✅ Released slot {} (Booking ended at {})",
                                    slot.getSlotNumber(), booking.getEndTime());
                        }
                    } catch (Exception e) {
                        logger.error("❌ Error releasing slot for booking {}: {}",
                                booking.getId(), e.getMessage());
                    }
                }

                logger.info("✨ Successfully released {} slot(s)", allBookedBookings.size());
            }
        } catch (Exception error) {
            logger.error("❌ Error in slot release job: {}", error.getMessage());
        }
    }
}
