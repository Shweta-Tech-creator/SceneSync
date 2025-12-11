const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const UserRegister = require('../models/UserRegister');

// Validation middleware
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;

    const errors = [];

    if (!username || username.trim().length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    const errors = [];

    if (!email) {
        errors.push('Email is required');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Generate JWT Token
const generateToken = (userId, email) => {
    return jwt.sign(
        { id: userId, email },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
    );
};

// Local Registration
router.post('/register', validateRegistration, async (req, res) => {
    try {
        console.log('Registration attempt:', req.body.email);

        const { username, email, password, role } = req.body;

        // Check if user already exists in both collections
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        const existingRegister = await UserRegister.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser || existingRegister) {
            const field = existingUser?.email === email || existingRegister?.email === email ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        // Hash password manually
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user in UserRegister collection (signup data)
        const registeredUser = new UserRegister({
            username,
            email,
            password: hashedPassword,
            role: role || 'Artist',
            provider: 'local'
        });

        await registeredUser.save();
        console.log('User registered in userRegister collection:', registeredUser.email);

        // Create user in User collection (login data)
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'Artist',
            provider: 'local'
        });

        await user.save();
        console.log('User created in user collection:', user.email);

        // Generate token
        const token = generateToken(user._id, user.email);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                provider: user.provider,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Local Login
router.post('/login', validateLogin, async (req, res) => {
    try {
        console.log('Login attempt:', req.body.email);

        const { email, password } = req.body;

        // Find user in User collection
        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', !!user);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('User provider:', user.provider);
        console.log('User active:', user.isActive);

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Compare password (only for local users)
        if (user.provider === 'local') {
            console.log('Comparing password...');
            const isPasswordValid = await user.comparePassword(password);
            console.log('Password valid:', isPasswordValid);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }

        console.log('Login successful:', user.email);

        // Update login info
        await user.updateLoginInfo();

        // Generate token
        const token = generateToken(user._id, user.email);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                provider: user.provider,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed` }),
    async (req, res) => {
        try {
            const { googleId, displayName, email, photo } = req.user;

            // Check if user already exists
            let user = await User.findOne({ $or: [{ email }, { googleId }] });

            if (!user) {
                // Create new user
                user = new User({
                    username: displayName.replace(/\s+/g, '').toLowerCase(),
                    email,
                    avatar: photo,
                    googleId,
                    provider: 'google',
                    isActive: true
                });
                await user.save();
                console.log('New Google user created:', email);
            } else if (!user.googleId) {
                // Link Google account to existing user
                user.googleId = googleId;
                user.avatar = photo;
                await user.save();
                console.log('Google account linked to existing user:', email);
            }

            // Update login info
            await user.updateLoginInfo();

            // Generate token
            const token = generateToken(user._id, user.email);

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&provider=google`);

        } catch (error) {
            console.error('Google OAuth error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/?error=auth_failed`);
        }
    }
);

// GitHub OAuth Routes
router.get('/github', passport.authenticate('github', {
    scope: ['user:email'],
    session: false
}));

router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed` }),
    async (req, res) => {
        try {
            const { githubId, displayName, username, email, photo } = req.user;

            // Check if user already exists
            let user = await User.findOne({ $or: [{ email }, { githubId }] });

            if (!user) {
                // Create new user
                user = new User({
                    username: username || displayName.replace(/\s+/g, '').toLowerCase(),
                    email,
                    avatar: photo,
                    githubId,
                    provider: 'github',
                    isActive: true
                });
                await user.save();
                console.log('New GitHub user created:', email);
            } else if (!user.githubId) {
                // Link GitHub account to existing user
                user.githubId = githubId;
                user.avatar = photo;
                await user.save();
                console.log('GitHub account linked to existing user:', email);
            }

            // Update login info
            await user.updateLoginInfo();

            // Generate token
            const token = generateToken(user._id, user.email);

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&provider=github`);

        } catch (error) {
            console.error('GitHub OAuth error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/?error=auth_failed`);
        }
    }
);

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router;
