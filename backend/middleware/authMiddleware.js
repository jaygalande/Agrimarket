const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getFarmerApprovalState = require('../utils/farmerApproval');

/**
 * Protects routes by validating the incoming Bearer JWT token
 */
const protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from string: "Bearer <token_value>"
            token = req.headers.authorization.split(' ')[1];

            // Verify the token signature using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from database using decoded ID and attach to request object (without password)
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    message: 'Not authorized, user account no longer exists'
                });
            }

            if (
                process.env.NODE_ENV === 'production' &&
                req.user.email === 'admin@demo.com'
            ) {
                return res.status(401).json({
                    message: 'Demo administrator accounts are disabled in production'
                });
            }

            const approvalState = getFarmerApprovalState(req.user);
            if (approvalState === 'pending' || approvalState === 'rejected') {
                return res.status(403).json({
                    code: approvalState === 'pending'
                        ? 'FARMER_APPROVAL_PENDING'
                        : 'FARMER_REGISTRATION_REJECTED',
                    message: approvalState === 'pending'
                        ? 'Your farmer account is waiting for Admin approval'
                        : 'Your farmer registration was not approved. Please contact the Admin.'
                });
            }

            return next(); // Pass control to the next operational function
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                console.error(error);
            }

            return res.status(401).json({ message: 'Not authorized, token validation failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no session token found' });
    }
};

/**
 * Restricts route access to specific defined user roles (e.g., 'farmer', 'admin')
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: User role '${req.user?.role || 'Guest'}' is not permitted to access this resource`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };