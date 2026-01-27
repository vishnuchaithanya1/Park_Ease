import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { fetchWithRetry } from '../utils/apiRetry';
import './Login.css';

const Login = ({ onSwitchToRegister }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [adminSecret, setAdminSecret] = useState('');
    const [role, setRole] = useState('user'); // Default to user
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setLoadingMessage('Connecting to server...');

        try {
            const response = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, password, adminSecret }),
            }, 3, 5000); // 3 retries, 5 second delay

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Verify Role Match
            if (data.user.role !== role) {
                throw new Error(`Access Denied: This account is not authorized as ${role === 'admin' ? 'an Admin' : 'a User'}`);
            }

            // Store token and user data
            login(data.token, data.user);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to your parking account</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="role-selector">
                        <div
                            className={`role-option ${role === 'user' ? 'active' : ''}`}
                            onClick={() => setRole('user')}
                        >
                            👤 User
                        </div>
                        <div
                            className={`role-option ${role === 'admin' ? 'active' : ''}`}
                            onClick={() => setRole('admin')}
                        >
                            🛡️ Admin
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email or Vehicle Number</label>
                        <input
                            type="text"
                            placeholder="Enter email or vehicle number"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    {role === 'admin' && (
                        <div className="input-group">
                            <label>Admin Token</label>
                            <input
                                type="password"
                                placeholder="Paste your admin token"
                                value={adminSecret}
                                onChange={(e) => setAdminSecret(e.target.value)}
                                required
                                className="auth-input secret-input"
                            />
                        </div>
                    )}

                    {loading && loadingMessage && (
                        <div className="info-message">
                            <div className="spinner"></div>
                            {loadingMessage}
                        </div>
                    )}
                    {error && <div className="error-message">⚠️ {error}</div>}


                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <span onClick={onSwitchToRegister} className="auth-link">
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
