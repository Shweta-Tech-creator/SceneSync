import React from 'react';

const ProjectCard = ({ project, onSelect, isSelected, onEdit, onOpenScript, onDelete }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div
            className={`project-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(project)}
        >
            <div className="card-image">
                {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} />
                ) : (
                    <div className="placeholder-image" style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                        color: '#64748b',
                        fontSize: '2rem'
                    }}>
                        🎬
                    </div>
                )}
                <span className={`card-status status-${project.status.toLowerCase().replace(' ', '')}`}>
                    {project.status}
                </span>
            </div>

            <div className="card-content">
                <h3 className="card-title">{project.title}</h3>
                <div className="card-meta">
                    <span>{project.genre || 'No Genre'}</span>
                    <span>Updated {formatDate(project.updatedAt)}</span>
                </div>

                <div className="card-actions">
                    <button
                        className="action-btn edit-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(project);
                        }}
                    >
                        Storyboard
                    </button>
                    <button
                        className="action-btn edit-btn"
                        style={{ backgroundColor: '#0f172a' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenScript(project);
                        }}
                    >
                        Script
                    </button>
                    <button
                        className="action-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Duplicate logic
                        }}
                    >
                        Copy
                    </button>
                    <button
                        className="action-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this project?')) {
                                onDelete(project._id);
                            }
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
