import React from 'react';
import { motion } from 'framer-motion';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'map', icon: '🗺️', label: 'Map' },
        { id: 'book', icon: '✨', label: 'Book' },
        { id: 'bookings', icon: '📋', label: 'Bookings' },
        { id: 'payments', icon: '💳', label: 'Payments' },
        { id: 'reports', icon: '📊', label: 'Reports' },
        { id: 'profile', icon: '👤', label: 'Profile' }
    ];

    return (
        <motion.nav
            className="bottom-nav"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {navItems.map((item) => (
                <motion.button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id || (activeTab === 'slots' && item.id === 'map') ? 'active' : ''}`}
                    onClick={() => onTabChange(item.id)}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    aria-label={item.label}
                    aria-current={activeTab === item.id ? 'page' : undefined}
                >
                    <motion.span
                        className="nav-icon"
                        animate={{
                            scale: activeTab === item.id || (activeTab === 'slots' && item.id === 'map') ? 1.2 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        {item.icon}
                    </motion.span>
                    <span className="nav-label">{item.label}</span>

                    {/* Active indicator */}
                    {(activeTab === item.id || (activeTab === 'slots' && item.id === 'map')) && (
                        <motion.div
                            className="nav-indicator"
                            layoutId="activeTab"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                    )}
                </motion.button>
            ))}
        </motion.nav>
    );
};

export default BottomNav;
