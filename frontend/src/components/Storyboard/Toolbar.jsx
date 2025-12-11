import React from 'react';
import './Toolbar.css';

const Toolbar = ({ activeTool, setActiveTool, color, setColor, onBack, onSave }) => {
    const tools = [
        { id: 'select', label: 'Select', icon: '⬚' },
        { id: 'pencil', label: 'Pencil', icon: '✏️' },
        { id: 'brush', label: 'Brush', icon: '🖌️' },
        { id: 'eraser', label: 'Eraser', icon: '🧹' },
        { id: 'rectangle', label: 'Rectangle', icon: '▭' },
        { id: 'circle', label: 'Circle', icon: '○' },
        { id: 'arrow', label: 'Arrow', icon: '→' },
        { id: 'bubble', label: 'Bubble', icon: '💬' },
        { id: 'connector', label: 'Connector', icon: '↗' }
    ];

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <h2 className="toolbar-title">Storyboard Editor</h2>
            </div>

            <div className="toolbar-center">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                    >
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-label">{tool.label}</span>
                    </button>
                ))}
            </div>

            <div className="toolbar-right">
                <button className="save-btn" onClick={onSave} title="Save Storyboard">
                    💾 Save
                </button>
                <div className="divider"></div>
                <label className="color-picker-label">Color:</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="color-picker"
                />
            </div>
        </div>
    );
};

export default Toolbar;
