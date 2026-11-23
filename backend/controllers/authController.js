const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const getFarmerApprovalState = require('../utils/farmerApproval');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, farmDetails } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email address' });
        }

        const allowedRole = role === 'farmer' ? 'farmer' : 'customer';
        const userData = { name, email, password, role: allowedRole };

        if (allowedRole === 'farmer' && (!farmDetails?.location || !farmDetails?.farmingMethod)) {
            return res.status(400).json({
                message: 'Farm location and farming method are required'
            });
        }

        if (allowedRole === 'farmer') {
            userData.approvalStatus = 'pending';
            userData.farmDetails = {
                location: farmDetails.location,
                farmingMethod: farmDetails.farmingMethod,
                cropTypes: farmDetails.cropTypes || [],
                isVerified: false
            };
        }

        const user = await User.create(userData);

        if (user) {
            const response = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                farmDetails: user.farmDetails
            };

            if (user.role === 'farmer') {
                response.approvalStatus = user.approvalStatus;
                response.message = 'Your farmer account is pending Admin approval. You can sign in after it is approved.';
            } else {
                response.token = generateToken(user._id);
            }

            res.status(201).json(response);
        } else {
            res.status(400).json({ message: 'Invalid user data provided' });
        }
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error(error);
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Authenticate User & Get Token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 * */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            process.env.NODE_ENV === 'production' &&
            email?.trim().toLowerCase() === 'admin@demo.com'
        ) {
            return res.status(401).json({
                message: 'Demo administrator accounts are disabled in production'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const approvalState = getFarmerApprovalState(user);

            if (approvalState === 'pending') {
                return res.status(403).json({
                    code: 'FARMER_APPROVAL_PENDING',
                    message: 'Your farmer account is waiting for Admin approval'
                });
            }

            if (approvalState === 'rejected') {
                return res.status(403).json({
                    code: 'FARMER_REGISTRATION_REJECTED',
                    message: 'Your farmer registration was not approved. Please contact the Admin.'
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                farmDetails: user.farmDetails,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get current logged-in user profile session
 * @route   GET /api/auth/me
 * @access  Private
 * */
const getCurrentUser = async (req, res) => {
    try {
        // req.user is automatically populated by our protect middleware
        if (req.user) {
            res.status(200).json({
                user: {
                    _id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    farmDetails: req.user.farmDetails
                }
            });
        } else {
            res.status(404).json({ message: 'User profile database record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser // 👈 Added Export
};