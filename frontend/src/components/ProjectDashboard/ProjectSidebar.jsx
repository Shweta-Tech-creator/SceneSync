import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import io from 'socket.io-client';

const ProjectSidebar = ({ project, currentUser }) => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [socket, setSocket] = useState(null);

    // Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Join project room and listen for comments
    useEffect(() => {
        if (socket && project) {
            socket.emit('join-project', project._id);

            // Listen for new comments
            socket.on('new-comment', (newComment) => {
                setComments(prev => [...prev, newComment]);
            });

            // Fetch existing comments
            fetchComments();
        }

        return () => {
            if (socket) {
                socket.off('new-comment');
            }
        };
    }, [socket, project]);

    const fetchComments = async () => {
        if (!project) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project._id}/comments`);
            const data = await response.json();
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleSendComment = async () => {
        if (!comment.trim() || !project || !currentUser) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser._id,
                    text: comment,
                    username: currentUser.username
                })
            });

            const data = await response.json();

            if (data.success) {
                // Add comment locally
                setComments(prev => [...prev, data.comment]);

                // Emit to other users via Socket.io
                if (socket) {
                    socket.emit('new-comment', {
                        projectId: project._id,
                        comment: data.comment
                    });
                }

                setComment('');
            }
        } catch (error) {
            console.error('Error sending comment:', error);
            alert('Failed to send comment. Please try again.');
        }
    };

    const handleInviteCollaborator = async () => {
        if (inviteEmail.trim()) {
            try {
                console.log('Sending invitation with data:', {
                    email: inviteEmail,
                    role: inviteRole,
                    inviterName: currentUser?.username || 'Current User',
                    projectName: project.title,
                    projectId: project._id
                });

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invitations/send-invitation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: inviteEmail,
                        role: inviteRole,
                        inviterName: currentUser?.username || 'Current User',
                        projectName: project.title,
                        projectId: project._id
                    })
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (data.success) {
                    alert(`✅ ${data.message}`);
                } else {
                    const errorMsg = data.message || data.error || 'Unknown error occurred';
                    alert(`❌ ${errorMsg}`);
                    console.error('Backend error:', data);
                }
            } catch (error) {
                console.error('Error sending invitation:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                alert('❌ Failed to send invitation. Please try again.');
            }

            setInviteEmail('');
            setInviteRole('editor');
            setShowInviteModal(false);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    if (!project) return (
        <div className="project-sidebar">
            <div className="empty-state" style={{ border: 'none', padding: '2rem' }}>
                <p>Select a project to view details</p>
            </div>
        </div>
    );

    // Deduplicate collaborators more thoroughly
    const deduplicateCollaborators = (collabs) => {
        const seen = new Set();
        return collabs.filter(collab => {
            const userId = collab.user?._id;
            const username = collab.user?.username;
            const key = userId || username;

            if (!key || seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    };

    // Filter out duplicates and ensure owner is not in collaborators list
    const uniqueCollaborators = (project.collaborators || []).filter(
        collab => collab.user && collab.user._id !== project.owner?._id
    );

    const allCollaborators = deduplicateCollaborators([
        { user: project.owner, role: 'Owner', active: true },
        ...uniqueCollaborators
    ]);

    return (
        <div className="project-sidebar">
            <div className="sidebar-header">
                <h2>{project.title}</h2>
                <span className={`card-status status-${project.status.toLowerCase()}`}>
                    {project.status}
                </span>
            </div>

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
                    {allCollaborators.map((collab) => {
                        const uniqueKey = collab.user?._id || collab.user?.username || Math.random();
                        return (
                            <div key={uniqueKey} className="collaborator-item">
                                <div className="collaborator-avatar">
                                    {collab.user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="collaborator-info">
                                    <div className="collaborator-name">
                                        {collab.user?.username || 'Unknown User'}
                                        {collab.user?._id === currentUser?._id && ' (You)'}
                                    </div>
                                    <div className="collaborator-status">{collab.role}</div>
                                </div>
                                <div className={`online-status ${collab.active ? 'active' : ''}`} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Comments Section */}
            <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="section-header">
                    <h3>Comments</h3>
                </div>
                <div className="comments-list">
                    {comments && comments.length > 0 ? (
                        comments.map((commentItem, index) => (
                            <div key={index} className="comment-item">
                                <div className="comment-author">
                                    {commentItem.username || commentItem.user?.username || 'Unknown User'}
                                </div>
                                <div className="comment-text">{commentItem.text}</div>
                                <div className="comment-time">{formatTime(commentItem.createdAt)}</div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No comments yet</div>
                    )}
                </div>

                <div className="comment-input-area">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                    />
                    <button
                        onClick={handleSendComment}
                        className="send-comment-btn"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && createPortal(
                <div className="project-dashboard-modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="project-dashboard-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#f1f5f9' }}>Invite Collaborator</h3>
                            <button
                                className="close-modal-btn"
                                onClick={() => setShowInviteModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
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
                            </div>

                            <div className="form-group">
                                <label htmlFor="invite-role">Role & Permissions</label>
                                <select
                                    id="invite-role"
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="owner">Owner - Full access (can delete project)</option>
                                    <option value="editor">Editor - Can add panels, draw, comment</option>
                                    <option value="viewer">Viewer - Can only view project and comment</option>
                                </select>
                            </div>

                            <div className="role-description" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid #3b82f6', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                {inviteRole === 'owner' && (
                                    <p style={{ margin: 0, color: '#e2e8f0' }}>👑 <strong>Owner:</strong> Full control including project deletion</p>
                                )}
                                {inviteRole === 'editor' && (
                                    <p style={{ margin: 0, color: '#e2e8f0' }}>✏️ <strong>Editor:</strong> Can create and modify content</p>
                                )}
                                {inviteRole === 'viewer' && (
                                    <p style={{ margin: 0, color: '#e2e8f0' }}>👁️ <strong>Viewer:</strong> Read-only access with commenting</p>
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowInviteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-submit"
                                onClick={handleInviteCollaborator}
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ProjectSidebar;
