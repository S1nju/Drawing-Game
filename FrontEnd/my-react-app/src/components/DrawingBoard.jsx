import React, { useEffect, useRef } from 'react';
import echo from '../hooks/useEcho';

const DrawingBoard = ({ roomId = '123' }) => {
    const canvasRef = useRef(null);
    const channelRef = useRef(null); // Use a ref to store the channel
    const isDrawing = useRef(false);

    useEffect(() => {
        console.log(`%c [Echo] Joining: drawing.${roomId}`, 'color: blue');

        const chatChannel = echo.join(`drawing.${roomId}`);

        chatChannel
            .here((users) => {
                console.log('%c [Echo] Connected! Players:', 'color: green', users);
                // Store the channel in the ref so other functions can use it
                channelRef.current = chatChannel;
            })
            .listenForWhisper('draw', (event) => {
                drawOnCanvas(event.x, event.y, event.isNewPath);
            })
            .error((err) => {
                console.error('[Echo] Auth/Connection Error:', err);
            });

        return () => {
            console.log('[Echo] Leaving channel');
            echo.leave(`drawing.${roomId}`);
            channelRef.current = null;
        };
    }, [roomId]);

    const drawOnCanvas = (x, y, isNewPath) => {
        const ctx = canvasRef.current.getContext('2d');
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

        drawOnCanvas(x, y, false);

        // Access the channel via the Ref
        channelRef.current.whisper('draw', { x, y, isNewPath: false });
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
        
        drawOnCanvas(x, y, true);
        channelRef.current.whisper('draw', { x, y, isNewPath: true });
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={() => (isDrawing.current = false)}
            onMouseLeave={() => (isDrawing.current = false)}
            width={800}
            height={600}
            className="game-canvas"
        />
    );
};

export default DrawingBoard;