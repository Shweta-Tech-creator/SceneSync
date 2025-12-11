import React, { useState } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: '',
        status: 'Draft'
    });

    if (!isOpen) return null;

    console.log('CreateProjectModal is rendering');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
        setFormData({ title: '', description: '', genre: '', status: 'Draft' });
    };

    return (
        <div className="project-dashboard-modal-overlay" onClick={onClose}>
            <div className="project-dashboard-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter project title"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Project description..."
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                color: 'white',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Genre</label>
                        <select
                            value={formData.genre}
                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        >
                            <option value="">Select Genre</option>
                            <option value="Action">Action</option>
                            <option value="Comedy">Comedy</option>
                            <option value="Drama">Drama</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Horror">Horror</option>
                            <option value="Documentary">Documentary</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
