import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getSlotAlerts, getAreaAlerts } from '../api';
import AlertModal from './AlertModal';
import './ParkingMap.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map of common cities to their actual coordinates for precise prototype placement
const CITY_CENTERS = {
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Secunderabad': { lat: 17.4399, lng: 78.4983 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Madhapur': { lat: 17.4483, lng: 78.3915 },
    'Hitech City': { lat: 17.4435, lng: 78.3772 },
    'Gachibowli': { lat: 17.4401, lng: 78.3489 },
    'Banjara Hills': { lat: 17.4126, lng: 78.4439 },
    'Jubilee Hills': { lat: 17.4325, lng: 78.4071 }
};

// Component to recenter map when view center changes
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], 18);
        }
    }, [center, map]);
    return null;
}

// Helper to auto-position slots around a center point for demo purposes
function getDemoCoordinates(index, centerLat, centerLng) {
    // Grid pattern: 4 columns (wider)
    const cols = 4;
    const rowSpacing = 0.0005; // ~55 meters (Increased spacing)
    const colSpacing = 0.0005;

    const row = Math.floor(index / cols);
    const col = index % cols;

    // Offset from center
    return {
        lat: centerLat + (row * rowSpacing) - (rowSpacing * 1.5),
        lng: centerLng + (col * colSpacing) - (colSpacing * 1.5)
    };
}

const ParkingMap = ({ slots, onSelectSlot }) => {
    // Default Center: Hyderabad Hitech City
    const DEFAULT_CENTER = CITY_CENTERS['Hitech City'];
    const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
    const [hasLocation, setHasLocation] = useState(false);
    const [demoAnchor, setDemoAnchor] = useState(DEFAULT_CENTER);

    // Alert state
    const [slotAlerts, setSlotAlerts] = useState({});
    const [selectedSlotAlerts, setSelectedSlotAlerts] = useState(null);
    const [selectedSlotNumber, setSelectedSlotNumber] = useState('');

    // Watch user location for the "You" marker
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setHasLocation(true);
                },
                (error) => console.log("GPS Initial error:", error),
                { timeout: 5000 }
            );

            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setHasLocation(true);
                },
                (error) => console.log("Watch error:", error),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Effect to handle view projection when slots change (filtering)
    useEffect(() => {
        if (!slots || slots.length === 0) return;

        // 1. Try to find a real GPS coordinate to center on
        const slotsWithGps = slots.filter(s => s.latitude && s.longitude);
        if (slotsWithGps.length > 0) {
            // Center on the first slot with real GPS
            const first = slotsWithGps[0];
            setMapCenter({ lat: first.latitude, lng: first.longitude });
            setDemoAnchor({ lat: first.latitude, lng: first.longitude });
            return;
        }

        // 2. No real GPS? Try to find coordinates for the city/area
        const firstSlot = slots[0];
        const city = firstSlot.city || '';
        const area = firstSlot.area || '';

        // Prioritize specific Area over general City
        const targetCenter = CITY_CENTERS[area] || CITY_CENTERS[city] || DEFAULT_CENTER;

        setMapCenter(targetCenter);
        setDemoAnchor(targetCenter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slots]); // Run whenever the slots list updates (filter changed)

    // Fetch alerts for all slots
    useEffect(() => {
        const fetchAllAlerts = async () => {
            if (!slots || slots.length === 0) return;

            const alertsMap = {};

            for (const slot of slots) {
                try {
                    const alertPromises = [];

                    // Fetch slot-specific alerts
                    if (slot._id || slot.id) {
                        alertPromises.push(getSlotAlerts(slot._id || slot.id));
                    }

                    // Fetch area alerts
                    if (slot.area) {
                        alertPromises.push(getAreaAlerts(slot.area));
                    }

                    // Fetch city alerts
                    if (slot.city) {
                        alertPromises.push(getAreaAlerts(slot.city));
                    }

                    const results = await Promise.all(alertPromises);
                    const allAlerts = results.flat();

                    // Remove duplicates
                    const uniqueAlerts = Array.from(
                        new Map(allAlerts.map(alert => [alert._id, alert])).values()
                    );

                    if (uniqueAlerts.length > 0) {
                        alertsMap[slot._id || slot.id] = uniqueAlerts;
                    }
                } catch (error) {
                    console.error(`Error fetching alerts for slot ${slot.slotNumber}:`, error);
                }
            }

            setSlotAlerts(alertsMap);
        };

        fetchAllAlerts();
    }, [slots]);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(pos);
                setMapCenter(pos);
                setHasLocation(true);
            },
            () => alert("Unable to retrieve your location")
        );
    };

    // Project slots onto map
    const mapSlots = slots.map((slot, index) => {
        if (slot.latitude && slot.longitude) {
            return {
                ...slot,
                displayLat: slot.latitude,
                displayLng: slot.longitude,
                isDemo: false
            };
        } else {
            // Anchor relative to the calculated DEMO CENTER for this set of slots
            const demoCoords = getDemoCoordinates(index, demoAnchor.lat, demoAnchor.lng);
            return {
                ...slot,
                displayLat: demoCoords.lat,
                displayLng: demoCoords.lng,
                isDemo: true
            };
        }
    });

    return (
        <div className="parking-map-container">
            <div className="map-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3>🗺️ Live Map {hasLocation ? '(GPS Active)' : '(Demo Mode)'}</h3>
                    <button
                        onClick={handleLocateMe}
                        className="map-book-btn"
                        style={{ width: 'auto', margin: '0', padding: '4px 12px', fontSize: '0.8rem', background: '#2563eb' }}
                    >
                        📍 Locate Me
                    </button>
                </div>
                <div className="map-legend">
                    <span className="legend-item"><span className="legend-dot user-loc"></span> You</span>
                    <span className="legend-item"><span className="legend-dot available"></span> Available</span>
                    <span className="legend-item"><span className="legend-dot booked"></span> Booked</span>
                </div>
            </div>

            <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={18} scrollWheelZoom={true} style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap center={mapCenter} />

                {/* User Location Marker */}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })}>
                    <Popup>
                        <strong>📍 You are here</strong><br />
                        {!hasLocation && "(Simulated Location)"}
                    </Popup>
                </Marker>

                {/* Parking Slots Markers */}
                {mapSlots.map(slot => {
                    const markerIcon = new L.Icon({
                        iconUrl: slot.isAvailable
                            ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
                            : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });

                    return (
                        <Marker key={slot._id} position={[slot.displayLat, slot.displayLng]} icon={markerIcon}>
                            <Popup>
                                <div className="map-popup-content">
                                    <strong>Slot {slot.slotNumber}</strong>
                                    {slot.isDemo && <span className="demo-badge"> (Auto-Placed)</span>}<br />
                                    <span style={{ fontSize: '0.8em', color: '#666' }}>{slot.address}</span><br />

                                    <div style={{ margin: '8px 0' }}>
                                        Status: <strong style={{ color: slot.isAvailable ? '#10b981' : '#ef4444' }}>
                                            {slot.isAvailable ? "Available" : "Booked"}
                                        </strong>
                                    </div>

                                    {/* Alert Indicator */}
                                    {slotAlerts[slot._id || slot.id] && slotAlerts[slot._id || slot.id].length > 0 && (() => {
                                        const alerts = slotAlerts[slot._id || slot.id];
                                        const hasWarningOrCritical = alerts.some(
                                            alert => alert.severity === 'warning' || alert.severity === 'critical'
                                        );

                                        return (
                                            <div style={{ margin: '8px 0', padding: '6px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                    <span>⚠️</span>
                                                    <strong style={{ color: '#92400e', fontSize: '0.85em' }}>
                                                        {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
                                                    </strong>
                                                </div>
                                                <button
                                                    className="map-book-btn"
                                                    onClick={() => {
                                                        setSelectedSlotAlerts(alerts);
                                                        setSelectedSlotNumber(slot.slotNumber);
                                                    }}
                                                    style={{ background: '#f59e0b', fontSize: '0.75em', padding: '4px 8px' }}
                                                >
                                                    View Alerts
                                                </button>
                                                {hasWarningOrCritical && (
                                                    <div style={{ marginTop: '4px', fontSize: '0.75em', color: '#92400e' }}>
                                                        ⚠️ Booking disabled due to alerts
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {slot.isAvailable && (() => {
                                        const alerts = slotAlerts[slot._id || slot.id];
                                        const hasWarningOrCritical = alerts && alerts.some(
                                            alert => alert.severity === 'warning' || alert.severity === 'critical'
                                        );

                                        if (hasWarningOrCritical) {
                                            return (
                                                <button
                                                    className="map-book-btn"
                                                    disabled
                                                    style={{
                                                        background: '#9ca3af',
                                                        cursor: 'not-allowed',
                                                        opacity: 0.6
                                                    }}
                                                    title="Booking unavailable due to alerts"
                                                >
                                                    Booking Unavailable
                                                </button>
                                            );
                                        }

                                        return (
                                            <button className="map-book-btn" onClick={() => onSelectSlot(slot)}>
                                                Book Now
                                            </button>
                                        );
                                    })()}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Alert Modal */}
            {selectedSlotAlerts && (
                <AlertModal
                    alerts={selectedSlotAlerts}
                    slotNumber={selectedSlotNumber}
                    onClose={() => {
                        setSelectedSlotAlerts(null);
                        setSelectedSlotNumber('');
                    }}
                />
            )}
        </div>
    );
};

export default ParkingMap;
