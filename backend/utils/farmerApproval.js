const getFarmerApprovalState = (user) => {
    if (user?.role !== 'farmer') {
        return 'not-required';
    }

    if (user.approvalStatus === 'rejected') {
        return 'rejected';
    }

    if (
        user.approvalStatus === 'pending' ||
        !user.farmDetails?.isVerified
    ) {
        return 'pending';
    }

    return 'approved';
};

module.exports = getFarmerApprovalState;
