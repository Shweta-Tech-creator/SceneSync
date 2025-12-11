import React, { useState, useEffect, useRef } from 'react';
import Timeline from './Timeline';
import Player from './Player';
import Controls from './Controls';
import './ShotSequence.css';

const ShotSequenceEditor = ({ project, onBack }) => {
    const [frames, setFrames] = useState([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [sequenceId, setSequenceId] = useState(null);
    const [storyboardPages, setStoryboardPages] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('storyboard'); // 'storyboard' | 'upload'
    const [uploadUrl, setUploadUrl] = useState('');

    const playbackInterval = useRef(null);

    const [audioUrl, setAudioUrl] = useState('');
    const audioRef = useRef(null);

    const [scriptLines, setScriptLines] = useState([]);

    // Fetch Data on Mount
    useEffect(() => {
        if (!project?._id) return;

        const fetchData = async () => {
            try {
                // Fetch Storyboard Pages
                const sbResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/storyboards/${project._id}`);
                const sbData = await sbResponse.json();
                if (sbData.success && sbData.storyboard) {
                    setStoryboardPages(sbData.storyboard.pages || []);
                }

                // Fetch Script
                const scriptResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/scripts/${project._id}`);
                const scriptData = await scriptResponse.json();
                if (scriptData.success && scriptData.script && scriptData.script.pages) {
                    // Flatten blocks from all pages
                    const lines = scriptData.script.pages.flatMap(page =>
                        (page.blocks || []).map(block => ({
                            id: block.id,
                            type: block.type,
                            content: block.content
                        }))
                    );
                    setScriptLines(lines);
                }

                // Fetch Existing Sequence
                const seqResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/shot-sequence/${project._id}`);
                const seqData = await seqResponse.json();
                if (seqData.success && seqData.sequence) {
                    setFrames(seqData.sequence.frames || []);
                    setSequenceId(seqData.sequence._id);
                    setAudioUrl(seqData.sequence.audioTrack || '');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [project]);

    // ... (rest of component)

    // Save Sequence
    const saveSequence = async (updatedFrames, updatedAudio) => {
        if (!project?._id) return;

        try {
            const url = sequenceId
                ? `${import.meta.env.VITE_API_URL}/api/shot-sequence/${sequenceId}`
                : `${import.meta.env.VITE_API_URL}/api/shot-sequence/create`;

            const method = sequenceId ? 'PUT' : 'POST';
            const body = sequenceId
                ? { frames: updatedFrames, audioTrack: updatedAudio !== undefined ? updatedAudio : audioUrl }
                : { projectId: project._id, title: `${project.title} Sequence`, frames: updatedFrames, audioTrack: updatedAudio || audioUrl };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.success && data.sequence) {
                setSequenceId(data.sequence._id);
                console.log('Sequence saved successfully');
            }
        } catch (error) {
            console.error('Error saving sequence:', error);
        }
    };

    // Calculate total duration
    const totalDuration = frames.reduce((acc, frame) => acc + (frame.duration || 2), 0);

    useEffect(() => {
        if (isPlaying) {
            playbackInterval.current = setInterval(() => {
                setCurrentTime(prev => {
                    const nextTime = prev + 0.1;
                    if (nextTime >= totalDuration) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return nextTime;
                });
            }, 100);
            if (audioRef.current) audioRef.current.play();
        } else {
            clearInterval(playbackInterval.current);
            if (audioRef.current) audioRef.current.pause();
        }

        return () => clearInterval(playbackInterval.current);
    }, [isPlaying, totalDuration]);

    // Sync current frame with current time
    useEffect(() => {
        let accumulatedTime = 0;
        for (let i = 0; i < frames.length; i++) {
            accumulatedTime += (frames[i].duration || 2);
            if (currentTime < accumulatedTime) {
                setCurrentFrameIndex(i);
                break;
            }
        }
    }, [currentTime, frames]);

    // Sync audio seek
    useEffect(() => {
        if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
            audioRef.current.currentTime = currentTime;
        }
    }, [currentTime]);

    const handleAddFrame = (source, data) => {
        // Use a placeholder if thumbnail is missing
        const imageSrc = data.image || 'https://via.placeholder.com/800x450?text=No+Preview+Available';

        const newFrame = {
            id: Date.now().toString(),
            type: source === 'storyboard' ? 'storyboard' : 'image',
            image: imageSrc,
            storyboardPageId: source === 'storyboard' ? data.pageNumber : null,
            duration: 2,
            textOverlay: '',
            transition: 'cut'
        };

        const newFrames = [...frames, newFrame];
        setFrames(newFrames);
        saveSequence(newFrames);
        setShowAddModal(false);
        setUploadUrl('');
    };

    const handleUpdateFrame = (updatedFrame) => {
        const newFrames = [...frames];
        newFrames[currentFrameIndex] = updatedFrame;
        setFrames(newFrames);
        saveSequence(newFrames);
    };

    const handleDeleteFrame = (index) => {
        const newFrames = frames.filter((_, i) => i !== index);
        setFrames(newFrames);
        saveSequence(newFrames);
        if (currentFrameIndex >= newFrames.length) {
            setCurrentFrameIndex(Math.max(0, newFrames.length - 1));
        }
    };

    const handleReorderFrames = (newFrames) => {
        setFrames(newFrames);
        saveSequence(newFrames);
    };

    const handlePlayPause = () => {
        if (frames.length === 0) return;
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (time) => {
        setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
    };

    const handleAudioUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, upload to server. Here we use object URL for demo
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            saveSequence(frames, url);
        }
    };

    const exportCanvasRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        const canvas = exportCanvasRef.current;
        if (!canvas || frames.length === 0) return;

        setIsExporting(true);
        const ctx = canvas.getContext('2d');
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title || 'sequence'}.webm`;
            a.click();
            setIsExporting(false);
        };

        mediaRecorder.start();

        // Playback logic for recording
        for (const frame of frames) {
            await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    // Draw Frame
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Maintain aspect ratio
                    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const x = (canvas.width / 2) - (img.width / 2) * scale;
                    const y = (canvas.height / 2) - (img.height / 2) * scale;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // Draw Text
                    if (frame.textOverlay) {
                        ctx.font = 'bold 40px Arial';
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        ctx.strokeStyle = 'black';
                        ctx.lineWidth = 4;
                        ctx.strokeText(frame.textOverlay, canvas.width / 2, canvas.height - 80);
                        ctx.fillText(frame.textOverlay, canvas.width / 2, canvas.height - 80);
                    }

                    setTimeout(resolve, (frame.duration || 2) * 1000);
                };
                img.onerror = () => {
                    // Draw placeholder on error
                    ctx.fillStyle = '#333';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'white';
                    ctx.font = '30px Arial';
                    ctx.fillText('Image Load Error', canvas.width / 2, canvas.height / 2);
                    setTimeout(resolve, (frame.duration || 2) * 1000);
                };
                img.src = frame.image || 'https://via.placeholder.com/800x450?text=No+Image';
            });
        }

        mediaRecorder.stop();
    };

    const handleSelectFrame = (index) => {
        let startTime = 0;
        for (let i = 0; i < index; i++) {
            startTime += (frames[i].duration || 2);
        }
        setCurrentTime(startTime + 0.1);
        setCurrentFrameIndex(index);
    };

    return (
        <div className="shot-sequence-editor">
            {/* Hidden Canvas for Export */}
            <canvas ref={exportCanvasRef} width={1920} height={1080} style={{ display: 'none' }} />

            <div className="sequence-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2>ShotSequence</h2>
                </div>
                <div className="sequence-actions">
                    <label className="sequence-btn" style={{ cursor: 'pointer' }}>
                        🎵 Add Audio
                        <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioUpload} />
                    </label>
                    <button className="sequence-btn" onClick={() => setShowAddModal(true)}>+ Add Frame</button>
                    <button className="sequence-btn primary" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? 'Exporting...' : 'Export Video'}
                    </button>
                </div>
            </div>

            <div className="editor-workspace">
                <Timeline
                    frames={frames}
                    currentFrameIndex={currentFrameIndex}
                    onSelectFrame={handleSelectFrame}
                    onReorderFrames={handleReorderFrames}
                    onDeleteFrame={handleDeleteFrame}
                    onAddFrame={() => setShowAddModal(true)}
                />

                <Player
                    frames={frames}
                    currentFrame={frames[currentFrameIndex]}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    totalDuration={totalDuration}
                    onPlayPause={handlePlayPause}
                    onSeek={handleSeek}
                    volume={volume}
                    onVolumeChange={setVolume}
                    audioUrl={audioUrl}
                    audioRef={audioRef}
                />

                <Controls
                    selectedFrame={frames[currentFrameIndex]}
                    onUpdateFrame={handleUpdateFrame}
                    scriptLines={scriptLines}
                />
            </div>

            {/* Add Frame Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add Frame</h3>
                        <div className="modal-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'storyboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('storyboard')}
                            >
                                Storyboard
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                                onClick={() => setActiveTab('upload')}
                            >
                                Upload Image
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'blank' ? 'active' : ''}`}
                                onClick={() => setActiveTab('blank')}
                            >
                                Blank Frame
                            </button>
                        </div>

                        <div className="modal-body">
                            {activeTab === 'storyboard' ? (
                                <div className="storyboard-grid">
                                    {storyboardPages.map(page => (
                                        <div
                                            key={page.pageNumber}
                                            className="storyboard-item"
                                            onClick={() => handleAddFrame('storyboard', {
                                                image: page.thumbnail,
                                                pageNumber: page.pageNumber
                                            })}
                                        >
                                            {page.thumbnail ? (
                                                <img src={page.thumbnail} alt={`Page ${page.pageNumber}`} />
                                            ) : (
                                                <div className="placeholder">Page {page.pageNumber}</div>
                                            )}
                                            <span>Page {page.pageNumber}</span>
                                        </div>
                                    ))}
                                    {storyboardPages.length === 0 && <p>No storyboard pages found.</p>}
                                </div>
                            ) : activeTab === 'upload' ? (
                                <div className="upload-section">
                                    <div className="upload-options" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
                                        <label className="add-btn" style={{ cursor: 'pointer', display: 'inline-block', textAlign: 'center' }}>
                                            📁 Upload Image File
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            handleAddFrame('upload', { image: reader.result });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>

                                        <div style={{ color: '#94a3b8' }}>- OR -</div>

                                        <input
                                            type="text"
                                            placeholder="Paste Image URL"
                                            value={uploadUrl}
                                            onChange={(e) => setUploadUrl(e.target.value)}
                                            className="url-input"
                                        />
                                        <button
                                            className="add-btn"
                                            disabled={!uploadUrl}
                                            onClick={() => handleAddFrame('upload', { image: uploadUrl })}
                                        >
                                            Add from URL
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="upload-section">
                                    <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
                                        Add a blank black frame. You can use this for titles, transitions, or audio-only segments.
                                    </p>
                                    <button
                                        className="add-btn"
                                        onClick={() => handleAddFrame('image', { image: '' })} // Empty image triggers placeholder/black screen
                                    >
                                        Add Blank Frame
                                    </button>
                                </div>
                            )}
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShotSequenceEditor;
