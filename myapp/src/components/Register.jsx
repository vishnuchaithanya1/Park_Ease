import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { fetchWithRetry } from '../utils/apiRetry';
import './Register.css';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        vehicleNumber: '',
        vehicleType: '',
        phone: '',
        role: 'user',
        adminSecret: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        setLoadingMessage('Connecting to server...');

        try {
            // Use retry wrapper for better cold start handling
            const response = await fetchWithRetry(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            }, 3, 5000); // 3 retries, 5 second delay

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccess('Registration successful! Logging you in...');

            // Auto-login with token from registration response
            if (data.token && data.user) {
                login(data.token, data.user);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Register for smart parking</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="role-selector">
                        <div
                            className={`role-option ${formData.role === 'user' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'user' })}
                        >
                            👤 User
                        </div>
                        <div
                            className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'admin' })}
                        >
                            🛡️ Admin
                        </div>
                    </div>

                    {formData.role === 'admin' && (
                        <div className="input-group">
                            <label>Admin Invite Token</label>
                            <input
                                type="password"
                                name="adminSecret"
                                placeholder="Paste your invite token here"
                                value={formData.adminSecret}
                                onChange={handleChange}
                                required
                                className="auth-input secret-input"
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Min 6 chars, 1 letter, 1 number"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Vehicle Number</label>
                        <input
                            type="text"
                            name="vehicleNumber"
                            placeholder="e.g., ABC1234"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Vehicle Type</label>
                        <select
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="auth-input"
                        >
                            <option value="">Select vehicle type</option>
                            <option value="car">Car</option>
                            <option value="bike">Bike</option>
                            <option value="truck">Truck</option>
                            <option value="van">Van</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    {loading && loadingMessage && (
                        <div className="info-message">
                            <div className="spinner"></div>
                            {loadingMessage}
                        </div>
                    )}
                    {error && <div className="error-message">⚠️ {error}</div>}

                    {success && <div className="success-message">✅ {success}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <span onClick={onSwitchToLogin} className="auth-link">
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;
