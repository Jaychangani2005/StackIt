import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user details
        const [users] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Check if user is authenticated (optional)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        const [users] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);

        if (users.length > 0) {
            req.user = users[0];
        }
        
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Check if user is admin
const requireAdmin = requireRole(['admin']);

// Check if user is authenticated user or admin
const requireUser = requireRole(['user', 'admin']);

// Check if user owns the resource or is admin
const requireOwnership = (resourceType) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role === 'admin') {
            return next();
        }

        const resourceId = req.params.id || req.body.id;
        if (!resourceId) {
            return res.status(400).json({
                success: false,
                message: 'Resource ID required'
            });
        }

        let query;
        switch (resourceType) {
            case 'question':
                query = 'SELECT user_id FROM questions WHERE id = ?';
                break;
            case 'answer':
                query = 'SELECT user_id FROM answers WHERE id = ?';
                break;
            case 'comment':
                query = 'SELECT user_id FROM comments WHERE id = ?';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid resource type'
                });
        }

        const [result] = await db.query(query, [resourceId]);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        if (result[0].user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        next();
    };
};

export default verifyToken;
export { optionalAuth, requireRole, requireAdmin, requireUser, requireOwnership }; 