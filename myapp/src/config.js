// Backend API configuration
// Automatically uses localhost for development, Render for production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const BACKEND_URL = isDevelopment
    ? 'http://localhost:5000'
    : 'https://smart-parking-backend-z9ww.onrender.com';

export const API_BASE_URL = `${BACKEND_URL}/api`;
