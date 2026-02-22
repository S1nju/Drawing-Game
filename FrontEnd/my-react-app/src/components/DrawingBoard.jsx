import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const DrawingBoard = forwardRef(({ gameId, playerName, onClear }, ref) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [isRemoteDrawing, setIsRemoteDrawing] = useState(false);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setContext(ctx);
    }
  }, []);

  // Draw a point (for remote drawing)
  const drawPoint = (x, y, drawColor, size) => {
    if (!context) return;

    context.fillStyle = drawColor;
    context.beginPath();
    context.arc(x, y, size / 2, 0, Math.PI * 2);
    context.fill();
  };

  // Draw a line on canvas
  const drawLine = (fromX, fromY, toX, toY, drawColor, size) => {
    if (!context) return;

    context.strokeStyle = drawColor;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    drawRemoteStroke: (data) => {
      if (context) {
        drawPoint(data.x, data.y, data.color, data.size);
      }
    },
    clearCanvas: () => {
      if (context && canvasRef.current) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    },
  }), [context]);

  // Handle mouse down
  const handleMouseDown = (e) => {
    if (isRemoteDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setLastX(e.clientX - rect.left);
    setLastY(e.clientY - rect.top);
    setIsDrawing(true);
  };

  // Handle mouse move - draw locally and send to server
  const handleMouseMove = (e) => {
    if (!isDrawing || isRemoteDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw locally
    drawLine(lastX, lastY, x, y, color, brushSize);

    // Send to server
    sendDrawingData(x, y);

    setLastX(x);
    setLastY(y);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Send drawing data to server
  const sendDrawingData = async (x, y) => {
    try {
      await fetch('http://localhost:8005/api/v1/drawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          x,
          y,
          gameId,
          color,
          size: brushSize,
        }),
      });
    } catch (error) {
      console.error('Error sending drawing data:', error);
    }
  };

  // Clear canvas
  const handleClearCanvas = () => {
    if (context) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onClear?.();
  };

  // Download drawing
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL();
    link.download = `drawing-${gameId}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="drawing-board-wrapper">
      <div className="drawing-toolbar">
        <div className="toolbar-group">
          <label htmlFor="colorPicker">Color:</label>
          <input
            id="colorPicker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
        </div>

        <div className="toolbar-group">
          <label htmlFor="brushSize">Brush Size: {brushSize}px</label>
          <input
            id="brushSize"
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="slider"
          />
        </div>

        <div className="toolbar-group">
          <button onClick={handleClearCanvas} className="btn btn-danger">
            Clear Canvas
          </button>
          <button onClick={handleDownload} className="btn btn-success">
            Download
          </button>
        </div>

        <div className="player-info">
          <span>Player: {playerName}</span>
          <span>Game ID: {gameId}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
});

DrawingBoard.displayName = 'DrawingBoard';

export default DrawingBoard;
