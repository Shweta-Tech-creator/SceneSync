const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const invitationsRoutes = require('./routes/invitations');
const statsRoutes = require('./routes/stats');

// Import passport config
require('./config/passport');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scenecraft')
    .then(() => console.log('MongoDB Connected to scenecraft database'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Socket.io Logic
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/projects', require('./routes/projects'));
app.use('/api/scripts', require('./routes/scriptRoutes'));
app.use('/api/breakdown', require('./routes/breakdownRoutes'));
app.use('/api/shot-sequence', require('./routes/shotSequenceRoutes'));
app.use('/api/storyboards', require('./routes/storyboardRoutes'));

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Storyboard Events
    socket.on('join-storyboard', (storyboardId) => {
        socket.join(storyboardId);
        console.log(`User ${socket.id} joined storyboard ${storyboardId}`);
    });

    socket.on('canvas-update', ({ storyboardId, data }) => {
        socket.to(storyboardId).emit('canvas-update', data);
    });

    socket.on('page-update', ({ storyboardId, pages }) => {
        socket.to(storyboardId).emit('page-update', pages);
    });

    socket.on('cursor-move', ({ storyboardId, user, position }) => {
        socket.to(storyboardId).emit('cursor-move', { user, position });
    });

    // Script Events
    socket.on('join-script', (scriptId) => {
        socket.join(scriptId);
        console.log(`User ${socket.id} joined script ${scriptId}`);
    });

    socket.on('script-update', ({ scriptId, blocks }) => {
        socket.to(scriptId).emit('script-update', blocks);
    });

    // Project Events (for comments and collaboration)
    socket.on('join-project', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined project ${projectId}`);
    });

    socket.on('new-comment', ({ projectId, comment }) => {
        socket.to(projectId).emit('new-comment', comment);
        console.log(`New comment in project ${projectId}:`, comment);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.json({ message: 'SceneCraft API Server' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

server.listen(PORT, () => {
    console.log(`SceneCraft server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log('Socket.io initialized');
});
