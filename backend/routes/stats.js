const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');

// Get current user statistics (projects and collaborators count)
router.get('/user-stats', async (req, res) => {
    try {
        // Extract token from Authorization header
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const userId = decoded.id;
        console.log('Fetching stats for user:', userId);

        // Find all projects where user is owner or collaborator
        const userProjects = await Project.find({
            $or: [
                { owner: userId },
                { 'collaborators.user': userId }
            ]
        }).populate('collaborators.user');

        console.log('Found projects:', userProjects.length);
        const projectsCount = userProjects.length;

        // Collect all unique collaborator IDs (excluding the current user)
        const collaboratorIds = new Set();
        userProjects.forEach(project => {
            console.log('Processing project:', project.title);
            console.log('Project owner:', project.owner);
            console.log('Project collaborators:', project.collaborators);

            // Add owner if it's not the current user
            if (project.owner && project.owner.toString() !== userId) {
                collaboratorIds.add(project.owner.toString());
            }

            // Add collaborators
            if (project.collaborators) {
                project.collaborators.forEach(collab => {
                    if (collab.user && collab.user._id && collab.user._id.toString() !== userId) {
                        collaboratorIds.add(collab.user._id.toString());
                        console.log('Added collaborator:', collab.user._id.toString());
                    }
                });
            }
        });

        const collaboratorsCount = collaboratorIds.size;
        console.log('Total unique collaborators:', collaboratorsCount);
        console.log('Total projects:', projectsCount);

        res.json({
            success: true,
            totalProjects: projectsCount,
            totalCollaborators: collaboratorsCount
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

// Get user statistics (projects and collaborators count) - legacy endpoint
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
