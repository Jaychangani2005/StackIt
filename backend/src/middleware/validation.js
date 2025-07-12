const { body, param, query, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Sanitize HTML content
const sanitizeContent = (content) => {
    return sanitizeHtml(content, {
        allowedTags: [
            'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span'
        ],
        allowedAttributes: {
            'a': ['href', 'target', 'rel'],
            'img': ['src', 'alt', 'width', 'height', 'style'],
            'div': ['style'],
            'span': ['style'],
            'code': ['class'],
            'pre': ['class']
        },
        allowedStyles: {
            '*': {
                'text-align': [/^left$/, /^center$/, /^right$/],
                'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
                'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
            }
        }
    });
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// User registration validation
const validateRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    handleValidationErrors
];

// User login validation
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// Question creation validation
const validateQuestion = [
    body('title')
        .trim()
        .isLength({ min: 10, max: 150 })
        .withMessage('Title must be between 10 and 150 characters'),
    
    body('description')
        .trim()
        .isLength({ min: 20 })
        .withMessage('Description must be at least 20 characters long')
        .customSanitizer(sanitizeContent),
    
    body('tags')
        .isArray({ min: 1, max: 5 })
        .withMessage('Question must have between 1 and 5 tags')
        .custom((tags) => {
            if (!tags.every(tag => typeof tag === 'string' && tag.length >= 2 && tag.length <= 20)) {
                throw new Error('Each tag must be a string between 2 and 20 characters');
            }
            return tags;
        }),
    
    handleValidationErrors
];

// Answer creation validation
const validateAnswer = [
    body('description')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Answer must be at least 10 characters long')
        .customSanitizer(sanitizeContent),
    
    handleValidationErrors
];

// Comment creation validation
const validateComment = [
    body('content')
        .trim()
        .isLength({ min: 2, max: 500 })
        .withMessage('Comment must be between 2 and 500 characters')
        .customSanitizer(sanitizeContent),
    
    handleValidationErrors
];

// Vote validation
const validateVote = [
    body('voteType')
        .isIn(['upvote', 'downvote'])
        .withMessage('Vote type must be either upvote or downvote'),
    
    handleValidationErrors
];

// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer'),
    
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

// Search validation
const validateSearch = [
    query('q')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters long'),
    
    handleValidationErrors
];

// Tag validation
const validateTag = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('Tag name must be between 2 and 20 characters')
        .matches(/^[a-zA-Z0-9-]+$/)
        .withMessage('Tag name can only contain letters, numbers, and hyphens'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Tag description must be less than 500 characters'),
    
    handleValidationErrors
];

// Admin user management validation
const validateUserManagement = [
    body('action')
        .isIn(['ban', 'unban', 'delete', 'change_role'])
        .withMessage('Invalid action'),
    
    body('userId')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),
    
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be either user or admin'),
    
    handleValidationErrors
];

// Content moderation validation
const validateContentModeration = [
    body('action')
        .isIn(['approve', 'reject', 'delete'])
        .withMessage('Invalid moderation action'),
    
    body('contentType')
        .isIn(['question', 'answer', 'comment'])
        .withMessage('Invalid content type'),
    
    body('contentId')
        .isInt({ min: 1 })
        .withMessage('Content ID must be a positive integer'),
    
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason must be less than 500 characters'),
    
    handleValidationErrors
];

// File upload validation
const validateFileUpload = [
    body('file')
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('File is required');
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
            }
            
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (req.file.size > maxSize) {
                throw new Error('File size must be less than 2MB');
            }
            
            return true;
        }),
    
    handleValidationErrors
];

// Notification validation
const validateNotification = [
    body('type')
        .isIn(['answer', 'comment', 'mention', 'vote', 'accept', 'admin_message'])
        .withMessage('Invalid notification type'),
    
    body('title')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters'),
    
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    
    handleValidationErrors
];

module.exports = {
    sanitizeContent,
    handleValidationErrors,
    validateRegistration,
    validateLogin,
    validateQuestion,
    validateAnswer,
    validateComment,
    validateVote,
    validateId,
    validatePagination,
    validateSearch,
    validateTag,
    validateUserManagement,
    validateContentModeration,
    validateFileUpload,
    validateNotification
}; 