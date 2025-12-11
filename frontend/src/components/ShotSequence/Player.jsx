import React from 'react';

const Player = ({
    currentFrame,
    isPlaying,
    currentTime,
    totalDuration,
    onPlayPause,
    onSeek,
    volume,
    onVolumeChange,
    frames = [],
    audioUrl,
    audioRef
}) => {
    // Find current and next frame for transitions
    const getActiveFrames = () => {
        if (!frames.length) return { current: null, next: null, progress: 0 };

        let accumulatedTime = 0;
        for (let i = 0; i < frames.length; i++) {
            const frameDuration = frames[i].duration || 2;
            const frameStart = accumulatedTime;
            const frameEnd = accumulatedTime + frameDuration;

            if (currentTime >= frameStart && currentTime < frameEnd) {
                const progress = (currentTime - frameStart) / frameDuration;
                return {
                    current: frames[i],
                    next: frames[i + 1] || null,
                    progress,
                    timeLeft: frameEnd - currentTime
                };
            }
            accumulatedTime += frameDuration;
        }
        return { current: frames[frames.length - 1], next: null, progress: 1 };
    };

    const { current, next, timeLeft } = getActiveFrames();

    // Transition logic
    const TRANSITION_DURATION = 1.0; // 1 second transition
    const isTransitioning = isPlaying && next && timeLeft <= TRANSITION_DURATION && current?.transition !== 'cut';

    const getOpacity = () => {
        if (!isTransitioning) return 1;
        // Fade out current frame
        return timeLeft / TRANSITION_DURATION;
    };

    const getNextOpacity = () => {
        if (!isTransitioning) return 0;
        // Fade in next frame
        return 1 - (timeLeft / TRANSITION_DURATION);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressBarClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        onSeek(percentage * totalDuration);
    };

    return (
        <div className="player-panel">
            {/* Hidden Audio Element */}
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    volume={volume}
                    onEnded={() => onPlayPause()}
                />
            )}

            <div className="player-container">
                <div className="player-screen">
                    {/* Current Frame */}
                    {current ? (
                        <div
                            className="frame-layer current"
                            style={{
                                opacity: getOpacity(),
                                zIndex: 2,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <img
                                src={current.image || 'https://via.placeholder.com/800x450?text=No+Image'}
                                alt="Scene Preview"
                                className="player-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/800x450?text=Image+Load+Error';
                                }}
                            />
                            {current.textOverlay && (
                                <div className="text-overlay">
                                    <h2>{current.textOverlay}</h2>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state-large">
                            <p>No frames added. Drag images to the timeline to start.</p>
                        </div>
                    )}

                    {/* Next Frame (for transitions) */}
                    {next && isTransitioning && (
                        <div
                            className="frame-layer next"
                            style={{
                                opacity: getNextOpacity(),
                                zIndex: 1,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <img
                                src={next.image || 'https://via.placeholder.com/800x450?text=No+Image'}
                                alt="Next Scene"
                                className="player-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/800x450?text=Image+Load+Error';
                                }}
                            />
                            {next.textOverlay && (
                                <div className="text-overlay">
                                    <h2>{next.textOverlay}</h2>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="player-controls-wrapper">
                <div
                    className="progress-bar-container"
                    onClick={handleProgressBarClick}
                >
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    />
                </div>

                <div className="controls-row">
                    <div className="main-controls">
                        <button
                            className="control-btn play-pause"
                            onClick={onPlayPause}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <div className="time-display">
                            {formatTime(currentTime)} / {formatTime(totalDuration)}
                        </div>
                    </div>

                    <div className="volume-control">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="volume-slider"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
