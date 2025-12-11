import React, { useRef } from 'react';

const Timeline = ({ frames, currentFrameIndex, onSelectFrame, onReorderFrames, onDeleteFrame, onAddFrame }) => {
    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.target.classList.add('dragging');
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        const copyListItems = [...frames];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onReorderFrames(copyListItems);
    };

    return (
        <div className="timeline-panel">
            <div className="timeline-header">
                <h3>Timeline</h3>
                <button className="add-frame-btn" onClick={onAddFrame} title="Add Frame">
                    +
                </button>
            </div>
            <div className="frames-list">
                {frames.map((frame, index) => (
                    <div
                        key={frame.id}
                        className={`frame-item ${index === currentFrameIndex ? 'active' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectFrame(index)}
                    >
                        <div className="frame-thumbnail">
                            {frame.image ? (
                                <img src={frame.image} alt={`Frame ${index + 1}`} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#000' }} />
                            )}
                        </div>
                        <div className="frame-info">
                            <span className="frame-number">Frame {index + 1}</span>
                            <span className="frame-duration">{frame.duration}s</span>
                        </div>
                        <div className="frame-actions">
                            <button
                                className="delete-frame-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteFrame(index);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
