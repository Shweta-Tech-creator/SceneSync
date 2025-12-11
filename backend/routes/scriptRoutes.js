const express = require('express');
const router = express.Router();
const Script = require('../models/Script');
const Project = require('../models/Project');

// Get script by Project ID
router.get('/:projectId', async (req, res) => {
    try {
        console.log('=== LOADING SCRIPT ===');
        console.log('Project ID:', req.params.projectId);

        let script = await Script.findOne({ project: req.params.projectId });

        if (!script) {
            console.log('No script found, creating default');
            // Create default script if it doesn't exist
            script = new Script({
                project: req.params.projectId,
                pages: [{
                    id: 'page-1',
                    pageNumber: 1,
                    blocks: [
                        { id: '1', type: 'scene-heading', content: 'INT. SCENE 1 - DAY' },
                        { id: '2', type: 'action', content: 'Start writing your screenplay here...' }
                    ]
                }]
            });
            await script.save();
        } else if (script.blocks && script.blocks.length > 0 && (!script.pages || script.pages.length === 0)) {
            // Migration: Convert legacy blocks to Page 1
            console.log('Migrating legacy script to pages...');
            script.pages = [{
                id: 'page-1',
                pageNumber: 1,
                blocks: script.blocks
            }];
            script.blocks = undefined; // Remove legacy field
            await script.save();
        }

        console.log('Script found, pages:', script.pages?.length);
        if (script.pages && script.pages.length > 0) {
            console.log('First page blocks:', script.pages[0].blocks?.length);
            script.pages[0].blocks?.forEach((block, i) => {
                console.log(`Block ${i}:`, {
                    id: block.id,
                    type: block.type,
                    contentLength: block.content?.length,
                    contentPreview: block.content?.substring(0, 50)
                });
            });
        }
        console.log('=== END LOAD ===');

        res.json({ success: true, script });
    } catch (error) {
        console.error('Error fetching script:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Save script
router.post('/:projectId', async (req, res) => {
    try {
        const { pages } = req.body;

        console.log('=== SAVING SCRIPT ===');
        console.log('Project ID:', req.params.projectId);
        console.log('Pages received:', JSON.stringify(pages, null, 2));
        console.log('Number of pages:', pages?.length);
        if (pages && pages.length > 0) {
            console.log('First page blocks:', pages[0].blocks?.length);
            pages[0].blocks?.forEach((block, i) => {
                console.log(`Block ${i}:`, {
                    id: block.id,
                    type: block.type,
                    contentLength: block.content?.length,
                    contentPreview: block.content?.substring(0, 50)
                });
            });
        }

        let script = await Script.findOne({ project: req.params.projectId });

        if (!script) {
            console.log('Creating new script');
            script = new Script({
                project: req.params.projectId,
                pages
            });
        } else {
            console.log('Updating existing script');
            script.pages = pages;
            script.lastUpdated = Date.now();
        }

        await script.save();
        console.log('Script saved successfully');
        console.log('=== END SAVE ===');

        res.json({ success: true, script });
    } catch (error) {
        console.error('Error saving script:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
