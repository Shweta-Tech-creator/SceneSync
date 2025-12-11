import React, { useState } from 'react';
import Header from '../components/Header';
import ProjectDashboard from '../components/ProjectDashboard/ProjectDashboard';
import StoryboardEditor from '../components/Storyboard/StoryboardEditor';
import ScriptEditor from '../components/SceneScript/ScriptEditor';
import SceneBreakdown from '../components/SceneBreakdown/SceneBreakdown';
import ShotSequenceEditor from '../components/ShotSequence/ShotSequenceEditor';
import './Features.css';

const Features = () => {
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'storyboard', 'script', 'breakdown', 'shotSequence'
    const [dashboardKey, setDashboardKey] = useState(0);
    const [selectedProject, setSelectedProject] = useState(null);

    const resetDashboard = () => {
        setDashboardKey(prev => prev + 1);
        setViewMode('dashboard');
        setSelectedProject(null);
    };

    return (
        <div className="features-page">
            <Header
                viewMode={viewMode}
                setViewMode={setViewMode}
                resetDashboard={resetDashboard}
            />
            <div className="features-content" style={{ padding: 0 }}>
                {viewMode === 'storyboard' && (
                    <StoryboardEditor
                        storyboardId={selectedProject?._id || null}
                        project={selectedProject}
                        onBack={() => {
                            setViewMode('dashboard');
                            setSelectedProject(null);
                        }}
                    />
                )}
                {viewMode === 'script' && (
                    <ScriptEditor
                        projectId={selectedProject?._id || null}
                        onBack={() => {
                            setViewMode('dashboard');
                            setSelectedProject(null);
                        }}
                    />
                )}
                {viewMode === 'breakdown' && (
                    <SceneBreakdown onBack={() => setViewMode('dashboard')} />
                )}
                {viewMode === 'shotSequence' && (
                    <ShotSequenceEditor
                        project={selectedProject}
                        onBack={() => setViewMode('dashboard')}
                    />
                )}
                {viewMode === 'dashboard' && (
                    <ProjectDashboard
                        key={dashboardKey}
                        onProjectSelect={setSelectedProject}
                    />
                )}
            </div>
        </div>
    );
};

export default Features;
