// Socket.IO event handlers for real-time parking updates

let io;

// Initialize Socket.IO
const initializeSocket = (socketIO) => {
    io = socketIO;

    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // Send welcome message
        socket.emit("connected", {
            message: "Connected to Smart Parking System",
            timestamp: new Date(),
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });

        // Handle user joining a specific parking area (optional)
        socket.on("joinArea", (areaId) => {
            socket.join(areaId);
            console.log(`User ${socket.id} joined area: ${areaId}`);
        });
    });
};

// Emit slot update to all connected clients
const emitSlotUpdate = (slot) => {
    if (io) {
        io.emit("slotUpdated", {
            slot,
            timestamp: new Date(),
        });
        console.log(`📡 Broadcasted slot update: ${slot.slotNumber}`);
    }
};

// Emit booking notification
const emitBookingNotification = (booking) => {
    if (io) {
        io.emit("bookingCreated", {
            booking,
            timestamp: new Date(),
        });
        console.log(`📡 Broadcasted booking: ${booking.slotNumber}`);
    }
};

// Emit multiple slot updates (for bulk operations)
const emitSlotsUpdate = (slots) => {
    if (io) {
        io.emit("slotsUpdated", {
            slots,
            timestamp: new Date(),
        });
        console.log(`📡 Broadcasted ${slots.length} slot updates`);
    }
};

module.exports = {
    initializeSocket,
    emitSlotUpdate,
    emitBookingNotification,
    emitSlotsUpdate,
};
