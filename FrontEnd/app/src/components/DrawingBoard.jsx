import React, { useEffect, useRef, useState, useCallback } from 'react';
import useEcho from '../hooks/useEcho';

const DrawingBoard = ({ roomId = '123', word = '', isDrawer = false, userId }) => {
    const canvasRef   = useRef(null);
    const channelRef  = useRef(null);
    const isDrawing   = useRef(false);
    const echo        = useEcho();

    // Refs to avoid stale closures in listeners/throttles
    const isDrawerRef = useRef(isDrawer);
    const userIdRef   = useRef(userId);
    const roomIdRef   = useRef(roomId);

    useEffect(() => { isDrawerRef.current = isDrawer; }, [isDrawer]);
    useEffect(() => { userIdRef.current   = userId; },   [userId]);
    useEffect(() => { roomIdRef.current   = roomId; },   [roomId]);

    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize]   = useState(5);

    const saveCanvasToLocalStorage = () => {
        if (canvasRef.current) {
            localStorage.setItem(`drawing_${roomId}`, canvasRef.current.toDataURL());
        }
    };

    const loadCanvasFromLocalStorage = () => {
        if (canvasRef.current) {
            const canvasData = localStorage.getItem(`drawing_${roomId}`);
            if (canvasData) {
                const img = new Image();
                img.onload = () => {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = canvasData;
            }
        }
    };

    const clearDrawings = () => {
        if (!isDrawerRef.current) return;
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            localStorage.removeItem(`drawing_${roomId}`);
            sendDrawEvent({ isClear: true });
        }
    };

    // Low-level send function
    const sendDrawEvent = async (data) => {
        if (!isDrawerRef.current || !roomIdRef.current || !userIdRef.current) return;
        
        try {
            const socketId = echo?.socketId();
            
            await fetch(`http://127.0.0.1:8000/api/game/${roomIdRef.current}/draw`, {

                method:  'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Socket-ID':  socketId || ''
                },
                body: JSON.stringify({ ...data, user_id: userIdRef.current }),
            });
        } catch (err) {
            console.error('[DrawingBoard] Sync failed:', err);
        }
    };

    // Manual throttle logic in a ref to avoid stale closure issues
    const lastSendTime = useRef(0);
    const throttledSend = (data) => {
        const now = Date.now();
        if (now - lastSendTime.current >= 50) { // 20fps
            sendDrawEvent(data);
            lastSendTime.current = now;
        }
    };

    useEffect(() => {
        loadCanvasFromLocalStorage();
        if (!echo || !roomId) return;

        // Auto-clear logic for new round
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
        localStorage.removeItem(`drawing_${roomId}`);

        console.log(`[DrawingBoard] Subscribing to public channel: drawing.${roomId}`);
        const channel = echo.channel(`drawing.${roomId}`);
        channelRef.current = channel;

        channel.listen('.DrawEvent', (event) => {
            if (event.isClear) {
                const ctx = canvasRef.current?.getContext('2d');
                ctx?.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
                localStorage.removeItem(`drawing_${roomId}`);
            } else {
                drawOnCanvas(event.x, event.y, event.size, event.color, event.isNewPath);
                saveCanvasToLocalStorage();
            }
        });

        return () => {
            echo.leave(`drawing.${roomId}`);
            channelRef.current = null;
        };
    }, [roomId, echo]);

    const drawOnCanvas = (x, y, size, color, isNewPath) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.lineWidth   = size;
        ctx.strokeStyle = color;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';

        if (isNewPath) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const startDrawing = (e) => {
        if (!isDrawerRef.current) return;

        isDrawing.current = true;
        const rect = canvasRef.current.getBoundingClientRect();
        const x    = e.clientX - rect.left;
        const y    = e.clientY - rect.top;

        drawOnCanvas(x, y, brushSize, brushColor, true);
        sendDrawEvent({ x, y, size: brushSize, color: brushColor, isNewPath: true });
    };

    const handleMouseMove = (e) => {
        if (!isDrawerRef.current || !isDrawing.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x    = e.clientX - rect.left;
        const y    = e.clientY - rect.top;

        drawOnCanvas(x, y, brushSize, brushColor, false);
        throttledSend({ x, y, size: brushSize, color: brushColor, isNewPath: false });
        saveCanvasToLocalStorage();
    };

    const stopDrawing = () => {
        isDrawing.current = false;
        saveCanvasToLocalStorage();
    };

    return (
        <div style={{
            height:          '100%',
            width:           '100%',
            display:         'flex',
            flexDirection:   'column',
            backgroundColor: '#f5f5f5',
            borderRadius:    '8px',
            overflow:        'hidden',
            boxShadow:       '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            {/* Header / Drawing Controls */}
            <div style={{
                padding:         '12px 15px',
                display:         'flex',
                gap:             '15px',
                alignItems:      'center',
                backgroundColor: '#333',
                borderBottom:    '2px solid #00c8c8',
                flexWrap:        'wrap'
            }}>
                {isDrawer && word && (
                    <div style={{
                        padding:         '6px 14px',
                        borderRadius:    '6px',
                        backgroundColor: '#1a4a1a',
                        border:          '2px solid #4CAF50',
                        color:           '#fff',
                        fontWeight:      700,
                        marginRight:     '10px'
                    }}>
                        WORD: {word.toUpperCase()}
                    </div>
                )}

                {isDrawer ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px' }}>
                            Color:
                            <input
                                type="color"
                                value={brushColor}
                                onChange={e => setBrushColor(e.target.value)}
                                style={{ width: '40px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px' }}>
                            Size:
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={brushSize}
                                onChange={e => setBrushSize(parseInt(e.target.value))}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ minWidth: '30px', color: '#00c8c8' }}>{brushSize}px</span>
                        </div>
                        <button
                            onClick={clearDrawings}
                            style={{
                                marginLeft:      'auto',
                                padding:         '6px 12px',
                                backgroundColor: '#e94560',
                                color:           'white',
                                border:          'none',
                                borderRadius:    '4px',
                                fontWeight:      'bold',
                                cursor:          'pointer'
                            }}
                        >
                            🗑️ CLEAR
                        </button>
                    </>
                ) : (
                    <div style={{
                        padding:    '6px 12px',
                        color:      '#888',
                        fontSize:   '13px',
                        fontWeight: 'bold',
                        fontStyle:  'italic'
                    }}>
                        Wait – you are guessing!
                    </div>
                )}
            </div>

            <div style={{
                flex:            1,
                backgroundColor: 'white',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                cursor:          isDrawer ? 'crosshair' : 'default',
                position:        'relative'
            }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    width={800}
                    height={600}
                    style={{
                        maxWidth:        '100%',
                        maxHeight:       '100%',
                        backgroundColor: 'white',
                        boxShadow:       '0 0 20px rgba(0,0,0,0.1)'
                    }}
                />
            </div>
        </div>
    );
};

export default DrawingBoard;