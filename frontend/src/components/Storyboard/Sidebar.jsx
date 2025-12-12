import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ collaborators, comments, onAddComment, project }) => {
    const [newComment, setNewComment] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor'); // Default role

    console.log('Sidebar: Received props:', {
        collaboratorsCount: collaborators?.length,
        commentsCount: comments?.length,
        project: project?.title
    });

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    const handleInviteCollaborator = async () => {
        if (inviteEmail.trim()) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invitations/send-invitation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: inviteEmail,
                        role: inviteRole,
                        inviterName: 'Current User', // TODO: Get from auth context
                        storyboardName: project?.title || 'Project',
                        projectId: project?._id || project?.id
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert(`✅ ${data.message}`);
                } else {
                    alert(`❌ ${data.message}`);
                }
            } catch (error) {
                console.error('Error sending invitation:', error);
                alert('❌ Failed to send invitation. Please try again.');
            }

            setInviteEmail('');
            setInviteRole('editor'); // Reset to default
            setShowInviteModal(false);
        }
    };

    return (
        <div className="sidebar">
            {/* Collaborators Section */}
            <div className="sidebar-section">
                <div className="section-header">
                    <h3>Collaborators</h3>
                    <button
                        className="invite-btn"
                        onClick={() => setShowInviteModal(true)}
                        title="Invite Collaborator"
                    >
                        + Invite
                    </button>
                </div>
                <div className="collaborators-list">
                    {collaborators && collaborators.length > 0 ? (() => {
                        // Deduplicate collaborators based on user ID or username
                        const uniqueCollaborators = collaborators.reduce((acc, collab) => {
                            const userId = collab.user?._id || collab._id;
                            const username = collab.user?.username || collab.username;
                            const uniqueKey = userId || username;

                            // Check if this collaborator is already in the accumulator
                            const exists = acc.find(c => {
                                const existingId = c.user?._id || c._id;
                                const existingUsername = c.user?.username || c.username;
                                return (existingId && existingId === userId) ||
                                    (existingUsername && existingUsername === username);
                            });

                            if (!exists && uniqueKey) {
                                acc.push(collab);
                            }
                            return acc;
                        }, []);

                        return uniqueCollaborators.map((collab) => {
                            const uniqueKey = collab.user?._id || collab._id || collab.username || Math.random();
                            console.log('Sidebar: Rendering collaborator:', {
                                collab,
                                username: collab.user?.username || collab.username || collab.name,
                                role: collab.role,
                                email: collab.user?.email || collab.email
                            });
                            return (
                                <div key={uniqueKey} className="collaborator-item">
                                    <div className="collaborator-avatar">
                                        {(collab.user?.username || collab.username || collab.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="collaborator-info">
                                        <div className="collaborator-name">
                                            {collab.user?.username || collab.username || collab.name || 'Unknown User'}
                                        </div>
                                        <div className="collaborator-status">{collab.role || collab.user?.email || collab.email || 'Online'}</div>
                                    </div>
                                </div>
                            );
                        });
                    })() : (
                        <div className="empty-state">No collaborators yet. Invite someone to start!</div>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <div className="sidebar-section">
                <h3>Comments</h3>
                <div className="comments-list">
                    {comments && comments.length > 0 ? (
                        comments.map((comment, index) => (
                            <div key={index} className="comment-item">
                                <div className="comment-author">{comment.author}</div>
                                <div className="comment-text">{comment.text}</div>
                                <div className="comment-time">{comment.time}</div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No comments yet</div>
                    )}
                </div>
                <div className="comment-input">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button onClick={handleAddComment}>Post</button>
                </div>
            </div>

            {/* Project Information Section */}
            {project && (
                <div className="sidebar-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#f1f5f9' }}>Active Project</h3>
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.5rem'
                        }}>
                            Project Name
                        </div>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#f1f5f9',
                            marginBottom: '0.75rem'
                        }}>
                            {project.title}
                        </div>
                        {project.description && (
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#cbd5e1',
                                marginBottom: '0.75rem',
                                lineHeight: '1.5'
                            }}>
                                {project.description}
                            </div>
                        )}
                        {project.genre && (
                            <div style={{
                                display: 'inline-block',
                                fontSize: '0.75rem',
                                color: '#60a5fa',
                                background: 'rgba(59, 130, 246, 0.2)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontWeight: '600'
                            }}>
                                {project.genre}
                            </div>
                        )}
                    </div>
                    <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#86efac'
                    }}>
                        ✓ All changes are automatically saved to this project
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="invite-modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Invite Collaborator</h3>
                            <button
                                className="close-modal-btn"
                                onClick={() => setShowInviteModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <label htmlFor="invite-email">Email Address</label>
                            <input
                                id="invite-email"
                                type="email"
                                placeholder="Enter email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleInviteCollaborator()}
                                autoFocus
                            />

                            <label htmlFor="invite-role" className="role-label">Role & Permissions</label>
                            <select
                                id="invite-role"
                                className="role-select"
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                            >
                                <option value="owner">Owner - Full access (can delete project)</option>
                                <option value="editor">Editor - Can add panels, draw, comment</option>
                                <option value="viewer">Viewer - Can only view project and comment</option>
                            </select>

                            <div className="role-description">
                                {inviteRole === 'owner' && (
                                    <p><strong>Owner:</strong> Full control including project deletion</p>
                                )}
                                {inviteRole === 'editor' && (
                                    <p><strong>Editor:</strong> Can create and modify content</p>
                                )}
                                {inviteRole === 'viewer' && (
                                    <p><strong>Viewer:</strong> Read-only access with commenting</p>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowInviteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="send-invite-btn"
                                onClick={handleInviteCollaborator}
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
