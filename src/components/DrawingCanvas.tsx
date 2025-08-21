'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { DrawingStroke, DrawingTool } from '../types/game';
import { Palette, Eraser, Trash2, Minus, Plus } from 'lucide-react';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
}

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
  '#A52A2A', '#808080', '#FFFFFF'
];

const BRUSH_SIZES = [2, 5, 10, 15, 20];

export default function DrawingCanvas({ width = 800, height = 600 }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { room, player, strokes, sendDrawingStroke, clearCanvas } = useGame();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>(DrawingTool.PEN);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(5);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<number[]>([]);
  
  const isDrawer = player?.id === room?.currentDrawerId;
  const canDraw = isDrawer && room?.gameState === 'drawing';

  // Draw stroke on canvas
  const drawStroke = useCallback((stroke: DrawingStroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    
    if (stroke.tool === DrawingTool.ERASER) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
    }
    
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    
    for (let i = 0; i < stroke.points.length; i += 2) {
      const x = stroke.points[i];
      const y = stroke.points[i + 1];
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    ctx.restore();
  }, []);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all strokes
    strokes.forEach(drawStroke);
  }, [strokes, drawStroke]);

  // Effect to redraw canvas when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Get mouse/touch position relative to canvas
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || 0;
      clientY = e.touches[0]?.clientY || 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const handleStartDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canDraw) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const { x, y } = getPosition(e);
    const newStroke = [x, y];
    setCurrentStroke(newStroke);
  }, [canDraw, getPosition]);

  const handleDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canDraw || !isDrawing) return;
    
    e.preventDefault();
    const { x, y } = getPosition(e);
    
    setCurrentStroke(prev => [...prev, x, y]);
  }, [canDraw, isDrawing, getPosition]);

  const handleStopDrawing = useCallback(() => {
    if (!isDrawing || currentStroke.length === 0) return;
    
    setIsDrawing(false);
    
    // Send the complete stroke to other players
    const stroke: Omit<DrawingStroke, 'id' | 'timestamp'> = {
      points: currentStroke,
      color: currentColor,
      width: currentSize,
      tool: currentTool
    };
    
    sendDrawingStroke(stroke);
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, currentColor, currentSize, currentTool, sendDrawingStroke]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Drawing Tools */}
      {canDraw && (
        <div className="modern-card p-6 w-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Palette className="text-indigo-500" size={20} />
            Drawing Tools
          </h3>
          
          <div className="flex flex-wrap items-center gap-6">
            {/* Tool Selection */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentTool(DrawingTool.PEN)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  currentTool === DrawingTool.PEN 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                ✏️
              </button>
              <button
                onClick={() => setCurrentTool(DrawingTool.ERASER)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  currentTool === DrawingTool.ERASER 
                    ? 'bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Eraser size={18} />
              </button>
            </div>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center gap-3 border border-blue-200"
              >
                <div 
                  className="w-6 h-6 rounded-lg border-2 border-white shadow-sm"
                  style={{ backgroundColor: currentColor }}
                />
                <Palette size={18} className="text-indigo-600" />
              </button>
              
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-3 p-4 modern-card z-20">
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setCurrentColor(color);
                          setShowColorPicker(false);
                        }}
                        className="w-10 h-10 rounded-xl border-3 hover:scale-110 transition-all duration-200 shadow-sm"
                        style={{ 
                          backgroundColor: color,
                          borderColor: color === currentColor ? '#4f46e5' : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200">
              <Minus size={16} className="text-emerald-600" />
              <select
                value={currentSize}
                onChange={(e) => setCurrentSize(Number(e.target.value))}
                className="border-0 bg-transparent text-emerald-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded-lg px-2 py-1"
              >
                {BRUSH_SIZES.map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
              <Plus size={16} className="text-emerald-600" />
            </div>

            {/* Clear Canvas */}
            <button
              onClick={clearCanvas}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div className="modern-card p-6 w-full">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`rounded-2xl bg-white border-4 border-gray-100 shadow-inner ${
              canDraw ? 'cursor-crosshair' : 'cursor-not-allowed'
            }`}
            onMouseDown={handleStartDrawing}
            onMouseMove={handleDrawing}
            onMouseUp={handleStopDrawing}
            onMouseLeave={handleStopDrawing}
            onTouchStart={handleStartDrawing}
            onTouchMove={handleDrawing}
            onTouchEnd={handleStopDrawing}
            style={{ 
              maxWidth: '100%',
              height: 'auto',
              touchAction: canDraw ? 'none' : 'auto'
            }}
          />
          
          {!canDraw && room?.gameState !== 'drawing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60 rounded-2xl backdrop-blur-sm">
              <div className="text-white text-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                {room?.gameState === 'waiting' && (
                  <div>
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-lg font-medium">Waiting for game to start...</p>
                  </div>
                )}
                {room?.gameState === 'word_selection' && (
                  <div>
                    <div className="text-2xl mb-3">🎨</div>
                    <p className="text-lg font-medium">Drawer is selecting a word...</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Show status text above canvas when watching someone draw */}
          {!canDraw && room?.gameState === 'drawing' && player?.id !== room?.currentDrawerId && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              👀 Watch {room?.players.find(p => p.id === room.currentDrawerId)?.username} draw!
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
