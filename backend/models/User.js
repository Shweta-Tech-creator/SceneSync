const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 6
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['Director', 'Writer', 'Artist', 'Assistant'],
        default: 'Artist'
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true
    },
    githubId: {
        type: String,
        sparse: true
    },
    avatar: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (this.provider !== 'local') return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update login info
userSchema.methods.updateLoginInfo = function () {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema, 'user');
