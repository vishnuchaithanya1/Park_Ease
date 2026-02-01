package com.parking.validator.controller;

import com.parking.validator.model.Slot;
import com.parking.validator.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class DataInitController {

        @Autowired
        private SlotRepository slotRepository;

        @PostMapping("/init-sample-data")
        public ResponseEntity<Map<String, Object>> initializeSampleData(
                        @RequestParam(defaultValue = "false") boolean force) {
                // Check if slots already exist
                long count = slotRepository.count();
                if (count > 0 && !force) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("message",
                                        "Database already has " + count + " slots. Use ?force=true to overwrite.");
                        response.put("existingCount", count);
                        return ResponseEntity.ok(response);
                }

                if (force) {
                        slotRepository.deleteAll();
                }

                List<Slot> sampleSlots = new ArrayList<>();

                // Hyderabad - Madhapur - IKEA Mall
                sampleSlots.addAll(createSlots("A", 1, 10, "Hyderabad", "Madhapur", "IKEA Mall", "Shopping Mall",
                                17.4326, 78.3808, 100.0, 100.0));

                // Hyderabad - Madhapur - Inorbit Mall
                sampleSlots.addAll(createSlots("B", 1, 8, "Hyderabad", "Madhapur", "Inorbit Mall", "Shopping Mall",
                                17.4352, 78.3866, 200.0, 100.0));

                // Hyderabad - Gachibowli - DLF Cyber City
                sampleSlots.addAll(
                                createSlots("C", 1, 12, "Hyderabad", "Gachibowli", "DLF Cyber City", "Office Complex",
                                                17.4239, 78.3733, 300.0, 100.0));

                // Hyderabad - Hitech City - Mindspace
                sampleSlots.addAll(createSlots("D", 1, 15, "Hyderabad", "Hitech City", "Mindspace IT Park",
                                "Office Complex",
                                17.4435, 78.3772, 400.0, 100.0));

                // Hyderabad - Medchal - CMR College
                sampleSlots.addAll(createSlots("CMR", 1, 20, "Hyderabad", "Medchal", "CMR College (Kandlakoya)",
                                "Educational Institute",
                                17.6048, 78.4862, 500.0, 100.0));

                // Bangalore - Koramangala - Forum Mall
                sampleSlots.addAll(createSlots("E", 1, 10, "Bangalore", "Koramangala", "Forum Mall", "Shopping Mall",
                                12.9352, 77.6245, 100.0, 200.0));

                // Bangalore - Whitefield - Phoenix Marketcity
                sampleSlots.addAll(createSlots("F", 1, 12, "Bangalore", "Whitefield", "Phoenix Marketcity",
                                "Shopping Mall",
                                12.9975, 77.6969, 200.0, 200.0));

                // Mumbai - Andheri - Infinity Mall
                sampleSlots.addAll(createSlots("G", 1, 8, "Mumbai", "Andheri", "Infinity Mall", "Shopping Mall",
                                19.1136, 72.8697, 100.0, 300.0));

                // Mumbai - BKC - Jio World Drive
                sampleSlots.addAll(createSlots("H", 1, 10, "Mumbai", "BKC", "Jio World Drive", "Shopping Mall",
                                19.0653, 72.8687, 200.0, 300.0));

                // --- NEW AREAS ---

                // Hyderabad - Landmarks
                sampleSlots.addAll(createSlots("CHA", 1, 15, "Hyderabad", "Old City", "Charminar Parking",
                                "Tourist Spot", 17.3616, 78.4747, 500.0, 500.0));
                sampleSlots.addAll(createSlots("GOL", 1, 20, "Hyderabad", "Golconda", "Golconda Fort", "Tourist Spot",
                                17.3833, 78.4011, 600.0, 500.0));
                sampleSlots.addAll(createSlots("NEC", 1, 12, "Hyderabad", "Hussain Sagar", "Necklace Road",
                                "Public Park", 17.4237, 78.4738, 700.0, 500.0));
                sampleSlots.addAll(createSlots("JUB", 1, 10, "Hyderabad", "Jubilee Hills", "Checkpost Metro", "Transit",
                                17.4325, 78.4071, 800.0, 500.0));

                // Bangalore - Hotspots
                sampleSlots.addAll(createSlots("MGR", 1, 14, "Bangalore", "Central", "MG Road Metro", "Transit",
                                12.9756, 77.6066, 100.0, 600.0));
                sampleSlots.addAll(createSlots("IND", 1, 10, "Bangalore", "Indiranagar", "100 Feet Road", "Commercial",
                                12.9719, 77.6412, 200.0, 600.0));
                sampleSlots.addAll(createSlots("CUB", 1, 18, "Bangalore", "Central", "Cubbon Park", "Public Park",
                                12.9764, 77.5929, 300.0, 600.0));

                // Mumbai - Landmarks
                sampleSlots.addAll(createSlots("MAR", 1, 15, "Mumbai", "South Mumbai", "Marine Drive", "Tourist Spot",
                                18.9438, 72.8234, 100.0, 700.0));
                sampleSlots.addAll(createSlots("GAT", 1, 12, "Mumbai", "Colaba", "Gateway of India", "Tourist Spot",
                                18.9220, 72.8347, 200.0, 700.0));
                sampleSlots.addAll(createSlots("JUH", 1, 25, "Mumbai", "Juhu", "Juhu Beach Public Parking",
                                "Tourist Spot", 19.0988, 72.8264, 300.0, 700.0));

                // Delhi - Capital Region
                sampleSlots.addAll(createSlots("CP", 1, 20, "Delhi", "Connaught Place", "Inner Circle", "Commercial",
                                28.6304, 77.2177, 100.0, 800.0));
                sampleSlots.addAll(createSlots("IG", 1, 15, "Delhi", "Central Delhi", "India Gate", "Tourist Spot",
                                28.6129, 77.2295, 200.0, 800.0));
                sampleSlots.addAll(createSlots("HK", 1, 10, "Delhi", "South Delhi", "Hauz Khas Village", "Nightlife",
                                28.5532, 77.1944, 300.0, 800.0));

                // Chennai
                sampleSlots.addAll(createSlots("MRB", 1, 30, "Chennai", "Marina", "Marina Beach", "Tourist Spot",
                                13.0500, 80.2824, 100.0, 900.0));
                sampleSlots.addAll(createSlots("TNR", 1, 12, "Chennai", "T. Nagar", "Pondy Bazaar", "Shopping", 13.0418,
                                80.2341, 200.0, 900.0));

                // Kolkata
                sampleSlots.addAll(createSlots("PST", 1, 10, "Kolkata", "Park Street", "Park Street Dining", "Dining",
                                22.5551, 88.3514, 100.0, 1000.0));
                sampleSlots.addAll(createSlots("VIC", 1, 15, "Kolkata", "Maidan", "Victoria Memorial", "Tourist Spot",
                                22.5448, 88.3426, 200.0, 1000.0));

                // Pune
                sampleSlots.addAll(createSlots("KOR", 1, 12, "Pune", "Koregaon Park", "Osho Garden Lane", "Residential",
                                18.5362, 73.8940, 100.0, 1100.0));
                sampleSlots.addAll(createSlots("FCR", 1, 14, "Pune", "Shivajinagar", "FC Road", "Student Hub", 18.5196,
                                73.8427, 200.0, 1100.0));

                // Jaipur
                sampleSlots.addAll(createSlots("HAW", 1, 10, "Jaipur", "Pink City", "Hawa Mahal", "Tourist Spot",
                                26.9239, 75.8267, 100.0, 1200.0));

                // Save all slots
                slotRepository.saveAll(sampleSlots);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Successfully initialized parking slots!");
                response.put("totalSlots", sampleSlots.size());
                response.put("cities", List.of("Hyderabad", "Bangalore", "Mumbai"));
                response.put("locations", 8);

                return ResponseEntity.ok(response);
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
