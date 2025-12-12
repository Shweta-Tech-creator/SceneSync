const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const User = require('../models/User');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS
        }
    });
};

// Send invitation email
router.post('/send-invitation', async (req, res) => {
    try {
        const { email, inviterName, projectName, projectId, role } = req.body;

        if (!email || !projectId) {
            return res.status(400).json({ success: false, message: 'Email and project ID are required' });
        }

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Create invitation record
        const invitation = new Invitation({
            email,
            project: projectId,
            inviter: project.owner,
            role: role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Viewer'
        });

        await invitation.save();

        const transporter = createTransporter();
        const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/accept-invitation/${invitation.token}`;

        const mailOptions = {
            from: `"${process.env.APP_NAME || 'SceneSync'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `You've been invited to collaborate on ${projectName || 'a project'}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0B2545 0%, #1a3a5c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .header h1 { margin: 0; color: #ffd700; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #0B2545; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎬 SceneSync Invitation</h1>
                        </div>
                        <div class="content">
                            <h2>You've been invited to collaborate!</h2>
                            <p><strong>${inviterName || 'A team member'}</strong> has invited you to collaborate on <strong>${projectName || 'a project'}</strong> on SceneSync.</p>
                            
                            <p>SceneSync is a collaborative storyboard editor that lets you create, edit, and share storyboards in real-time with your team.</p>
                            
                            <center>
                                <a href="${acceptUrl}" class="button">
                                    Accept Invitation
                                </a>
                            </center>
                            
                            <p>If you don't have an account yet, you'll be able to create one when you click the button above.</p>
                            
                            <p>Happy collaborating!</p>
                            <p>- The SceneSync Team</p>
                        </div>
                        <div class="footer">
                            <p>This invitation was sent to ${email}. If you didn't expect this email, you can safely ignore it.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: `Invitation sent successfully to ${email}`
        });

    } catch (error) {
        console.error('=== EMAIL SENDING ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Command:', error.command);
        console.error('Stack:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Failed to send invitation. Please check server logs for details.',
            error: error.message
        });
    }
});

// Get invitation details (for pre-filling signup form)
router.get('/details/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findOne({ token, status: 'pending' });

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found or already used'
            });
        }

        // Check if expired
        if (new Date() > invitation.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Invitation has expired'
            });
        }

        res.json({
            success: true,
            email: invitation.email,
            role: invitation.role
        });
    } catch (error) {
        console.error('Error fetching invitation details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invitation details'
        });
    }
});

// Accept invitation
router.post('/accept/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { userId } = req.body;

        console.log('=== ACCEPT INVITATION REQUEST ===');
        console.log('Token:', token);
        console.log('User ID:', userId);

        if (!userId) {
            console.log('ERROR: No user ID provided');
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Find invitation
        const invitation = await Invitation.findOne({ token, status: 'pending' })
            .populate('project');

        console.log('Invitation found:', invitation ? 'YES' : 'NO');
        if (invitation) {
            console.log('Invitation details:', {
                email: invitation.email,
                projectId: invitation.project?._id,
                projectTitle: invitation.project?.title,
                role: invitation.role,
                status: invitation.status
            });
        }

        if (!invitation) {
            console.log('ERROR: Invitation not found or already used');
            return res.status(404).json({ success: false, message: 'Invitation not found or already used' });
        }

        // Check if expired
        if (new Date() > invitation.expiresAt) {
            console.log('ERROR: Invitation expired');
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ success: false, message: 'Invitation has expired' });
        }

        // Add user as collaborator
        const project = await Project.findById(invitation.project._id);
        console.log('Project found:', project ? 'YES' : 'NO');
        console.log('Project owner ID:', project?.owner);
        console.log('Project owner ID (string):', project?.owner?.toString());
        console.log('User ID from request:', userId);
        console.log('User ID (string):', userId.toString());
        console.log('Are they equal?:', project.owner.toString() === userId.toString());
        console.log('Current collaborators count:', project?.collaborators?.length || 0);

        // Don't add owner as collaborator
        if (project.owner.toString() === userId.toString()) {
            console.log('ERROR: User is already the owner');
            return res.status(400).json({
                success: false,
                message: 'You are already the owner of this project'
            });
        }

        // Check if already a collaborator
        const isCollaborator = project.collaborators.some(c => c.user.toString() === userId.toString());
        console.log('Is already collaborator:', isCollaborator);

        if (isCollaborator) {
            // Mark invitation as accepted even if already a collaborator
            invitation.status = 'accepted';
            await invitation.save();
            console.log('User already a collaborator, invitation marked as accepted');

            return res.json({
                success: true,
                message: 'You are already a collaborator on this project',
                project: project
            });
        }

        // Add as new collaborator
        console.log('Adding user as new collaborator...');
        project.collaborators.push({
            user: userId,
            role: invitation.role,
            active: true,
            lastActive: new Date()
        });
        await project.save();
        console.log('Collaborator added successfully!');
        console.log('New collaborators count:', project.collaborators.length);

        // Mark invitation as accepted
        invitation.status = 'accepted';
        await invitation.save();
        console.log('Invitation marked as accepted');

        res.json({
            success: true,
            message: 'Invitation accepted successfully',
            project: project
        });

    } catch (error) {
        console.error('ERROR in accept invitation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
            error: error.message
        });
    }
});

module.exports = router;
