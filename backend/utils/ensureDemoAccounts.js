const User = require('../models/User');

const DEMO_ACCOUNTS = [
    {
        name: 'Admin',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        name: 'Demo Farmer',
        email: 'farmer@demo.com',
        password: 'farmer123',
        role: 'farmer',
        farmDetails: {
            location: 'Demo Farm',
            farmingMethod: 'organic',
            cropTypes: ['Vegetables'],
            isVerified: true
        }
    },
    {
        name: 'Demo Customer',
        email: 'customer@demo.com',
        password: 'customer123',
        role: 'customer'
    }
];

const getAdminConfiguration = () => {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to create an Admin account');
    }

    if (email === 'admin@demo.com') {
        throw new Error('ADMIN_EMAIL must not use the demo administrator address');
    }

    if (password.length < 12) {
        throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
    }

    return {
        name: process.env.ADMIN_NAME?.trim() || 'Platform Administrator',
        email,
        password
    };
};

const ensureConfiguredAdmin = async (configuration = getAdminConfiguration()) => {
    const { name, email, password } = configuration;
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
        if (existingAdmin.role !== 'admin') {
            throw new Error('ADMIN_EMAIL is already used by a non-Admin account');
        }
        return { created: false, email };
    }

    await User.create({
        name,
        email,
        password,
        role: 'admin'
    });

    return { created: true, email };
};

const ensureDemoAccounts = async () => {
    if (process.env.NODE_ENV === 'production') {
        const result = await ensureConfiguredAdmin();
        if (result.created) {
            console.log(`Production Admin account created for ${result.email}`);
        }
        return;
    }

    for (const account of DEMO_ACCOUNTS) {
        let user = await User.findOne({ email: account.email }).select('+password');

        if (!user) {
            user = new User(account);
            await user.save();
            continue;
        }

        let roleChanged = false;

        if (user.role !== account.role) {
            user.role = account.role;
            roleChanged = true;
        }

        if (account.role === 'farmer' && !user.farmDetails?.location) {
            user.farmDetails = account.farmDetails;
            roleChanged = true;
        }

        if (roleChanged) {
            await user.save();
        }

        const passwordMatches = await user.matchPassword(account.password);
        if (!passwordMatches) {
            user.password = account.password;
            await user.save();
        }
    }
};

module.exports = ensureDemoAccounts;
module.exports.ensureConfiguredAdmin = ensureConfiguredAdmin;
module.exports.getAdminConfiguration = getAdminConfiguration;
