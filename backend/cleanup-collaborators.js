// Script to remove duplicate collaborators from projects
const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/Project');

async function removeDuplicateCollaborators() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const projects = await Project.find({});
        console.log(`Found ${projects.length} projects`);

        for (const project of projects) {
            const originalLength = project.collaborators.length;

            // Remove duplicates by keeping only unique user IDs
            const seen = new Set();
            project.collaborators = project.collaborators.filter(collab => {
                const userId = collab.user.toString();
                if (seen.has(userId)) {
                    return false; // Duplicate, remove it
                }
                seen.add(userId);
                return true; // Keep it
            });

            if (project.collaborators.length !== originalLength) {
                await project.save();
                console.log(`Cleaned project: ${project.title} - Removed ${originalLength - project.collaborators.length} duplicate(s)`);
            } else {
                console.log(`Project: ${project.title} - No duplicates found`);
            }
        }

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

removeDuplicateCollaborators();
