import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import './Canvas.css';


const Canvas = ({ socket, storyboardId, activeTool, color, currentPage, canvasData, onCanvasUpdate }) => {
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
    const [zoom, setZoom] = useState(1);

    const onCanvasUpdateRef = useRef(onCanvasUpdate);

    useEffect(() => {
        onCanvasUpdateRef.current = onCanvasUpdate;
    }, [onCanvasUpdate]);

    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (canvas && canvasData && Object.keys(canvasData).length > 0) {
            // Only load if canvas is empty to avoid overwriting user work
            if (canvas.getObjects().length === 0) {
                console.log('Canvas: Loading async data');
                canvas.loadFromJSON(canvasData, () => {
                    const bgColor = canvasData.background || canvasData.backgroundColor;
                    if (bgColor) {
                        canvas.backgroundColor = bgColor;
                        setCanvasBgColor(bgColor);
                    }
                    canvas.renderAll();
                });
            }
        }
    }, [canvasData]);

    useEffect(() => {
        // Dispose of existing canvas if any
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        // Initialize Fabric canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1200,
            height: 800,
            backgroundColor: '#ffffff'
        });
        fabricCanvasRef.current = canvas;

        // Load existing canvas data if available (sync load on mount)
        if (canvasData && Object.keys(canvasData).length > 0) {
            canvas.loadFromJSON(canvasData, () => {
                const bgColor = canvasData.background || canvasData.backgroundColor;
                if (bgColor) {
                    canvas.backgroundColor = bgColor;
                    setCanvasBgColor(bgColor);
                }
                canvas.renderAll();
            });
        }

        // Listen for canvas modifications
        const handleModification = () => {
            const jsonData = canvas.toJSON();
            const thumbnail = canvas.toDataURL({
                format: 'png',
                quality: 0.5, // Lower quality for thumbnail to save space
                multiplier: 0.2 // Scale down for thumbnail
            });

            if (onCanvasUpdateRef.current) {
                onCanvasUpdateRef.current(jsonData, thumbnail);
            }
            if (socket) {
                socket.emit('canvas-update', { storyboardId, data: jsonData });
            }
        };

        canvas.on('object:modified', handleModification);
        canvas.on('object:added', handleModification);
        canvas.on('object:removed', handleModification);
        canvas.on('path:created', handleModification);

        // Socket listener for remote updates
        if (socket) {
            socket.on('canvas-update', (data) => {
                canvas.loadFromJSON(data, () => {
                    canvas.renderAll();
                });
            });
        }

        return () => {
            canvas.dispose();
        };
    }, [currentPage]);

    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Reset canvas mode
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');

        switch (activeTool) {
            case 'pencil':
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = color;
                canvas.freeDrawingBrush.width = 2;
                break;

            case 'brush':
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = color;
                canvas.freeDrawingBrush.width = 10;
                break;

            case 'eraser':
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = '#ffffff';
                canvas.freeDrawingBrush.width = 20;
                break;

            case 'rectangle':
                addShape('rectangle', canvas, color);
                break;

            case 'circle':
                addShape('circle', canvas, color);
                break;

            case 'arrow':
                drawArrow(canvas, color);
                break;

            case 'bubble':
                addShape('bubble', canvas, color);
                break;

            case 'connector':
                drawLine(canvas, color);
                break;

            default:
                canvas.selection = true;
        }
    }, [activeTool, color]);

    const addShape = (type, canvas, fillColor) => {
        let shape;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        switch (type) {
            case 'rectangle':
                shape = new fabric.Rect({
                    left: centerX - 50,
                    top: centerY - 50,
                    width: 100,
                    height: 100,
                    fill: fillColor,
                    stroke: '#000',
                    strokeWidth: 2
                });
                break;

            case 'circle':
                shape = new fabric.Circle({
                    left: centerX - 50,
                    top: centerY - 50,
                    radius: 50,
                    fill: fillColor,
                    stroke: '#000',
                    strokeWidth: 2
                });
                break;

            case 'bubble':
                shape = new fabric.Ellipse({
                    left: centerX - 60,
                    top: centerY - 40,
                    rx: 60,
                    ry: 40,
                    fill: fillColor,
                    stroke: '#000',
                    strokeWidth: 2
                });
                break;
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    };

    const drawLine = (canvas, strokeColor) => {
        let line, isDown;

        canvas.on('mouse:down', (o) => {
            isDown = true;
            const pointer = canvas.getPointer(o.e);
            const points = [pointer.x, pointer.y, pointer.x, pointer.y];

            line = new fabric.Line(points, {
                strokeWidth: 3,
                fill: strokeColor,
                stroke: strokeColor,
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: true,
                hasBorders: true
            });

            // Add custom controls for endpoint editing
            line.controls = {
                p1: new fabric.Control({
                    position: { x: -0.5, y: -0.5 },
                    actionHandler: fabric.controlsUtils.changeLineOneEnd,
                    cursorStyle: 'crosshair',
                    actionName: 'modifyLineEnd'
                }),
                p2: new fabric.Control({
                    position: { x: 0.5, y: 0.5 },
                    actionHandler: fabric.controlsUtils.changeLineOtherEnd,
                    cursorStyle: 'crosshair',
                    actionName: 'modifyLineEnd'
                })
            };

            canvas.add(line);
        });

        canvas.on('mouse:move', (o) => {
            if (!isDown) return;
            const pointer = canvas.getPointer(o.e);
            line.set({ x2: pointer.x, y2: pointer.y });
            canvas.renderAll();
        });

        canvas.on('mouse:up', () => {
            isDown = false;
            canvas.setActiveObject(line);
        });
    };

    const drawArrow = (canvas, color) => {
        let line, arrowHead, isDown;

        canvas.on('mouse:down', (o) => {
            isDown = true;
            const pointer = canvas.getPointer(o.e);
            const points = [pointer.x, pointer.y, pointer.x, pointer.y];

            line = new fabric.Line(points, {
                strokeWidth: 3,
                fill: color,
                stroke: color,
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false
            });

            arrowHead = new fabric.Triangle({
                width: 15,
                height: 15,
                fill: color,
                left: pointer.x,
                top: pointer.y,
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false
            });

            canvas.add(line, arrowHead);
        });

        canvas.on('mouse:move', (o) => {
            if (!isDown) return;
            const pointer = canvas.getPointer(o.e);

            line.set({ x2: pointer.x, y2: pointer.y });

            // Calculate rotation for arrow head
            const dx = pointer.x - line.x1;
            const dy = pointer.y - line.y1;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

            arrowHead.set({
                left: pointer.x,
                top: pointer.y,
                angle: angle
            });

            canvas.renderAll();
        });

        canvas.on('mouse:up', () => {
            isDown = false;

            // Group them together
            const group = new fabric.Group([line, arrowHead], {
                selectable: true,
                hasControls: true,
                hasBorders: true
            });

            canvas.remove(line, arrowHead);
            canvas.add(group); // This triggers object:added -> handleModification
            canvas.setActiveObject(group);
        });
    };

    const handleDelete = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    };

    const clipboardRef = useRef(null);

    const handleCopy = async () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;

        // Clone the active object
        const cloned = await activeObject.clone();
        clipboardRef.current = cloned;
    };

    const handlePaste = async () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !clipboardRef.current) return;

        // Clone the clipboard object again to allow multiple pastes
        const clonedObj = await clipboardRef.current.clone();

        canvas.discardActiveObject();

        clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
        });

        if (clonedObj.type === 'activeSelection') {
            // Active selection needs special handling
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj) => {
                canvas.add(obj);
            });
            clonedObj.setCoords();
        } else {
            canvas.add(clonedObj); // This triggers object:added -> handleModification
        }

        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if typing in an input field
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) {
                return;
            }

            // Copy: Ctrl+C or Cmd+C
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                handleCopy();
            }
            // Paste: Ctrl+V or Cmd+V
            else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                handlePaste();
            }
            // Delete: Delete or Backspace
            else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleBgColorChange = (newColor) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        setCanvasBgColor(newColor);
        canvas.backgroundColor = newColor;
        canvas.renderAll();
        const jsonData = canvas.toJSON();
        onCanvasUpdate(jsonData);
    };

    const handleZoomChange = (newZoom) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const zoomValue = parseFloat(newZoom);
        setZoom(zoomValue);
        canvas.setZoom(zoomValue);
        canvas.renderAll();
    };

    const handleExport = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });

        const link = document.createElement('a');
        link.download = `storyboard-page-${currentPage}.png`;
        link.href = dataURL;
        link.click();
    };

    return (
        <div className="canvas-container">
            <div className="canvas-header">
                <h3>Page {currentPage}</h3>
                <div className="canvas-controls">
                    <div className="control-group">
                        <label htmlFor="bg-color">Canvas Color:</label>
                        <input
                            type="color"
                            id="bg-color"
                            value={canvasBgColor}
                            onChange={(e) => handleBgColorChange(e.target.value)}
                            className="bg-color-picker"
                        />
                    </div>
                    <div className="control-group">
                        <label htmlFor="zoom-slider">Zoom: {Math.round(zoom * 100)}%</label>
                        <input
                            type="range"
                            id="zoom-slider"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => handleZoomChange(e.target.value)}
                            className="zoom-slider"
                        />
                    </div>
                </div>
                <div className="canvas-actions">
                    <button className="action-btn delete-btn" onClick={handleDelete} title="Delete (Del)">
                        🗑️ Delete
                    </button>
                    <button className="export-btn" onClick={handleExport}>
                        Export PNG
                    </button>
                </div>
            </div>
            <div className="canvas-wrapper">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default Canvas;
