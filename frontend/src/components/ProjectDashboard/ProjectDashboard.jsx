import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import ProjectSidebar from './ProjectSidebar';
import StoryboardEditor from '../Storyboard/StoryboardEditor';
import ScriptEditor from '../SceneScript/ScriptEditor';
import './ProjectDashboard.css';

const ProjectDashboard = ({ onProjectSelect }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeStoryboard, setActiveStoryboard] = useState(null);
    const [activeScript, setActiveScript] = useState(null);

    // Notify parent when project is selected
    useEffect(() => {
        if (selectedProject && onProjectSelect) {
            onProjectSelect(selectedProject);
        }
    }, [selectedProject, onProjectSelect]);

    // Fetch projects
    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    // Refetch selected project when it changes to get updated collaborators
    useEffect(() => {
        if (selectedProject) {
            refetchSelectedProject();
        }
    }, [selectedProject?._id]);

    const refetchSelectedProject = async () => {
        if (!selectedProject) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects?userId=${user._id}`);
            const data = await response.json();
            if (data.success) {
                const updatedProject = data.projects.find(p => p._id === selectedProject._id);
                if (updatedProject) {
                    setSelectedProject(updatedProject);
                }
            }
        } catch (error) {
            console.error('Error refetching project:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects?userId=${user._id}`);
            const data = await response.json();
            if (data.success) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            console.log('Creating project with data:', { ...projectData, ownerId: user._id });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...projectData,
                    ownerId: user._id
                }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                setProjects([data.project, ...projects]);
                setIsCreateModalOpen(false);
                setSelectedProject(data.project);
                alert('✅ Project created successfully!');
            } else {
                const errorMsg = data.message || data.error || 'Unknown error';
                alert(`❌ ${errorMsg}`);
                console.error('Backend error:', data);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            alert('Failed to create project. Check console for details.');
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProjects(projects.filter(p => p._id !== projectId));
                if (selectedProject?._id === projectId) {
                    setSelectedProject(null);
                }
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleEditProject = (project) => {
        setActiveStoryboard(project);
    };

    const handleOpenScript = (project) => {
        setActiveScript(project);
    };

    // If a storyboard is active, render the editor instead of dashboard
    if (activeStoryboard) {
        return (
            <StoryboardEditor
                storyboardId={activeStoryboard.storyboard}
                onBack={() => setActiveStoryboard(null)}
            />
        );
    }

    if (activeScript) {
        return (
            <ScriptEditor
                projectId={activeScript._id}
                onBack={() => setActiveScript(null)}
            />
        );
    }

    return (
        <div className="project-dashboard">
            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title">
                        <h1>Projects</h1>
                        <p>Manage your storyboards and scenes</p>
                    </div>
                    <button
                        className="create-project-btn"
                        onClick={() => {
                            console.log('Create Project button clicked');
                            setIsCreateModalOpen(true);
                            console.log('Modal state set to true');
                        }}
                    >
                        + New Project
                    </button>
                </div>

                {loading ? (
                    <div>Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <h3>No projects yet</h3>
                        <p>Create your first project to get started with SceneSync</p>
                        <button
                            className="create-project-btn"
                            style={{ margin: '0 auto' }}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {projects.map(project => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                isSelected={selectedProject?._id === project._id}
                                onSelect={setSelectedProject}
                                onEdit={handleEditProject}
                                onOpenScript={handleOpenScript}
                                onDelete={handleDeleteProject}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ProjectSidebar
                project={selectedProject}
                currentUser={user}
            />

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
};

export default ProjectDashboard;
