const mongoose = require('mongoose');
const crypto = require('crypto');

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    inviter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['Owner', 'Editor', 'Viewer'],
        default: 'Viewer'
    },
    token: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
}, {
    timestamps: true
});

// Generate unique token before saving
invitationSchema.pre('save', function () {
    if (!this.token) {
        this.token = crypto.randomBytes(32).toString('hex');
    }
});

// Index for faster queries
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, project: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
