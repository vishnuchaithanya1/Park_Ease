const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Common validation rules
 */
const validators = {
    // MongoDB ObjectId validation
    mongoId: (field = 'id') =>
        param(field).isMongoId().withMessage('Invalid ID format'),

    // Email validation
    email: () =>
        body('email')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),

    // Password validation (reasonable security)
    password: () =>
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
            .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
            .matches(/[0-9]/).withMessage('Password must contain at least one number'),

    // Vehicle number validation (flexible format with sanitization)
    vehicleNumber: () =>
        body('vehicleNumber')
            .trim()
            .customSanitizer(value => value ? value.replace(/[\s-]/g, '').toUpperCase() : value)
            .notEmpty().withMessage('Vehicle number is required')
            .isLength({ min: 4, max: 15 }).withMessage('Vehicle number must be 4-15 characters')
            .matches(/^[A-Z0-9]+$/).withMessage('Vehicle number must contain only letters and numbers'),

    // Date/Time validation
    dateTime: (field) =>
        body(field)
            .isISO8601().withMessage(`${field} must be a valid ISO 8601 date`)
            .toDate(),

    // Slot number validation
    slotNumber: () =>
        body('slotNumber')
            .matches(/^[A-Z0-9-]+$/)
            .withMessage('Slot number must contain only letters, numbers, and hyphens'),

    // Pagination validation
    pagination: () => [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer')
            .toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
            .toInt()
    ]
};

/**
 * Validation schemas for specific routes
 */
const validationSchemas = {
    // User registration
    register: [
        body('name').trim().notEmpty().withMessage('Name is required'),
        validators.email(),
        validators.password(),
        body('vehicleNumber')
            .optional()
            .trim()
            .customSanitizer(value => value ? value.replace(/[\s-]/g, '').toUpperCase() : value)
            .isLength({ min: 4, max: 15 }).withMessage('Vehicle number must be 4-15 characters')
            .matches(/^[A-Z0-9]+$/).withMessage('Vehicle number must contain only letters and numbers')
    ],

    // User login
    login: [
        body('identifier')
            .optional()
            .trim()
            .notEmpty().withMessage('Email or Vehicle Number is required'),
        body('email')
            .optional()
            .trim(),
        body('vehicleNumber')
            .optional()
            .trim(),
        body('password').notEmpty().withMessage('Password is required')
    ],

    // Create booking
    createBooking: [
        body('slotId').isMongoId().withMessage('Invalid slot ID'),
        validators.vehicleNumber(),
        validators.dateTime('startTime'),
        validators.dateTime('endTime')
    ],

    // Create slot (admin)
    createSlot: [
        validators.slotNumber(),
        body('city').trim().notEmpty().withMessage('City is required'),
        body('area').trim().notEmpty().withMessage('Area is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
        body('latitude').optional().isFloat({ min: -90, max: 90 }),
        body('longitude').optional().isFloat({ min: -180, max: 180 })
    ],

    // Process payment
    processPayment: [
        body('bookingId').isMongoId().withMessage('Invalid booking ID'),
        body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
        body('method').isIn(['credit_card', 'paypal', 'upi']).withMessage('Invalid payment method')
    ]
};

module.exports = {
    validate,
    validators,
    validationSchemas
};
