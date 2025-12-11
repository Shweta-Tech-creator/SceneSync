const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/scenecraft')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');

const app = express();
app.use(express.json());

// Debug login endpoint
app.post('/debug-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Debug login attempt for:', email);
        
        // Find user
        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', !!user);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        console.log('User provider:', user.provider);
        console.log('User active:', user.isActive);
        
        // Test password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.json({ success: false, message: 'Password mismatch' });
        }
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });
        
    } catch (error) {
        console.error('Debug login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(3001, () => {
    console.log('Debug server running on port 3001');
});
