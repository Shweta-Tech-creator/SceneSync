const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get user statistics (projects and collaborators count)
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all projects where user is owner or collaborator
        const userProjects = await Project.find({
            $or: [
                { owner: userId },
                { 'collaborators.user': userId }
            ]
        });

        const projectsCount = userProjects.length;

        // Collect all unique collaborator IDs (excluding the current user)
        const collaboratorIds = new Set();
        userProjects.forEach(project => {
            // Add owner if it's not the current user
            if (project.owner && project.owner.toString() !== userId) {
                collaboratorIds.add(project.owner.toString());
            }

            // Add collaborators
            if (project.collaborators) {
                project.collaborators.forEach(collab => {
                    if (collab.user && collab.user.toString() !== userId) {
                        collaboratorIds.add(collab.user.toString());
                    }
                });
            }
        });

        const collaboratorsCount = collaboratorIds.size;

        res.json({
            success: true,
            stats: {
                projects: projectsCount,
                collaborators: collaboratorsCount
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: error.message
        });
    }
});

module.exports = router;
