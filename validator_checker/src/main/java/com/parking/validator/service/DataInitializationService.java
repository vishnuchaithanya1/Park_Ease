package com.parking.validator.service;

import com.parking.validator.model.Slot;
import com.parking.validator.repository.SlotRepository;
import com.parking.validator.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {

        @Autowired
        private SlotRepository slotRepository;

        @Autowired
        private JwtUtils jwtUtils;

        @Override
        public void run(String... args) throws Exception {
                // Generate and print Master Admin Invite Token
                String adminToken = jwtUtils.generateAdminInviteToken();
                System.out.println("\n" + "=".repeat(80));
                System.out.println("🚀 MASTER ADMIN INVITE TOKEN (Valid for 24h):");
                System.out.println(adminToken);
                System.out.println("=".repeat(80) + "\n");

                // Check if slots already exist
                long count = slotRepository.count();
                if (count > 0) {
                        System.out.println("✅ Database already has " + count + " slots. Skipping initialization.");
                        return;
                }

                System.out.println("🔄 Initializing database with sample parking slots...");

                List<Slot> sampleSlots = new ArrayList<>();

                // Hyderabad - Madhapur - IKEA Mall
                sampleSlots.addAll(createSlots("A", 1, 10, "Hyderabad", "Madhapur", "IKEA Mall", "Shopping Mall",
                                17.4326, 78.3808, 100, 100));

                // Hyderabad - Madhapur - Inorbit Mall
                sampleSlots.addAll(createSlots("B", 1, 8, "Hyderabad", "Madhapur", "Inorbit Mall", "Shopping Mall",
                                17.4352, 78.3866, 200, 100));

                // Hyderabad - Gachibowli - DLF Cyber City
                sampleSlots.addAll(
                                createSlots("C", 1, 12, "Hyderabad", "Gachibowli", "DLF Cyber City", "Office Complex",
                                                17.4239, 78.3733, 300, 100));

                // Hyderabad - Hitech City - Mindspace
                sampleSlots.addAll(createSlots("D", 1, 15, "Hyderabad", "Hitech City", "Mindspace IT Park",
                                "Office Complex",
                                17.4435, 78.3772, 400, 100));

                // Bangalore - Koramangala - Forum Mall
                sampleSlots.addAll(createSlots("E", 1, 10, "Bangalore", "Koramangala", "Forum Mall", "Shopping Mall",
                                12.9352, 77.6245, 100, 200));

                // Bangalore - Whitefield - Phoenix Marketcity
                sampleSlots.addAll(createSlots("F", 1, 12, "Bangalore", "Whitefield", "Phoenix Marketcity",
                                "Shopping Mall",
                                12.9975, 77.6969, 200, 200));

                // Mumbai - Andheri - Infinity Mall
                sampleSlots.addAll(createSlots("G", 1, 8, "Mumbai", "Andheri", "Infinity Mall", "Shopping Mall",
                                19.1136, 72.8697, 100, 300));

                // Mumbai - BKC - Jio World Drive
                sampleSlots.addAll(createSlots("H", 1, 10, "Mumbai", "BKC", "Jio World Drive", "Shopping Mall",
                                19.0653, 72.8687, 200, 300));

                // Save all slots
                slotRepository.saveAll(sampleSlots);

                System.out.println("✅ Successfully initialized " + sampleSlots.size() + " parking slots!");
                System.out.println("📍 Cities: Hyderabad, Bangalore, Mumbai");
                System.out.println("🏢 Locations: Multiple malls and office complexes");
        }

        private List<Slot> createSlots(String prefix, int start, int count, String city, String area,
                        String address, String placeType, double baseLat, double baseLng,
                        double baseX, double baseY) {
                List<Slot> slots = new ArrayList<>();

                for (int i = start; i < start + count; i++) {
                        Slot slot = Slot.builder()
                                        .slotNumber(prefix + i)
                                        .isAvailable(true) // Make ALL slots available as requested
                                        .city(city)
                                        .area(area)
                                        .address(address)
                                        .placeType(placeType)
                                        .latitude(baseLat + (i * 0.0001))
                                        .longitude(baseLng + (i * 0.0001))
                                        .location(new Slot.Location(baseX + (i * 50.0), baseY + (i * 50.0)))
                                        .section("General")
                                        .build();

                        slots.add(slot);
                }

                return slots;
        }
}
