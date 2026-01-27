import { API_BASE_URL } from './config';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

// Fetch all slots
export const fetchSlots = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/slots/all`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch slots');
        }

        const data = await response.json();
        return data.slots;
    } catch (error) {
        console.error('Error fetching slots:', error);
        throw error;
    }
};

// Create a booking
export const createBooking = async (bookingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create booking');
        }

        return data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

// Get user's bookings
export const getMyBookings = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching bookings with token:', token ? 'Token exists' : 'No token');

        const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
            headers: getAuthHeaders()
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('API Error:', errorData);
            throw new Error(errorData.message || 'Failed to fetch bookings');
        }

        const data = await response.json();
        console.log('Bookings data received:', data);
        return data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

// ============ ADMIN API FUNCTIONS ============

// Get all users (admin only)
export const getAllUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Get detailed user information (admin only)
export const getUserDetails = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
};


// Create a new slot (admin only)
export const createSlot = async (slotData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/create-slot`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(slotData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create slot');
        }

        return data;
    } catch (error) {
        console.error('Error creating slot:', error);
        throw error;
    }
};

// Update a slot (admin only)
export const updateSlot = async (slotId, slotData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slot/${slotId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(slotData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update slot');
        }

        return data;
    } catch (error) {
        console.error('Error updating slot:', error);
        throw error;
    }
};

// Delete a slot (admin only)
export const deleteSlot = async (slotId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slot/${slotId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete slot');
        }

        return data;
    } catch (error) {
        console.error('Error deleting slot:', error);
        throw error;
    }
};

// Get all bookings (admin only)
export const getAllBookings = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/all`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch all bookings');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw error;
    }
};

// Get analytics (admin only)
export const getAnalytics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch analytics');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

// ============ PARKING TIMER API FUNCTIONS ============

// Check in to a booking (record entry time)
export const checkInBooking = async (bookingId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-in`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to check in');
        }

        return data;
    } catch (error) {
        console.error('Error checking in:', error);
        throw error;
    }
};

// Check out from a booking (record exit time and calculate fee)
export const checkOutBooking = async (bookingId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-out`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to check out');
        }

        return data;
    } catch (error) {
        console.error('Error checking out:', error);
        throw error;
    }
};

// Process payment for a booking
export const processPayment = async (bookingId, paymentMethod = 'upi') => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/process-payment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ method: paymentMethod })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Payment processing failed');
        }

        return data;
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
};

// Get fee details for a booking
export const getFeeDetails = async (bookingId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/fee-details`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch fee details');
        }

        return data;
    } catch (error) {
        console.error('Error fetching fee details:', error);
        throw error;
    }
};

// ============ ALERT API FUNCTIONS ============

// Admin: Create alert
export const createAlert = async (alertData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/alerts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(alertData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create alert');
        }

        return data;
    } catch (error) {
        console.error('Error creating alert:', error);
        throw error;
    }
};

// Admin: Get all alerts (including inactive)
export const getAllAlertsAdmin = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/alerts/all`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch alerts');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        throw error;
    }
};

// Admin: Update alert
export const updateAlert = async (alertId, alertData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/alerts/${alertId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(alertData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update alert');
        }

        return data;
    } catch (error) {
        console.error('Error updating alert:', error);
        throw error;
    }
};

// Admin: Delete alert
export const deleteAlert = async (alertId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/alerts/${alertId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete alert');
        }

        return data;
    } catch (error) {
        console.error('Error deleting alert:', error);
        throw error;
    }
};

// Public: Get all active alerts
export const getActiveAlerts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch active alerts');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching active alerts:', error);
        throw error;
    }
};

// Public: Get alerts for specific slot
export const getSlotAlerts = async (slotId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/slot/${slotId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch slot alerts');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching slot alerts:', error);
        throw error;
    }
};

// Public: Get alerts for specific area
export const getAreaAlerts = async (area) => {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/area/${encodeURIComponent(area)}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch area alerts');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching area alerts:', error);
        throw error;
    }
};

// ============ REPORTS API FUNCTIONS ============

// Admin: Fetch usage report with filters
export const fetchUsageReport = async (startDate, endDate, filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (filters.slotId) params.append('slotId', filters.slotId);
        if (filters.userType) params.append('userType', filters.userType);
        if (filters.city) params.append('city', filters.city);
        if (filters.area) params.append('area', filters.area);
        if (filters.address) params.append('address', filters.address);

        const response = await fetch(`${API_BASE_URL}/reports/usage?${params.toString()}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch usage report');
        }

        const data = await response.json();
        return data.report;
    } catch (error) {
        console.error('Error fetching usage report:', error);
        throw error;
    }
};

// User: Fetch personal statistics
export const fetchMyStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/my-stats`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch personal statistics');
        }

        const data = await response.json();
        return data.stats;
    } catch (error) {
        console.error('Error fetching personal stats:', error);
        throw error;
    }
};

// Admin: Export report as CSV
export const exportReportCSV = async (startDate, endDate, filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (filters.slotId) params.append('slotId', filters.slotId);
        if (filters.userType) params.append('userType', filters.userType);
        if (filters.city) params.append('city', filters.city);
        if (filters.area) params.append('area', filters.area);
        if (filters.address) params.append('address', filters.address);

        const response = await fetch(`${API_BASE_URL}/reports/export/csv?${params.toString()}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to export CSV');
        }

        // Get the CSV blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parking_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw error;
    }
};

// User: Export personal data as CSV
export const exportMyCSV = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/export/my-csv`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to export personal CSV');
        }

        // Get the CSV blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my_parking_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Error exporting personal CSV:', error);
        throw error;
    }
};

// Admin: Fetch peak hours data
export const fetchPeakHours = async (startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`${API_BASE_URL}/reports/peak-hours?${params.toString()}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch peak hours');
        }

        const data = await response.json();
        return data.peakHours;
    } catch (error) {
        console.error('Error fetching peak hours:', error);
        throw error;
    }
};

// Admin: Fetch slot utilization data
export const fetchSlotUtilization = async (startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`${API_BASE_URL}/reports/slot-utilization?${params.toString()}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch slot utilization');
        }

        const data = await response.json();
        return data.slotUtilization;
    } catch (error) {
        console.error('Error fetching slot utilization:', error);
        throw error;
    }
};

