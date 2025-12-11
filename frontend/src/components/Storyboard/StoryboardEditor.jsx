import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PageManager from './PageManager';
import Sidebar from './Sidebar';
import './StoryboardEditor.css';

const StoryboardEditor = ({ storyboardId: initialStoryboardId, project, onBack }) => {
    console.log('StoryboardEditor rendering...');

    const [socket, setSocket] = useState(null);
    const [storyboardId] = useState(initialStoryboardId || 'default-storyboard');
    const [pages, setPages] = useState([{ pageNumber: 1, canvasData: {}, thumbnail: '' }]);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTool, setActiveTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [collaborators, setCollaborators] = useState([]);
    const [comments, setComments] = useState([]);

    const { user } = useAuth();

    useEffect(() => {
        if (project) {
            const owner = project.owner ? {
                ...project.owner,
                role: 'Owner',
                // Ensure username is accessible at top level or under user object
                username: project.owner.username,
                user: project.owner
            } : null;

            const projectCollaborators = project.collaborators || [];

            // Filter out owner if they are somehow in collaborators list to avoid duplicates
            const uniqueCollaborators = projectCollaborators.filter(c =>
                c.user?._id !== project.owner?._id
            );

            const allCollaborators = owner ? [owner, ...uniqueCollaborators] : uniqueCollaborators;
            setCollaborators(allCollaborators);
        } else if (user) {
            setCollaborators(prev => {
                if (!prev.find(c => c._id === user._id)) {
                    return [...prev, user];
                }
                return prev;
            });
        }
    }, [user, project]);

    useEffect(() => {
        console.log('StoryboardEditor useEffect - initializing socket');
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('join-storyboard', storyboardId);
            if (user) {
                newSocket.emit('user-joined', { storyboardId, user });
            }
        });

        newSocket.on('user-joined', (newUser) => {
            setCollaborators(prev => {
                // Check for duplicates by _id, username, or user._id
                const isDuplicate = prev.find(c =>
                    c._id === newUser._id ||
                    c.username === newUser.username ||
                    c.user?._id === newUser._id ||
                    c.user?._id === newUser.user?._id
                );
                if (!isDuplicate) {
                    return [...prev, newUser];
                }
                return prev;
            });
        });

        newSocket.on('page-update', (updatedPages) => {
            setPages(updatedPages);
        });

        return () => {
            newSocket.close();
        };
    }, [storyboardId, user]);

    useEffect(() => {
        if (!storyboardId || storyboardId === 'default-storyboard') return;

        const fetchStoryboard = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/storyboards/${storyboardId}`);
                const data = await res.json();
                if (data.success && data.storyboard && data.storyboard.pages && data.storyboard.pages.length > 0) {
                    console.log('StoryboardEditor: Loaded pages:', data.storyboard.pages);
                    setPages(data.storyboard.pages);
                    // Load saved color
                    if (data.storyboard.defaultColor) {
                        setColor(data.storyboard.defaultColor);
                    }
                }
            } catch (err) {
                console.error('StoryboardEditor: Failed to load storyboard', err);
            }
        };

        fetchStoryboard();
    }, [storyboardId]);

    // Fetch comments
    useEffect(() => {
        if (!project?._id) return;

        const fetchComments = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/projects/${project._id}/comments`);
                const data = await response.json();
                if (data.success) {
                    setComments(data.comments);
                }
            } catch (error) {
                console.error('StoryboardEditor: Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [project]);

    const handleAddComment = async (text) => {
        if (!project?._id || !user) return;

        try {
            const response = await fetch(`http://localhost:3000/api/projects/${project._id}/comments`, {
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
                setComments(prev => [...prev, {
                    text,
                    author: user.username,
                    time: 'Just now',
                    user: user
                }]);
            }
        } catch (error) {
            console.error('StoryboardEditor: Error adding comment:', error);
            alert('Failed to add comment');
        }
    };

    const saveStoryboard = async (currentPages, saveColor = false) => {
        if (!storyboardId || storyboardId === 'default-storyboard') return;

        try {
            const payload = { pages: currentPages };
            if (saveColor) {
                payload.defaultColor = color;
            }
            await fetch(`http://localhost:3000/api/storyboards/${storyboardId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('StoryboardEditor: Saved successfully');
        } catch (err) {
            console.error('StoryboardEditor: Failed to save', err);
        }
    };

    // Auto-save color when it changes
    useEffect(() => {
        if (!storyboardId || storyboardId === 'default-storyboard') return;

        const saveColor = async () => {
            try {
                await fetch(`http://localhost:3000/api/storyboards/${storyboardId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ defaultColor: color })
                });
                console.log('StoryboardEditor: Color saved');
            } catch (err) {
                console.error('StoryboardEditor: Failed to save color', err);
            }
        };

        const timeoutId = setTimeout(saveColor, 500); // Debounce color saves
        return () => clearTimeout(timeoutId);
    }, [color, storyboardId]);

    const handleAddPage = () => {
        const newPage = {
            pageNumber: pages.length + 1,
            canvasData: {},
            thumbnail: ''
        };
        const updatedPages = [...pages, newPage];
        setPages(updatedPages);
        saveStoryboard(updatedPages);

        if (socket) {
            socket.emit('page-update', { storyboardId, pages: updatedPages });
        }
    };

    const handlePageSwitch = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleCanvasUpdate = (canvasData, thumbnail) => {
        const updatedPages = pages.map(page =>
            page.pageNumber === currentPage
                ? { ...page, canvasData, thumbnail }
                : page
        );
        setPages(updatedPages);
        saveStoryboard(updatedPages);
    };

    const handleDeletePage = (pageNumber) => {
        const updatedPages = pages.filter(page => page.pageNumber !== pageNumber)
            .map((page, index) => ({ ...page, pageNumber: index + 1 })); // Renumber

        setPages(updatedPages);
        saveStoryboard(updatedPages);

        if (currentPage > updatedPages.length) {
            setCurrentPage(Math.max(1, updatedPages.length));
        }

        if (socket) {
            socket.emit('page-update', { storyboardId, pages: updatedPages });
        }
    };

    const handleMovePageUp = (pageNumber) => {
        const index = pages.findIndex(p => p.pageNumber === pageNumber);
        if (index <= 0) return;

        const newPages = [...pages];
        [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];

        // Renumber
        const renumbered = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
        setPages(renumbered);
        saveStoryboard(renumbered);

        if (socket) {
            socket.emit('page-update', { storyboardId, pages: renumbered });
        }
    };

    const handleMovePageDown = (pageNumber) => {
        const index = pages.findIndex(p => p.pageNumber === pageNumber);
        if (index >= pages.length - 1) return;

        const newPages = [...pages];
        [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];

        // Renumber
        const renumbered = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
        setPages(renumbered);
        saveStoryboard(renumbered);

        if (socket) {
            socket.emit('page-update', { storyboardId, pages: renumbered });
        }
    };


    console.log('StoryboardEditor rendering JSX');

    return (
        <div className="storyboard-editor">
            <Toolbar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                color={color}
                setColor={setColor}
                onBack={onBack}
                onSave={() => saveStoryboard(pages)}
            />

            <div className="storyboard-main">
                <PageManager
                    pages={pages}
                    currentPage={currentPage}
                    onPageSwitch={handlePageSwitch}
                    onAddPage={handleAddPage}
                    onDeletePage={handleDeletePage}
                    onMovePageUp={handleMovePageUp}
                    onMovePageDown={handleMovePageDown}
                />

                <Canvas
                    key={currentPage}
                    socket={socket}
                    storyboardId={storyboardId}
                    activeTool={activeTool}
                    color={color}
                    currentPage={currentPage}
                    canvasData={pages.find(p => p.pageNumber === currentPage)?.canvasData}
                    onCanvasUpdate={handleCanvasUpdate}
                />

                <Sidebar
                    collaborators={collaborators}
                    comments={comments}
                    onAddComment={handleAddComment}
                    currentPage={currentPage}
                    project={project}
                />
            </div>
        </div>
    );
};

export default StoryboardEditor;
