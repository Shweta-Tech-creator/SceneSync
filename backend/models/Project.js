const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    coverImage: {
        type: String, // URL or Base64
        default: ''
    },
    status: {
        type: String,
        enum: ['Draft', 'In Progress', 'Completed', 'Archived'],
        default: 'Draft'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['Editor', 'Viewer'],
            default: 'Viewer'
        },
        active: {
            type: Boolean,
            default: true
        },
        lastActive: Date
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: {
            type: String,
            default: 'Unknown User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    storyboard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Storyboard'
    },
    shotSequence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShotSequence'
    }
}, {
    timestamps: true,
    collection: 'projectdashboard'
});

module.exports = mongoose.model('Project', projectSchema);
