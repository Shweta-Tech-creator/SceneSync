const mongoose = require('mongoose');

const shotSequenceSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        default: 'Untitled Sequence',
        trim: true
    },
    frames: [{
        id: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['storyboard', 'image'],
            default: 'image'
        },
        storyboardPageId: {
            type: Number, // Page number
            default: null
        },
        scriptLineId: {
            type: String,
            default: null
        },
        image: {
            type: String, // URL or Base64
            required: true
        },
        duration: {
            type: Number,
            default: 2
        },
        transition: {
            type: String,
            enum: ['cut', 'fade', 'dissolve'],
            default: 'cut'
        },
        textOverlay: {
            type: String,
            default: ''
        }
    }],
    audioTrack: {
        type: String, // URL or Base64
        default: ''
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

module.exports = mongoose.model('ShotSequence', shotSequenceSchema);
