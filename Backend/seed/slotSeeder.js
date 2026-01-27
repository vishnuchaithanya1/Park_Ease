const Slot = require("../models/slotModel");

const slots = [
    { slotNumber: "A1", isAvailable: true, location: { x: 10, y: 20 } },
    { slotNumber: "A2", isAvailable: false, location: { x: 20, y: 20 } },
    { slotNumber: "A3", isAvailable: true, location: { x: 30, y: 20 } },
    { slotNumber: "A4", isAvailable: true, location: { x: 40, y: 20 } }
];

const seedSlots = async () => {
    try {
        const count = await Slot.countDocuments();
        if (count === 0) {
            await Slot.insertMany(slots);
            console.log("Slots Inserted Successfully!");
        } else {
            console.log("Slots already exist. Skipping seeding.");
        }
    } catch (err) {
        console.error("Error seeding slots:", err);
    }
};

module.exports = seedSlots; 