const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userRegisterSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function () {
            return this.provider === 'local';
        },
        minlength: [6, 'Password must be at least 6 characters']
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
    registrationDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'suspended'],
        default: 'verified'
    },
    signupSource: {
        type: String,
        enum: ['web', 'mobile', 'api'],
        default: 'web'
    }
}, {
    timestamps: true
});

// Method to compare password
userRegisterSchema.methods.comparePassword = async function (candidatePassword) {
    if (this.provider !== 'local') return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userRegisterSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('UserRegister', userRegisterSchema, 'userRegister');
