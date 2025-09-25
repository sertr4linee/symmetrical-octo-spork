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
  const handleWheel = useCallback((opt: fabric.IEvent) => {
    const e = opt.e as WheelEvent;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const delta = e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      
      // Limit zoom levels
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      
      setZoom(zoom);
      
      const point = new fabric.Point(e.offsetX, e.offsetY);
      canvas.zoomToPoint(point, zoom);
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
        width: 800,
        height: 600,
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
    <div className="flex-1 flex items-center justify-center canvas-container overflow-hidden">
      <div className="relative border border-border rounded-md shadow-lg bg-white">
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