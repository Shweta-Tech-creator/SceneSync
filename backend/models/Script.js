const mongoose = require('mongoose');

const ScriptBlockSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['scene-heading', 'action', 'character', 'dialogue', 'parenthetical', 'transition'],
        default: 'action'
    },
    content: { type: String, default: '' }
});

const ScriptPageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    blocks: [ScriptBlockSchema],
    storyboardPageId: { type: String, default: null }
});

const ScriptSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    pages: [ScriptPageSchema],
    pageColor: { type: String, default: '#ffffff' },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Script', ScriptSchema);
