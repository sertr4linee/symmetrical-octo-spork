import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store/app';
import { useCanvasObjects, type CanvasObject } from '@/store/canvas';
import DropZone from './DropZone';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState('default');
  
  const { objects, selectedObjectId, addObject, updateObject, setSelectedObject, clearObjects } = useCanvasObjects();
  
  const { 
    canvas: canvasState, 
    currentProject,
    layers,
    addLayer,
    setActiveLayer
  } = useAppStore();

  // Get canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  // Clear and redraw canvas
  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx || !canvasRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Set up transformation for zoom and pan
    ctx.save();
    ctx.scale(canvasState.zoom, canvasState.zoom);
    ctx.translate(canvasState.pan.x, canvasState.pan.y);

    // Draw objects
    objects.forEach(obj => {
      // Pour la gomme, on ne vérifie pas la visibilité du calque car on gomme toujours
      if (obj.type !== 'eraser' && !layers.find(layer => layer.id === obj.id && layer.visible)) return;
      
      ctx.save();
      ctx.fillStyle = obj.color;
      ctx.strokeStyle = obj.strokeColor || '#000000';
      ctx.lineWidth = obj.strokeWidth || 1;

      switch (obj.type) {
        case 'rectangle':
          ctx.fillRect(obj.x, obj.y, obj.width || 100, obj.height || 100);
          if (obj.strokeWidth && obj.strokeWidth > 0) {
            ctx.strokeRect(obj.x, obj.y, obj.width || 100, obj.height || 100);
          }
          break;
        
        case 'circle':
          ctx.beginPath();
          ctx.arc(obj.x + (obj.width || 100) / 2, obj.y + (obj.height || 100) / 2, (obj.radius || 50), 0, 2 * Math.PI);
          ctx.fill();
          if (obj.strokeWidth && obj.strokeWidth > 0) {
            ctx.stroke();
          }
          break;
        
        case 'triangle':
          const w = obj.width || 100;
          const h = obj.height || 100;
          ctx.beginPath();
          ctx.moveTo(obj.x + w / 2, obj.y);
          ctx.lineTo(obj.x, obj.y + h);
          ctx.lineTo(obj.x + w, obj.y + h);
          ctx.closePath();
          ctx.fill();
          if (obj.strokeWidth && obj.strokeWidth > 0) {
            ctx.stroke();
          }
          break;
        
        case 'diamond':
          const dw = obj.width || 100;
          const dh = obj.height || 100;
          ctx.beginPath();
          ctx.moveTo(obj.x + dw / 2, obj.y);
          ctx.lineTo(obj.x + dw, obj.y + dh / 2);
          ctx.lineTo(obj.x + dw / 2, obj.y + dh);
          ctx.lineTo(obj.x, obj.y + dh / 2);
          ctx.closePath();
          ctx.fill();
          if (obj.strokeWidth && obj.strokeWidth > 0) {
            ctx.stroke();
          }
          break;
        
        case 'star':
          const starSize = Math.min(obj.width || 100, obj.height || 100) / 2;
          const centerX = obj.x + (obj.width || 100) / 2;
          const centerY = obj.y + (obj.height || 100) / 2;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? starSize : starSize / 2;
            const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
            const y = centerY + Math.sin(angle - Math.PI / 2) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          if (obj.strokeWidth && obj.strokeWidth > 0) {
            ctx.stroke();
          }
          break;
        
        case 'brush':
        case 'pencil':
        case 'eraser':
          const points = obj.points || [];
          if (points.length > 0) {
            if (obj.type === 'eraser') {
              ctx.globalCompositeOperation = 'destination-out';
              ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
              ctx.strokeStyle = obj.color;
              ctx.globalAlpha = canvasState.brushOpacity;
            }
            ctx.lineWidth = obj.type === 'pencil' ? Math.max(1, canvasState.brushSize / 3) : canvasState.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
          }
          break;
      }

      // Draw selection outline
      if (selectedObjectId === obj.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / canvasState.zoom;
        ctx.setLineDash([5 / canvasState.zoom, 5 / canvasState.zoom]);
        
        let bounds = { x: obj.x, y: obj.y, width: obj.width || 100, height: obj.height || 100 };
        if (obj.type === 'circle') {
          const radius = obj.radius || 50;
          bounds = {
            x: obj.x + (obj.width || 100) / 2 - radius,
            y: obj.y + (obj.height || 100) / 2 - radius,
            width: radius * 2,
            height: radius * 2
          };
        }
        
        ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [objects, getContext, layers, selectedObjectId, canvasState.zoom, canvasState.pan, canvasState.brushSize]);

  // Get object at position for selection - optimized and complete
  const getObjectAtPosition = useCallback((x: number, y: number) => {
    // Adjust coordinates for zoom and pan
    const adjustedX = (x / canvasState.zoom) - canvasState.pan.x;
    const adjustedY = (y / canvasState.zoom) - canvasState.pan.y;

    // Check objects from top to bottom (reverse order)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // Skip if layer is invisible
      const layer = layers.find(l => l.id === obj.id);
      if (!layer || !layer.visible) continue;
      
      switch (obj.type) {
        case 'rectangle':
          if (adjustedX >= obj.x && adjustedX <= obj.x + (obj.width || 100) &&
              adjustedY >= obj.y && adjustedY <= obj.y + (obj.height || 100)) {
            return obj.id;
          }
          break;
          
        case 'circle':
          const centerX = obj.x + (obj.width || 100) / 2;
          const centerY = obj.y + (obj.height || 100) / 2;
          const radius = obj.radius || 50;
          const distance = Math.sqrt((adjustedX - centerX) ** 2 + (adjustedY - centerY) ** 2);
          if (distance <= radius) {
            return obj.id;
          }
          break;
          
        case 'triangle':
          // Simple bounding box check for triangle
          if (adjustedX >= obj.x && adjustedX <= obj.x + (obj.width || 100) &&
              adjustedY >= obj.y && adjustedY <= obj.y + (obj.height || 100)) {
            return obj.id;
          }
          break;
          
        case 'diamond':
          // Diamond collision detection using rotated square bounds
          const diamondCenterX = obj.x + (obj.width || 100) / 2;
          const diamondCenterY = obj.y + (obj.height || 100) / 2;
          const diamondSize = (obj.width || 100) / 2;
          
          // Manhattan distance check for diamond
          const dx = Math.abs(adjustedX - diamondCenterX);
          const dy = Math.abs(adjustedY - diamondCenterY);
          if (dx / diamondSize + dy / diamondSize <= 1) {
            return obj.id;
          }
          break;
          
        case 'star':
          // Simple bounding circle for star
          const starCenterX = obj.x + (obj.width || 100) / 2;
          const starCenterY = obj.y + (obj.height || 100) / 2;
          const starRadius = (obj.width || 100) / 2;
          const starDistance = Math.sqrt((adjustedX - starCenterX) ** 2 + (adjustedY - starCenterY) ** 2);
          if (starDistance <= starRadius) {
            return obj.id;
          }
          break;
          
        case 'brush':
        case 'pencil':
        case 'eraser':
          // Check if click is near any point in the stroke
          if (obj.points && obj.points.length > 0) {
            const tolerance = (canvasState.brushSize || 10) / 2;
            for (const point of obj.points) {
              const pointDistance = Math.sqrt((adjustedX - point.x) ** 2 + (adjustedY - point.y) ** 2);
              if (pointDistance <= tolerance) {
                return obj.id;
              }
            }
          }
          break;
      }
    }
    return null;
  }, [objects, canvasState.zoom, canvasState.pan, canvasState.brushSize, layers]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentProject) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (canvasState.tool === 'select') {
      const objectId = getObjectAtPosition(x, y);
      if (objectId) {
        // If clicking on already selected object, just prepare for drag
        if (selectedObjectId === objectId) {
          setIsDragging(true);
          setDragStart({ x, y });
        } else {
          // Select new object and activate its layer
          setSelectedObject(objectId);
          setActiveLayer(objectId);
          setIsDragging(true);
          setDragStart({ x, y });
        }
      } else {
        // Click on empty area - deselect
        setSelectedObject(null);
        setIsDragging(false);
      }
    } else if (canvasState.tool === 'brush' || canvasState.tool === 'pencil' || canvasState.tool === 'eraser') {
      setIsDrawing(true);
      const adjustedX = (x / canvasState.zoom) - canvasState.pan.x;
      const adjustedY = (y / canvasState.zoom) - canvasState.pan.y;
      
      const toolName = canvasState.tool.charAt(0).toUpperCase() + canvasState.tool.slice(1);
      const newStrokeObject: CanvasObject = {
        id: `${canvasState.tool}_${Date.now()}`,
        type: canvasState.tool as 'brush' | 'pencil' | 'eraser',
        x: adjustedX,
        y: adjustedY,
        color: canvasState.tool === 'eraser' ? '#000000' : canvasState.brushColor,
        points: [{ x: adjustedX, y: adjustedY }]
      };

      addObject(newStrokeObject);
      addLayer({
        id: newStrokeObject.id,
        name: `${toolName} Stroke ${objects.length + 1}`,
        visible: true,
        opacity: 100,
        type: 'shape'
      });
    }
  }, [canvasState.tool, canvasState.zoom, canvasState.pan, canvasState.brushColor, currentProject, getObjectAtPosition, setSelectedObject, addObject, addLayer, objects.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentProject) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor based on tool and hover state
    if (canvasState.tool === 'select') {
      const objectId = getObjectAtPosition(x, y);
      if (isDragging) {
        setCursor('move');
      } else if (objectId) {
        setCursor(selectedObjectId === objectId ? 'move' : 'pointer');
      } else {
        setCursor('default');
      }
    } else if (canvasState.tool === 'brush' || canvasState.tool === 'pencil') {
      setCursor('crosshair');
    } else if (canvasState.tool === 'eraser') {
      setCursor('alias');
    }

    if ((canvasState.tool === 'brush' || canvasState.tool === 'pencil' || canvasState.tool === 'eraser') && isDrawing) {
      const adjustedX = (x / canvasState.zoom) - canvasState.pan.x;
      const adjustedY = (y / canvasState.zoom) - canvasState.pan.y;
      
      const currentObject = objects[objects.length - 1];
      if (currentObject && 
          (currentObject.type === 'brush' || currentObject.type === 'pencil' || currentObject.type === 'eraser') && 
          currentObject.points) {
        updateObject(currentObject.id, {
          points: [...currentObject.points, { x: adjustedX, y: adjustedY }]
        });
      }
    } else if (canvasState.tool === 'select' && isDragging && selectedObjectId) {
      const deltaX = ((x - dragStart.x) / canvasState.zoom);
      const deltaY = ((y - dragStart.y) / canvasState.zoom);
      
      const selectedObj = objects.find(obj => obj.id === selectedObjectId);
      if (selectedObj) {
        updateObject(selectedObjectId, {
          x: selectedObj.x + deltaX,
          y: selectedObj.y + deltaY
        });
        
        setDragStart({ x, y });
      }
    }
  }, [canvasState.tool, canvasState.zoom, canvasState.pan, isDrawing, isDragging, selectedObjectId, dragStart, currentProject, objects, updateObject]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setIsDragging(false);
  }, []);

  // Listen for sidebar actions
  useEffect(() => {
    const handleCreateShape = (event: CustomEvent) => {
      const { shapeType, layerId, color } = event.detail;
      if (!currentProject) return;

      const newShape: CanvasObject = {
        id: layerId,
        type: shapeType,
        x: 50 + (objects.length * 20),
        y: 50 + (objects.length * 20),
        width: 100,
        height: 100,
        radius: shapeType === 'circle' ? 50 : undefined,
        sides: shapeType === 'polygon' ? 6 : undefined,
        color: color,
        strokeColor: '#FFFFFF',
        strokeWidth: 2
      };

      addObject(newShape);
    };

    const handleClearCanvas = () => {
      clearObjects();
    };

    window.addEventListener('canvasCreateShape', handleCreateShape as EventListener);
    window.addEventListener('canvasClear', handleClearCanvas);

    return () => {
      window.removeEventListener('canvasCreateShape', handleCreateShape as EventListener);
      window.removeEventListener('canvasClear', handleClearCanvas);
    };
  }, [currentProject, objects.length, addObject, clearObjects]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;
    
    redrawCanvas();
  }, [redrawCanvas]);

  // Redraw when objects change
  useEffect(() => {
    redrawCanvas();
  }, [objects, redrawCanvas]);

  return (
    <DropZone>
      <div className="flex-1 relative overflow-hidden bg-muted canvas-container">
        <div className="w-full h-full flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            className="bg-white shadow-lg"
            style={{
              transform: `scale(${canvasState.zoom}) translate(${canvasState.pan.x}px, ${canvasState.pan.y}px)`,
              transformOrigin: 'center center',
              cursor: cursor
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {/* No project overlay */}
          {!currentProject && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg border border-border">
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-3">🎨</div>
                <div className="font-medium text-foreground">No Project Loaded</div>
                <div className="text-sm mt-1">Open or create a project to start editing</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DropZone>
  );
};

export default Canvas;