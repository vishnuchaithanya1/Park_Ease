import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        const socket = socketRef.current;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('✅ Connected to real-time server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from real-time server');
            setIsConnected(false);
        });

        socket.on('connected', (data) => {
            console.log('📡 Server message:', data.message);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    // Subscribe to slot updates
    const onSlotUpdate = (callback) => {
        if (socketRef.current) {
            socketRef.current.on('slotUpdated', (data) => {
                console.log('🔄 Slot updated:', data.slot.slotNumber);
                setLastUpdate(data);
                callback(data.slot);
            });
        }
    };

    // Subscribe to booking notifications
    const onBookingCreated = (callback) => {
        if (socketRef.current) {
            socketRef.current.on('bookingCreated', (data) => {
                console.log('🎉 New booking:', data.booking.slotNumber);
                callback(data.booking);
            });
        }
    };

    // Subscribe to multiple slot updates
    const onSlotsUpdate = (callback) => {
        if (socketRef.current) {
            socketRef.current.on('slotsUpdated', (data) => {
                console.log('🔄 Multiple slots updated:', data.slots.length);
                callback(data.slots);
            });
        }
    };

    return {
        isConnected,
        lastUpdate,
        onSlotUpdate,
        onBookingCreated,
        onSlotsUpdate,
        socket: socketRef.current,
    };
};
