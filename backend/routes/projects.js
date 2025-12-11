const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Storyboard = require('../models/Storyboard');
const User = require('../models/User');

// Get all projects for a user (Owner or Collaborator)
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId; // Assuming passed as query param for now, ideally from auth middleware

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const projects = await Project.find({
            $or: [
                { owner: userId },
                { 'collaborators.user': userId }
            ]
        })
            .populate('owner', 'username avatar')
            .populate('collaborators.user', 'username avatar')
            .sort({ updatedAt: -1 });

        res.json({ success: true, projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
});

// Create a new project
router.post('/', async (req, res) => {
    try {
        const { title, description, genre, tags, coverImage, status, ownerId } = req.body;

        // Create a default storyboard for the project
        const newStoryboard = new Storyboard({
            pages: [{ pageNumber: 1 }]
        });
        await newStoryboard.save();

        const newProject = new Project({
            title,
            description,
            genre,
            tags,
            coverImage,
            status,
            owner: ownerId,
            storyboard: newStoryboard._id
        });

        await newProject.save();

        // Update storyboard with project reference
        newStoryboard.project = newProject._id;
        await newStoryboard.save();

        res.status(201).json({ success: true, project: newProject, message: 'Project created successfully' });
    } catch (error) {
        console.error('Error creating project:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ success: false, message: 'Failed to create project', error: error.message });
    }
});

// Update project
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const project = await Project.findByIdAndUpdate(id, updates, { new: true });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({ success: true, project, message: 'Project updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, message: 'Failed to update project' });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Delete associated storyboard
        if (project.storyboard) {
            await Storyboard.findByIdAndDelete(project.storyboard);
        }

        await Project.findByIdAndDelete(id);

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
});

// Add collaborator
router.post('/:id/collaborators', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if already a collaborator
        const isCollaborator = project.collaborators.some(c => c.user.toString() === userToAdd._id.toString());
        if (isCollaborator) {
            return res.status(400).json({ success: false, message: 'User is already a collaborator' });
        }

        project.collaborators.push({
            user: userToAdd._id,
            role: role || 'Viewer'
        });

        await project.save();

        res.json({ success: true, project, message: 'Collaborator added successfully' });
    } catch (error) {
        console.error('Error adding collaborator:', error);
        res.status(500).json({ success: false, message: 'Failed to add collaborator' });
    }
});

// Get comments for a project
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id)
            .populate('comments.user', 'username avatar');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({ success: true, comments: project.comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
});

// Add comment to a project
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, text, username } = req.body;

        if (!text || !userId) {
            return res.status(400).json({ success: false, message: 'Text and user ID are required' });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const newComment = {
            user: userId,
            text,
            username: username || 'Unknown User',
            createdAt: new Date()
        };

        project.comments.push(newComment);
        await project.save();

        // Populate the user field for the response
        const populatedProject = await Project.findById(id)
            .populate('comments.user', 'username avatar');

        const addedComment = populatedProject.comments[populatedProject.comments.length - 1];

        res.json({
            success: true,
            comment: addedComment,
            message: 'Comment added successfully'
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});

module.exports = router;
