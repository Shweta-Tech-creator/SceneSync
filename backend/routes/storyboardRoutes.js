const express = require('express');
const router = express.Router();
const Storyboard = require('../models/Storyboard');

// Get storyboard by Project ID
router.get('/:projectId', async (req, res) => {
    try {
        let storyboard = await Storyboard.findOne({ project: req.params.projectId });

        if (!storyboard) {
            // Create default storyboard if it doesn't exist
            storyboard = new Storyboard({
                project: req.params.projectId,
                pages: [{
                    pageNumber: 1,
                    canvasData: {},
                    thumbnail: ''
                }]
            });
            await storyboard.save();
        }

        res.json({ success: true, storyboard });
    } catch (error) {
        console.error('Error fetching storyboard:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Save storyboard
router.post('/:projectId', async (req, res) => {
    try {
        const { pages } = req.body;

        let storyboard = await Storyboard.findOne({ project: req.params.projectId });

        if (!storyboard) {
            storyboard = new Storyboard({
                project: req.params.projectId,
                pages
            });
        } else {
            storyboard.pages = pages;
            storyboard.updatedAt = Date.now();
        }

        await storyboard.save();
        res.json({ success: true, storyboard });
    } catch (error) {
        console.error('Error saving storyboard:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
