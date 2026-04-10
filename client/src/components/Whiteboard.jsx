import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

export default function Whiteboard({ roomId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    // Listen for whiteboard events
    socket.on('whiteboard-draw', (data) => {
      if (contextRef.current) {
        const { x0, y0, x1, y1, color, lineWidth } = data;
        contextRef.current.beginPath();
        contextRef.current.moveTo(x0, y0);
        contextRef.current.lineTo(x1, y1);
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = lineWidth;
        contextRef.current.stroke();
      }
    });

    socket.on('whiteboard-clear', () => {
      if (contextRef.current) {
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    return () => {
      socket.off('whiteboard-draw');
      socket.off('whiteboard-clear');
    };
  }, [socket]);

  const startDrawing = ({ nativeEvent: e }) => {
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent: e }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    // Emit to other users
    socket.emit('whiteboard-draw', {
      roomId,
      data: {
        x0: offsetX - e.movementX,
        y0: offsetY - e.movementY,
        x1: offsetX,
        y1: offsetY,
        color,
        lineWidth
      }
    });
  };

  const getCoordinates = (e) => {
    if (e.touches) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return { offsetX: e.offsetX, offsetY: e.offsetY };
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit('whiteboard-clear', { roomId });
  };

  return (
    <div className="fixed left-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute right-0 top-1/2 translate-x-full bg-purple-600 text-white px-3 py-2 rounded-r-lg shadow ${isOpen ? 'hidden' : ''}`}
      >
        🎨
      </button>

      <div className={`h-full flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-semibold">Tableau Blanc</h3>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>

        {/* Tools */}
        <div className="p-4 border-b flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm">Couleur:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Épaisseur:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <button
            onClick={clearCanvas}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Effacer
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
            onTouchMove={draw}
            className="border border-gray-300 rounded-lg cursor-crosshair bg-white"
            style={{ maxWidth: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
