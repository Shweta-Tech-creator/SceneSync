const mongoose = require('mongoose');

const storyboardSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false // Optional for now
    },
    pages: [{
        pageNumber: {
            type: Number,
            required: true
        },
        canvasData: {
            type: Object, // Stores Fabric.js JSON
            default: {}
        },
        thumbnail: {
            type: String, // Base64 or URL
            default: ''
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        text: String,
        pageNumber: Number,
        position: {
            x: Number,
            y: Number
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        active: {
            type: Boolean,
            default: true
        },
        lastActive: Date
    }],
    defaultColor: {
        type: String,
        default: '#000000'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Storyboard', storyboardSchema);
