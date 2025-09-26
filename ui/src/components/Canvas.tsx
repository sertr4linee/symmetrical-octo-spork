import React, { useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { useAppStore } from '@/store/app';

// Extend fabric.Canvas with custom properties
interface ExtendedCanvas extends fabric.Canvas {
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<ExtendedCanvas | null>(null);
  
  const { 
    canvas: canvasState, 
    currentProject,
    setZoom,
    setPan 
  } = useAppStore();

  // Handle wheel zoom
  const handleWheel = useCallback((opt: fabric.IEvent | any) => {
    const e = opt.e as WheelEvent;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      // Simple zoom calculation
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const currentZoom = canvas.getZoom();
      let newZoom = currentZoom + delta;
      
      // Limit zoom levels
      if (newZoom > 5) newZoom = 5;
      if (newZoom < 0.1) newZoom = 0.1;
      
      setZoom(newZoom);
      
      // Use canvas center if no specific point provided
      const centerX = opt.e?.offsetX || canvas.width! / 2;
      const centerY = opt.e?.offsetY || canvas.height! / 2;
      const point = new fabric.Point(centerX, centerY);
      canvas.zoomToPoint(point, newZoom);
    }
  }, [setZoom]);

  // Handle mouse pan
  const handleMouseDown = useCallback((opt: fabric.IEvent) => {
    const e = opt.e as MouseEvent;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle click or Ctrl+click for pan
      canvas.isDragging = true;
      canvas.selection = false;
      canvas.lastPosX = e.clientX;
      canvas.lastPosY = e.clientY;
    }
  }, []);

  const handleMouseMove = useCallback((opt: fabric.IEvent) => {
    const e = opt.e as MouseEvent;
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvas.isDragging) return;

    const vpt = canvas.viewportTransform;
    if (vpt && canvas.lastPosX !== undefined && canvas.lastPosY !== undefined) {
      vpt[4] += e.clientX - canvas.lastPosX;
      vpt[5] += e.clientY - canvas.lastPosY;
      
      setPan({ x: vpt[4], y: vpt[5] });
      canvas.requestRenderAll();
      canvas.lastPosX = e.clientX;
      canvas.lastPosY = e.clientY;
    }
  }, [setPan]);

  const handleMouseUp = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    canvas.isDragging = false;
    canvas.selection = true;
  }, []);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      // Initialize Fabric.js canvas
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 400,
        backgroundColor: 'white',
        selection: true,
        preserveObjectStacking: true,
      });

      // Enable drawing mode for brush tool
      canvas.isDrawingMode = canvasState.tool === 'brush';
      canvas.freeDrawingBrush.width = canvasState.brushSize;
      canvas.freeDrawingBrush.color = '#000000';

      // Add event listeners
      canvas.on('mouse:wheel', handleWheel);
      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);

      // Also add wheel listener directly to canvas element for better compatibility
      const canvasElement = canvasRef.current;
      if (canvasElement) {
        canvasElement.addEventListener('wheel', (e: WheelEvent) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const rect = canvasElement.getBoundingClientRect();
            const opt = {
              e: {
                ...e,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
              }
            };
            handleWheel(opt as any);
          }
        }, { passive: false });
      }

      fabricCanvasRef.current = canvas;
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Update canvas based on current tool
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      canvas.isDrawingMode = canvasState.tool === 'brush';
      
      if (canvasState.tool === 'brush') {
        canvas.freeDrawingBrush.width = canvasState.brushSize;
      }
    }
  }, [canvasState.tool, canvasState.brushSize]);

  // Update canvas zoom and pan
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      canvas.setZoom(canvasState.zoom);
      
      const vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] = canvasState.pan.x;
        vpt[5] = canvasState.pan.y;
        canvas.setViewportTransform(vpt);
      }
    }
  }, [canvasState.zoom, canvasState.pan]);

  return (
    <div 
      className="flex-1 flex items-center justify-center canvas-container overflow-auto"
      style={{ 
        padding: '40px',
        backgroundImage: `
          linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
          linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
          linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}
    >
      <div className="relative border-2 border-border rounded-lg shadow-xl bg-white" style={{ 
        minWidth: '600px',
        minHeight: '400px'
      }}>
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
        
        {/* Canvas overlay info */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {currentProject ? (
            <span>
              {currentProject.name} - {currentProject.width}x{currentProject.height}
            </span>
          ) : (
            <span>No project loaded</span>
          )}
        </div>
        
        {/* Zoom controls */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-2">
          <button 
            onClick={() => setZoom(Math.max(0.1, canvasState.zoom - 0.1))}
            className="hover:bg-white/20 px-1 rounded"
          >
            -
          </button>
          <span>{Math.round(canvasState.zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(Math.min(5, canvasState.zoom + 0.1))}
            className="hover:bg-white/20 px-1 rounded"
          >
            +
          </button>
          <button 
            onClick={() => setZoom(1)}
            className="hover:bg-white/20 px-1 rounded ml-1"
          >
            100%
          </button>
        </div>
      </div>
    </div>
  );
};

export default Canvas;