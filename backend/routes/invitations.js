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
            pass: process.env.EMAIL_APP_PASSWORD
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
            from: `"${process.env.APP_NAME || 'SceneCraft'}" <${process.env.EMAIL_USER}>`,
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
                            <h1>🎬 SceneCraft Invitation</h1>
                        </div>
                        <div class="content">
                            <h2>You've been invited to collaborate!</h2>
                            <p><strong>${inviterName || 'A team member'}</strong> has invited you to collaborate on <strong>${projectName || 'a project'}</strong> on SceneCraft.</p>
                            
                            <p>SceneCraft is a collaborative storyboard editor that lets you create, edit, and share storyboards in real-time with your team.</p>
                            
                            <center>
                                <a href="${acceptUrl}" class="button">
                                    Accept Invitation
                                </a>
                            </center>
                            
                            <p>If you don't have an account yet, you'll be able to create one when you click the button above.</p>
                            
                            <p>Happy collaborating!</p>
                            <p>- The SceneCraft Team</p>
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
        console.error('Error sending invitation:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            success: false,
            message: 'Failed to send invitation',
            error: error.message
        });
    }
});

// Accept invitation
router.post('/accept/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Find invitation
        const invitation = await Invitation.findOne({ token, status: 'pending' })
            .populate('project');

        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invitation not found or already used' });
        }

        // Check if expired
        if (new Date() > invitation.expiresAt) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ success: false, message: 'Invitation has expired' });
        }

        // Add user as collaborator
        const project = await Project.findById(invitation.project._id);

        // Don't add owner as collaborator
        if (project.owner.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'You are already the owner of this project'
            });
        }

        // Check if already a collaborator
        const isCollaborator = project.collaborators.some(c => c.user.toString() === userId.toString());
        if (isCollaborator) {
            // Mark invitation as accepted even if already a collaborator
            invitation.status = 'accepted';
            await invitation.save();

            return res.json({
                success: true,
                message: 'You are already a collaborator on this project',
                project: project
            });
        }

        // Add as new collaborator
        project.collaborators.push({
            user: userId,
            role: invitation.role,
            active: true,
            lastActive: new Date()
        });
        await project.save();

        // Mark invitation as accepted
        invitation.status = 'accepted';
        await invitation.save();

        res.json({
            success: true,
            message: 'Invitation accepted successfully',
            project: project
        });

    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
            error: error.message
        });
    }
});

module.exports = router;
