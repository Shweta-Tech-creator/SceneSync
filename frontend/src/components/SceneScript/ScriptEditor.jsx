import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import ScriptBlock from './ScriptBlock';
import Sidebar from '../Storyboard/Sidebar';
import './ScriptEditor.css';
import html2pdf from 'html2pdf.js';

const ScriptEditor = ({ projectId, onBack }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [pages, setPages] = useState([{
        id: 'page-1',
        pageNumber: 1,
        blocks: [
            { id: '1', type: 'scene-heading', content: 'INT. SCENE 1 - DAY' },
            { id: '2', type: 'action', content: '' }
        ],
        storyboardPageId: null
    }]);
    const [currentPageId, setCurrentPageId] = useState('page-1');
    const [focusedBlockId, setFocusedBlockId] = useState('2');
    const [collaborators, setCollaborators] = useState([]);
    const [comments, setComments] = useState([]);
    const [storyboardPages, setStoryboardPages] = useState([]);
    const [project, setProject] = useState(null);
    const [pageColor, setPageColor] = useState('#ffffff');
    const [loading, setLoading] = useState(true);

    // Fetch project data
    useEffect(() => {
        if (!projectId || !user) {
            console.log('ScriptEditor: Missing projectId or user', { projectId, user: user?._id });
            return;
        }

        console.log('ScriptEditor: Fetching project data for projectId:', projectId);

        const fetchProject = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects?userId=${user._id}`);
                const data = await response.json();
                console.log('ScriptEditor: Fetched projects:', data);

                if (data.success) {
                    const selectedProject = data.projects.find(p => p._id === projectId);
                    console.log('ScriptEditor: Selected project:', selectedProject);

                    if (selectedProject) {
                        setProject(selectedProject);

                        // Set collaborators from project
                        const ownerCollaborator = {
                            user: selectedProject.owner,
                            role: 'Owner',
                            active: true
                        };

                        // Filter out owner if they're already in collaborators to avoid duplicates
                        const uniqueCollaborators = (selectedProject.collaborators || []).filter(
                            collab => collab.user?._id !== selectedProject.owner?._id
                        );

                        const projectCollaborators = [
                            ownerCollaborator,
                            ...uniqueCollaborators
                        ].filter(collab => collab.user); // Filter out any null users

                        console.log('ScriptEditor: Setting collaborators:', projectCollaborators);
                        setCollaborators(projectCollaborators);
                    } else {
                        console.log('ScriptEditor: Project not found in list');
                    }
                }
            } catch (error) {
                console.error('ScriptEditor: Error fetching project:', error);
            }
        };

        fetchProject();
    }, [projectId, user]);

    useEffect(() => {
        if (user && !projectId) {
            setCollaborators(prev => {
                // Avoid duplicates
                if (prev.find(c => c.username === user.username)) return prev;
                return [...prev, { username: user.username, email: user.email || 'Online', role: user.role || 'Editor' }];
            });
        }
    }, [user, projectId]);

    const currentPage = pages.find(p => p.id === currentPageId) || pages[0];

    // Debug logging
    useEffect(() => {
        console.log('ScriptEditor: Current page changed', {
            currentPageId,
            currentPageNumber: currentPage?.pageNumber,
            totalPages: pages.length,
            blocksCount: currentPage?.blocks?.length
        });
    }, [currentPageId, pages]);

    // Socket Initialization
    useEffect(() => {
        if (!projectId) return;

        const newSocket = io(import.meta.env.VITE_API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join-script', projectId);
            if (user) {
                newSocket.emit('user-joined', { scriptId: projectId, user });
            }
        });

        newSocket.on('script-update', (data) => {
            setPages(data.pages);
            if (data.pageColor !== undefined) {
                setPageColor(data.pageColor);
            }
        });

        return () => newSocket.close();
    }, [projectId, user]);

    // Initial Load
    useEffect(() => {
        if (!projectId) {
            console.log('ScriptEditor: No projectId, skipping script load');
            return;
        }

        console.log('ScriptEditor: Loading script for projectId:', projectId);

        const fetchScript = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/scripts/${projectId}`);
                const data = await res.json();
                console.log('ScriptEditor: Loaded script data:', data);

                if (data.success && data.script && data.script.pages) {
                    console.log('ScriptEditor: Setting pages:', data.script.pages);
                    setPages(data.script.pages);
                    setPageColor(data.script.pageColor || '#ffffff');
                    setCurrentPageId(data.script.pages[0].id);
                } else {
                    console.log('ScriptEditor: No script data found, using default');
                }
            } catch (err) {
                console.error('ScriptEditor: Failed to load script', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchStoryboard = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/storyboards/${projectId}`);
                const data = await res.json();
                if (data.success && data.storyboard && data.storyboard.pages) {
                    console.log('ScriptEditor: Loaded storyboard pages:', data.storyboard.pages);
                    // Map storyboard pages to format expected by select
                    const sbPages = data.storyboard.pages.map(p => ({
                        id: p._id || `sb-page-${p.pageNumber}`, // Use _id if available, fallback to page number
                        pageNumber: p.pageNumber,
                        thumbnail: p.thumbnail
                    }));
                    setStoryboardPages(sbPages);
                }
            } catch (err) {
                console.error('ScriptEditor: Failed to load storyboard', err);
            }
        };


        fetchScript();
        fetchStoryboard();
    }, [projectId]);

    // Auto-save and emit socket event when pageColor changes
    useEffect(() => {
        if (!projectId || !socket) return;

        // Emit socket event for real-time sync
        socket.emit('script-update', { scriptId: projectId, pages, pageColor });

        // Auto-save to database
        saveScript(false);
    }, [pageColor]);

    // Fetch comments
    useEffect(() => {
        if (!projectId) return;

        const fetchComments = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/comments`);
                const data = await response.json();
                if (data.success) {
                    setComments(data.comments);
                }
            } catch (error) {
                console.error('ScriptEditor: Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [projectId]);

    const handleAddComment = async (text) => {
        if (!projectId || !user) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    userId: user._id,
                    author: user.username
                })
            });
            const data = await response.json();

            if (data.success) {
                // Refresh comments or append locally
                setComments(prev => [...prev, {
                    text,
                    author: user.username,
                    time: 'Just now',
                    user: user
                }]);
            }
        } catch (error) {
            console.error('ScriptEditor: Error adding comment:', error);
            alert('Failed to add comment');
        }
    };

    const updatePages = (newPages) => {
        setPages(newPages);
        if (socket && projectId) socket.emit('script-update', { scriptId: projectId, pages: newPages, pageColor });
    };

    const updateBlock = (id, content) => {
        const newBlocks = currentPage.blocks.map(b => b.id === id ? { ...b, content } : b);
        const newPages = pages.map(p => p.id === currentPageId ? { ...p, blocks: newBlocks } : p);
        updatePages(newPages);
    };

    const handleKeyDown = (e, id) => {
        const blocks = currentPage.blocks;
        const index = blocks.findIndex(b => b.id === id);
        const currentBlock = blocks[index];

        if (e.key === 'Enter') {
            e.preventDefault();
            const newId = Date.now().toString();
            let nextType = 'action';

            if (currentBlock.type === 'scene-heading') nextType = 'action';
            if (currentBlock.type === 'action') nextType = 'action';
            if (currentBlock.type === 'character') nextType = 'dialogue';
            if (currentBlock.type === 'dialogue') nextType = 'character';
            if (currentBlock.type === 'parenthetical') nextType = 'dialogue';
            if (currentBlock.type === 'transition') nextType = 'scene-heading';

            const newBlock = { id: newId, type: nextType, content: '' };
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, newBlock);

            const newPages = pages.map(p => p.id === currentPageId ? { ...p, blocks: newBlocks } : p);
            updatePages(newPages);
            setFocusedBlockId(newId);
        }
        else if (e.key === 'Tab') {
            e.preventDefault();
            const types = ['scene-heading', 'action', 'character', 'dialogue', 'parenthetical', 'transition'];
            const currentTypeIndex = types.indexOf(currentBlock.type);
            const nextType = types[(currentTypeIndex + 1) % types.length];

            const newBlocks = blocks.map(b => b.id === id ? { ...b, type: nextType } : b);
            const newPages = pages.map(p => p.id === currentPageId ? { ...p, blocks: newBlocks } : p);
            updatePages(newPages);
        }
        else if (e.key === 'Backspace' && currentBlock.content === '' && index > 0) {
            e.preventDefault();
            const prevBlockId = blocks[index - 1].id;
            const newBlocks = blocks.filter(b => b.id !== id);
            const newPages = pages.map(p => p.id === currentPageId ? { ...p, blocks: newBlocks } : p);
            updatePages(newPages);
            setFocusedBlockId(prevBlockId);
        }
    };

    const addPage = () => {
        const newPageId = `page-${pages.length + 1}`;
        const newBlockId = Date.now().toString();
        const newPage = {
            id: newPageId,
            pageNumber: pages.length + 1,
            blocks: [{ id: newBlockId, type: 'scene-heading', content: `INT. SCENE ${pages.length + 1} - DAY` }],
            storyboardPageId: null
        };
        const newPages = [...pages, newPage];

        console.log('ScriptEditor: Adding new page', {
            newPageId,
            newBlockId,
            totalPages: newPages.length,
            currentPageId: currentPageId,
            switchingTo: newPageId
        });

        updatePages(newPages);
        setCurrentPageId(newPageId);
        setFocusedBlockId(newBlockId);
    };

    const linkStoryboardPage = (storyboardPageId) => {
        const newPages = pages.map(p => p.id === currentPageId ? { ...p, storyboardPageId } : p);
        updatePages(newPages);
    };

    const handleDeletePage = (pageId, e) => {
        e.stopPropagation(); // Prevent page selection when clicking delete

        if (pages.length <= 1) {
            alert('Cannot delete the last page');
            return;
        }

        const pageIndex = pages.findIndex(p => p.id === pageId);
        const newPages = pages.filter(p => p.id !== pageId)
            .map((p, index) => ({ ...p, pageNumber: index + 1 }));

        updatePages(newPages);

        // Switch to previous page if current page was deleted
        if (pageId === currentPageId) {
            const newCurrentPage = newPages[Math.max(0, pageIndex - 1)];
            setCurrentPageId(newCurrentPage.id);
        }
    };

    const handleMovePageUp = (pageId, e) => {
        e.stopPropagation();

        const index = pages.findIndex(p => p.id === pageId);
        if (index <= 0) return;

        const newPages = [...pages];
        [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];

        // Renumber
        const renumbered = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
        updatePages(renumbered);
    };

    const handleMovePageDown = (pageId, e) => {
        e.stopPropagation();

        const index = pages.findIndex(p => p.id === pageId);
        if (index >= pages.length - 1) return;

        const newPages = [...pages];
        [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];

        // Renumber
        const renumbered = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
        updatePages(renumbered);
    };

    const insertBlock = (type) => {
        const blocks = currentPage.blocks;
        const newId = Date.now().toString();

        // Find insertion index based on focused block
        const focusedIndex = blocks.findIndex(b => b.id === focusedBlockId);
        const insertIndex = focusedIndex !== -1 ? focusedIndex + 1 : blocks.length;

        let content = '';
        if (type === 'scene-heading') content = 'INT. ';
        if (type === 'transition') content = 'CUT TO:';
        if (type === 'parenthetical') content = '()';

        const newBlock = { id: newId, type, content };
        const newBlocks = [...blocks];
        newBlocks.splice(insertIndex, 0, newBlock);

        const newPages = pages.map(p => p.id === currentPageId ? { ...p, blocks: newBlocks } : p);
        updatePages(newPages);
        setFocusedBlockId(newId);
    };

    const exportPDF = () => {
        const element = document.getElementById('script-content');
        const opt = {
            margin: 1,
            filename: `script-${projectId || 'untitled'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const saveScript = async (showAlert = true) => {
        if (!projectId) {
            console.log('ScriptEditor: No projectId, cannot save');
            if (showAlert) {
                alert('This is a scratchpad. To save, please select a project from the dashboard.');
            }
            return;
        }

        console.log('ScriptEditor: Saving script for projectId:', projectId);
        console.log('ScriptEditor: Pages to save:', pages);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/scripts/${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pages, pageColor })
            });

            const data = await response.json();
            console.log('ScriptEditor: Save response:', data);

            if (data.success) {
                console.log('ScriptEditor: Script saved successfully');
                // Show success message only if showAlert is true (manual save)
                if (showAlert) {
                    alert('✅ Script saved successfully!');
                }
            } else {
                console.error('ScriptEditor: Save failed:', data.message);
                if (showAlert) {
                    alert('❌ Failed to save script: ' + data.message);
                }
            }
        } catch (err) {
            console.error('ScriptEditor: Save error:', err);
            if (showAlert) {
                alert('❌ Failed to save script. Please check your connection.');
            }
        }
    };

    useEffect(() => {
        if (!projectId) return;
        console.log('ScriptEditor: Auto-save enabled for projectId:', projectId);
        const interval = setInterval(() => {
            console.log('ScriptEditor: Auto-saving...');
            saveScript(false); // Auto-save without showing alert
        }, 30000); // Auto-save every 30 seconds
        return () => clearInterval(interval);
    }, [pages, pageColor, projectId]);

    if (loading) {
        return (
            <div className="script-editor-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '1.2rem' }}>Loading Script...</div>
            </div>
        );
    }

    return (
        <div className="script-editor-container">
            {/* Top Toolbar */}
            <div className="script-toolbar top-toolbar">
                <div className="toolbar-left">
                    <span className="script-title">Script Editor</span>
                </div>
                <div className="toolbar-center">
                    <button className="format-btn btn-scene" onClick={() => insertBlock('scene-heading')}>Scene Heading</button>
                    <button className="format-btn btn-action" onClick={() => insertBlock('action')}>Action</button>
                    <button className="format-btn btn-character" onClick={() => insertBlock('character')}>Character</button>
                    <button className="format-btn btn-dialogue" onClick={() => insertBlock('dialogue')}>Dialogue</button>
                    <button className="format-btn btn-parenthetical" onClick={() => insertBlock('parenthetical')}>Parenthetical</button>
                    <button className="format-btn btn-transition" onClick={() => insertBlock('transition')}>Transition</button>
                </div>
                <div className="toolbar-right">
                    <button className="toolbar-btn" onClick={saveScript}>Save</button>
                    <button className="toolbar-btn" onClick={exportPDF}>Export PDF</button>
                    <div className="color-picker-wrapper" style={{ display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
                        <input
                            type="color"
                            value={pageColor}
                            onChange={(e) => setPageColor(e.target.value)}
                            title="Page Color"
                            style={{
                                width: '32px',
                                height: '32px',
                                padding: '0',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                background: 'transparent'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="script-workspace">
                {/* Left Page Sidebar */}
                <div className="script-sidebar-left">
                    <div className="sidebar-header">
                        <h3>Pages</h3>
                        <button className="add-page-btn" onClick={addPage}>+ Add Page</button>
                    </div>
                    <div className="pages-list">
                        {pages.map((page, index) => (
                            <div
                                key={page.id}
                                className={`page-item ${page.id === currentPageId ? 'active' : ''}`}
                                onClick={() => setCurrentPageId(page.id)}
                            >
                                <div className="page-info">
                                    <span className="page-number">Page {page.pageNumber}</span>
                                    {page.storyboardPageId && <span className="linked-badge">Linked</span>}
                                </div>
                                <div className="page-actions">
                                    <button
                                        className="page-action-btn move-up"
                                        onClick={(e) => handleMovePageUp(page.id, e)}
                                        disabled={index === 0}
                                        title="Move page up"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        className="page-action-btn move-down"
                                        onClick={(e) => handleMovePageDown(page.id, e)}
                                        disabled={index === pages.length - 1}
                                        title="Move page down"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        className="page-action-btn delete"
                                        onClick={(e) => handleDeletePage(page.id, e)}
                                        disabled={pages.length <= 1}
                                        title="Delete page"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="storyboard-link-section">
                        <h4>Link Storyboard</h4>
                        <select
                            value={currentPage.storyboardPageId || ''}
                            onChange={(e) => linkStoryboardPage(e.target.value)}
                        >
                            <option value="">None</option>
                            {storyboardPages.map(sb => (
                                <option key={sb.id} value={sb.id}>Storyboard Page {sb.pageNumber}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Script Editor */}
                <div className="script-main-area">
                    <div id="script-content" className="script-page" style={{ backgroundColor: pageColor }}>
                        {/* Linked Storyboard Preview */}
                        {(() => {
                            const linkedPage = storyboardPages.find(sb => sb.id === currentPage.storyboardPageId);
                            if (linkedPage && linkedPage.thumbnail) {
                                return (
                                    <div className="linked-storyboard-preview">
                                        <img src={linkedPage.thumbnail} alt="Linked Storyboard" />
                                        <span>Linked Storyboard</span>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {currentPage.blocks.map(block => (
                            <ScriptBlock
                                key={block.id}
                                block={block}
                                onUpdate={updateBlock}
                                onKeyDown={handleKeyDown}
                                onFocus={setFocusedBlockId}
                                isFocused={focusedBlockId === block.id}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Collaboration Sidebar */}
                <Sidebar
                    collaborators={collaborators}
                    comments={comments}
                    onAddComment={handleAddComment}
                    project={project}
                />
            </div>
        </div>
    );
};

export default ScriptEditor;
