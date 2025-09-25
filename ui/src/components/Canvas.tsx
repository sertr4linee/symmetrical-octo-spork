import React, { useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { useAppStore } from '@/store/app';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const { canvas: canvasState, currentProject } = useAppStore();

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      // Initialize Fabric.js canvas
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: 'white',
      });
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      // Update canvas zoom
      fabricCanvasRef.current.setZoom(canvasState.zoom);
      
      // Update canvas pan
      fabricCanvasRef.current.setViewportTransform([
        canvasState.zoom,
        0,
        0,
        canvasState.zoom,
        canvasState.pan.x,
        canvasState.pan.y,
      ]);
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
        
        {/* Zoom indicator */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {Math.round(canvasState.zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default Canvas;