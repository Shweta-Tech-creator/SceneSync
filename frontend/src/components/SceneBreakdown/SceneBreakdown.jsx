import React, { useState } from 'react';
import './SceneBreakdown.css';
import html2pdf from 'html2pdf.js';

const SceneBreakdown = ({ onBack }) => {
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('http://localhost:3000/api/breakdown/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText })
            });
            const data = await response.json();
            if (data.success) {
                setAnalysisResult({ ...data.analysis, source: data.source });
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to analyze scene. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExportPDF = () => {
        // 1. Create a temporary container for the PDF content
        const originalElement = document.getElementById('breakdown-results');
        const clone = originalElement.cloneNode(true);

        // 2. Create a wrapper to hold the clone off-screen but visible to html2canvas
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '-9999px';
        wrapper.style.left = '-9999px';
        wrapper.style.width = '800px'; // Fixed width for consistent PDF layout
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.padding = '40px';
        document.body.appendChild(wrapper);
        wrapper.appendChild(clone);

        // 3. Apply aggressive styling using a style tag to ensure overrides
        const style = document.createElement('style');
        style.innerHTML = `
            * {
                color: #000000 !important;
                text-shadow: none !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .breakdown-result-card {
                border: 2px solid #000000 !important;
                background-color: #ffffff !important;
                box-shadow: none !important;
                margin-bottom: 20px !important;
            }
            .breakdown-tag {
                border: 1px solid #000000 !important;
                background-color: #f0f0f0 !important;
                color: #000000 !important;
                font-weight: 700 !important;
                opacity: 1 !important;
            }
            h2, h3, h4 {
                color: #000000 !important;
                font-weight: 800 !important;
                opacity: 1 !important;
            }
            p, span, div {
                color: #000000 !important;
                opacity: 1 !important;
            }
        `;
        clone.appendChild(style);

        // 4. Generate PDF
        const opt = {
            margin: 0.5,
            filename: 'scene-breakdown.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 800
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(clone).save().then(() => {
            // 5. Cleanup
            document.body.removeChild(wrapper);
        });
    };

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysisResult, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "scene_breakdown.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="breakdown-container">
            <div className="breakdown-header">
                <h2>AI Scene Breakdown</h2>
                <div className="header-actions">
                    <button
                        className="export-btn"
                        onClick={handleExportPDF}
                        disabled={!analysisResult}
                        title={!analysisResult ? "Analyze a scene first to export" : "Export as PDF"}
                    >
                        Export PDF
                    </button>
                    <button
                        className="export-btn"
                        onClick={handleExportJSON}
                        disabled={!analysisResult}
                        title={!analysisResult ? "Analyze a scene first to export" : "Export as JSON"}
                    >
                        Export JSON
                    </button>
                </div>
            </div>

            <div className="breakdown-content">
                <div className="split-layout">
                    <div className="left-panel">
                        <div className="breakdown-input-section full-height">
                            <h3>Scene Description</h3>
                            <textarea
                                placeholder="Paste your scene description here... (e.g., 'INT. DARK ROOM - NIGHT. John runs through the hallway, panting. The camera pans to reveal a shadow following him.')"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                disabled={isAnalyzing}
                            />
                            <button
                                className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !inputText.trim()}
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Scene'}
                            </button>
                        </div>
                    </div>

                    <div className="right-panel">
                        {analysisResult ? (
                            <div id="breakdown-results" className="results-section">
                                <div className="results-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Breakdown Results</h3>
                                    <span style={{ fontSize: '0.8rem', color: analysisResult.source?.includes('AI') ? '#166534' : '#9ca3af', background: analysisResult.source?.includes('AI') ? '#dcfce7' : '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}>
                                        {analysisResult.source || 'Analysis Complete'}
                                    </span>
                                </div>

                                <div className="result-grid">
                                    <div className="breakdown-result-card">
                                        <h4>🎥 Shot Type</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.shotType.map((tag, i) => (
                                                <span key={i} className="breakdown-tag shot">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card">
                                        <h4>🔄 Camera Movement</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.movement.map((tag, i) => (
                                                <span key={i} className="breakdown-tag move">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card">
                                        <h4>🎭 Mood</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.mood.map((tag, i) => (
                                                <span key={i} className="breakdown-tag mood">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card">
                                        <h4>💡 Lighting</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.lighting && analysisResult.lighting.length > 0 ? (
                                                analysisResult.lighting.map((tag, i) => (
                                                    <span key={i} className="breakdown-tag light">{tag}</span>
                                                ))
                                            ) : <span className="breakdown-empty-tag">None detected</span>}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card">
                                        <h4>👤 Characters</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.characters.length > 0 ? (
                                                analysisResult.characters.map((tag, i) => (
                                                    <span key={i} className="breakdown-tag char">{tag}</span>
                                                ))
                                            ) : <span className="breakdown-empty-tag">None detected</span>}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card">
                                        <h4>📦 Props</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.props.length > 0 ? (
                                                analysisResult.props.map((tag, i) => (
                                                    <span key={i} className="breakdown-tag prop">{tag}</span>
                                                ))
                                            ) : <span className="breakdown-empty-tag">None detected</span>}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card">
                                        <h4>🔊 Sound</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.sound && analysisResult.sound.length > 0 ? (
                                                analysisResult.sound.map((tag, i) => (
                                                    <span key={i} className="breakdown-tag sound">{tag}</span>
                                                ))
                                            ) : <span className="breakdown-empty-tag">None detected</span>}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card">
                                        <h4>⚡ Scene Dynamics</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.sceneDynamics && analysisResult.sceneDynamics.length > 0 ? (
                                                analysisResult.sceneDynamics.map((tag, i) => (
                                                    <span key={i} className="breakdown-tag dynamics">{tag}</span>
                                                ))
                                            ) : <span className="breakdown-empty-tag">None detected</span>}
                                        </div>
                                    </div>

                                    <div className="breakdown-result-card full-width">
                                        <h4>📝 Purpose / Notes</h4>
                                        <div className="breakdown-tags">
                                            {analysisResult.purposeNotes && analysisResult.purposeNotes.length > 0 ? (
                                                analysisResult.purposeNotes.map((tag, i) => (
                                                    <span key={i} className="breakdown-tag notes">{tag}</span>
                                                ))
                                            ) : <span className="breakdown-empty-tag">None detected</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="breakdown-empty-state">
                                <p>Enter a scene description and click Analyze to see the breakdown.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SceneBreakdown;
