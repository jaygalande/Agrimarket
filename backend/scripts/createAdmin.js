const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const ensureDemoAccounts = require('../utils/ensureDemoAccounts');

const createAdmin = async () => {
    const configuration = ensureDemoAccounts.getAdminConfiguration();
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGO_URI is required to create an Admin account');
    }

    await mongoose.connect(mongoUri);
    try {
        const result = await ensureDemoAccounts.ensureConfiguredAdmin(configuration);
        console.log(
            result.created
                ? `Admin account created for ${result.email}`
                : `Admin account ${result.email} already exists; no changes made`
        );
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin().catch((error) => {
    console.error(`Admin setup failed: ${error.message}`);
    process.exitCode = 1;
});
