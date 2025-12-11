import React from 'react';

const Controls = ({ selectedFrame, onUpdateFrame, scriptLines = [] }) => {
    if (!selectedFrame) {
        return (
            <div className="edit-panel">
                <div className="empty-state-large">
                    <p>Select a frame to edit properties.</p>
                </div>
            </div>
        );
    }

    const handleChange = (field, value) => {
        onUpdateFrame({ ...selectedFrame, [field]: value });
    };

    return (
        <div className="edit-panel">
            <div className="sequence-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid #334155', marginBottom: '24px', height: 'auto', background: 'transparent' }}>
                <h3 style={{ margin: 0, color: '#cbd5e1', fontSize: '1rem' }}>Frame Properties</h3>
            </div>

            <div className="edit-group">
                <label>Duration (seconds)</label>
                <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={selectedFrame.duration}
                    onChange={(e) => handleChange('duration', parseFloat(e.target.value))}
                    className="edit-input"
                />
            </div>

            <div className="edit-group">
                <label>Script Line</label>
                <select
                    value={selectedFrame.scriptLineId || ''}
                    onChange={(e) => {
                        const lineId = e.target.value;
                        const line = scriptLines.find(l => l.id === lineId);
                        onUpdateFrame({
                            ...selectedFrame,
                            scriptLineId: lineId,
                            textOverlay: line ? line.content : selectedFrame.textOverlay
                        });
                    }}
                    className="edit-select"
                >
                    <option value="">-- Select Script Line --</option>
                    {scriptLines && scriptLines.map(line => (
                        <option key={line.id} value={line.id}>
                            {line.type.toUpperCase()}: {line.content.substring(0, 50)}...
                        </option>
                    ))}
                </select>
            </div>

            <div className="edit-group">
                <label>Text Overlay</label>
                <textarea
                    value={selectedFrame.textOverlay || ''}
                    onChange={(e) => handleChange('textOverlay', e.target.value)}
                    placeholder="Enter dialog or scene description..."
                    className="edit-textarea"
                />
            </div>

            <div className="edit-group">
                <label>Transition</label>
                <select
                    value={selectedFrame.transition || 'cut'}
                    onChange={(e) => handleChange('transition', e.target.value)}
                    className="edit-select"
                >
                    <option value="cut">Cut</option>
                    <option value="fade">Fade</option>
                    <option value="dissolve">Dissolve</option>
                </select>
            </div>

            {selectedFrame.type === 'image' && (
                <div className="edit-group">
                    <label>Image URL</label>
                    <input
                        type="text"
                        value={selectedFrame.image || ''}
                        onChange={(e) => handleChange('image', e.target.value)}
                        className="edit-input"
                        placeholder="https://..."
                    />
                </div>
            )}
        </div>
    );
};

export default Controls;
