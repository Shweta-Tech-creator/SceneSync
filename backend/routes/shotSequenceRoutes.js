const express = require('express');
const router = express.Router();
const ShotSequence = require('../models/ShotSequence');
const Project = require('../models/Project');

// Create or Get Shot Sequence for a Project
router.post('/create', async (req, res) => {
    try {
        const { projectId, title } = req.body;

        if (!projectId) {
            return res.status(400).json({ success: false, message: 'Project ID is required' });
        }

        // Check if sequence already exists
        let sequence = await ShotSequence.findOne({ project: projectId });

        if (sequence) {
            return res.json({ success: true, sequence });
        }

        // Create new sequence
        sequence = new ShotSequence({
            project: projectId,
            title: title || 'Untitled Sequence',
            frames: []
        });

        await sequence.save();

        // Link to Project
        await Project.findByIdAndUpdate(projectId, { shotSequence: sequence._id });

        res.json({ success: true, sequence });
    } catch (error) {
        console.error('Error creating sequence:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get Sequence by Project ID
router.get('/:projectId', async (req, res) => {
    try {
        const sequence = await ShotSequence.findOne({ project: req.params.projectId });
        if (!sequence) {
            return res.status(404).json({ success: false, message: 'Sequence not found' });
        }
        res.json({ success: true, sequence });
    } catch (error) {
        console.error('Error fetching sequence:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update Sequence
router.put('/:id', async (req, res) => {
    try {
        const { frames, audioTrack, title } = req.body;

        const updateData = { updatedAt: Date.now() };
        if (frames) updateData.frames = frames;
        if (audioTrack !== undefined) updateData.audioTrack = audioTrack;
        if (title) updateData.title = title;

        const sequence = await ShotSequence.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!sequence) {
            return res.status(404).json({ success: false, message: 'Sequence not found' });
        }

        res.json({ success: true, sequence });
    } catch (error) {
        console.error('Error updating sequence:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete Sequence
router.delete('/:id', async (req, res) => {
    try {
        const sequence = await ShotSequence.findById(req.params.id);
        if (!sequence) {
            return res.status(404).json({ success: false, message: 'Sequence not found' });
        }

        // Remove reference from Project
        await Project.findByIdAndUpdate(sequence.project, { $unset: { shotSequence: "" } });

        await sequence.deleteOne();

        res.json({ success: true, message: 'Sequence deleted' });
    } catch (error) {
        console.error('Error deleting sequence:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
