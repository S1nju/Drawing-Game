import React, { useEffect, useRef, useState } from 'react';
import useEcho from '../hooks/useEcho';
const DrawingBoard = ({ roomId = '123' }) => {
    const canvasRef = useRef(null);
    const channelRef = useRef(null);
    const isDrawing = useRef(false);
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const echo = useEcho();
    // Save canvas to localStorage
    const saveCanvasToLocalStorage = () => {
        if (canvasRef.current) {
            const canvasData = canvasRef.current.toDataURL();
            localStorage.setItem(`drawing_${roomId}`, canvasData);
        }
    };

    // Load canvas and settings from localStorage
    const loadCanvasFromLocalStorage = () => {
        if (canvasRef.current) {
            const canvasData = localStorage.getItem(`drawing_${roomId}`);
            const savedColor = localStorage.getItem(`drawingColor_${roomId}`);
            const savedSize = localStorage.getItem(`drawingSize_${roomId}`);
            
            if (canvasData) {
                const img = new Image();
                img.onload = () => {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                };
                img.src = canvasData;
            }
            
            if (savedColor) setBrushColor(savedColor);
            if (savedSize) setBrushSize(parseInt(savedSize));
        }
    };

    // Clear drawings from canvas and localStorage
    const clearDrawings = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            localStorage.removeItem(`drawing_${roomId}`);
        }
    };

    // Handle color change
    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setBrushColor(newColor);
        localStorage.setItem(`drawingColor_${roomId}`, newColor);
    };

    // Handle size change
    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setBrushSize(newSize);
        localStorage.setItem(`drawingSize_${roomId}`, newSize.toString());
    };

    useEffect(() => {
        // Load drawings from localStorage when component mounts
        loadCanvasFromLocalStorage();
        if (!echo) {
            console.warn("Echo not initialized yet, can't connect to Reverb");
            return;
        }
        console.log(`%c [Echo] Joining: drawing.${roomId}`, 'color: blue');

        const chatChannel = echo.join(`drawing.${roomId}`);

        chatChannel
            .here((users) => {
                console.log('%c [Echo] Connected! Players:', 'color: green', users);
                channelRef.current = chatChannel;
            })
            .listenForWhisper('draw', (event) => {
                drawOnCanvas(event.x, event.y, event.size, event.color, event.isNewPath);
            })
            .error((err) => {
                console.error('[Echo] Auth/Connection Error:', err);
            });

        return () => {
            console.log('[Echo] Leaving channel');
            echo.leave(`drawing.${roomId}`);
            channelRef.current = null;
        };
    }, [roomId, echo]);

    const drawOnCanvas = (x, y, size, color, isNewPath) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        if (isNewPath) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current || !channelRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        drawOnCanvas(x, y, brushSize, brushColor, false);
        channelRef.current.whisper('draw', { x, y, size: brushSize, color: brushColor, isNewPath: false });
        
        saveCanvasToLocalStorage();
    };

    const startDrawing = (e) => {
        if (!channelRef.current) {
            console.warn("Can't draw yet, not connected to Reverb");
            return;
        }
        isDrawing.current = true;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        drawOnCanvas(x, y, brushSize, brushColor, true);
        channelRef.current.whisper('draw', { x, y, size: brushSize, color: brushColor, isNewPath: true });
        
        saveCanvasToLocalStorage();
    };

    return (
        <div style={{ 
            padding: '0',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
            {/* Controls Bar */}
            <div style={{ 
                padding: '12px 15px',
                display: 'flex', 
                gap: '15px', 
                alignItems: 'center',
                backgroundColor: '#333',
                borderBottom: '2px solid #00c8c8',
                flexWrap: 'wrap'
            }}>
                {/* Color Picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Color:</label>
                    <input
                        type="color"
                        value={brushColor}
                        onChange={handleColorChange}
                        style={{ 
                            cursor: 'pointer', 
                            width: '40px', 
                            height: '35px', 
                            border: '2px solid #00c8c8', 
                            borderRadius: '4px'
                        }}
                    />
                </div>

                {/* Brush Size Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Size:</label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={handleSizeChange}
                        style={{ cursor: 'pointer', width: '120px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#00ffff', fontWeight: 'bold', minWidth: '35px' }}>
                        {brushSize}px
                    </span>
                </div>

                {/* Clear Button */}
                <button 
                    onClick={clearDrawings}
                    style={{
                        marginLeft: 'auto',
                        padding: '8px 15px',
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(255,68,68,0.4)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ff2222'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
                >
                    🗑️ Clear
                </button>
            </div>

            {/* Canvas Container */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
            }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => (isDrawing.current = false)}
                    onMouseLeave={() => (isDrawing.current = false)}
                    width={800}
                    height={600}
                    className="game-canvas"
                    style={{ 
                        border: '3px solid #333', 
                        borderRadius: '4px', 
                        cursor: 'crosshair',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }}
                />
            </div>
        </div>
    );
};

export default DrawingBoard;