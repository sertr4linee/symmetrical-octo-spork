import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store/app';
import DropZone from './DropZone';

interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'brush' | 'triangle' | 'diamond' | 'star' | 'polygon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
  sides?: number; // For polygon
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const { 
    canvas: canvasState, 
    currentProject,
    layers,
    addLayer,
    removeLayer,
    setZoom
  } = useAppStore();

  // Get canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  // Find object at position
  const getObjectAtPosition = useCallback((x: number, y: number): CanvasObject | null => {
    // Check objects in reverse order (top to bottom)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      switch (obj.type) {
        case 'rectangle':
          if (obj.width && obj.height &&
              x >= obj.x && x <= obj.x + obj.width &&
              y >= obj.y && y <= obj.y + obj.height) {
            return obj;
          }
          break;
          
        case 'circle':
          if (obj.radius) {
            const centerX = obj.x + (obj.width || 0) / 2;
            const centerY = obj.y + (obj.height || 0) / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance <= obj.radius) {
              return obj;
            }
          }
          break;
          
        case 'triangle':
        case 'diamond':
        case 'star':
        case 'polygon':
          // Simple bounding box check for complex shapes
          if (obj.width && obj.height &&
              x >= obj.x && x <= obj.x + obj.width &&
              y >= obj.y && y <= obj.y + obj.height) {
            return obj;
          }
          break;
          
        case 'brush':
          // Check if point is near any brush stroke point
          if (obj.points) {
            for (const point of obj.points) {
              const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
              if (distance <= (obj.strokeWidth || 2) * 2) {
                return obj;
              }
            }
          }
          break;
      }
    }
    return null;
  }, [objects]);

  // Clear canvas and redraw all objects
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all objects in layer order and respect visibility
    const sortedObjects = [...objects].sort((a, b) => {
      const layerA = layers.find(l => l.id === a.id);
      const layerB = layers.find(l => l.id === b.id);
      const indexA = layerA ? layers.indexOf(layerA) : 999;
      const indexB = layerB ? layers.indexOf(layerB) : 999;
      return indexB - indexA; // Reverse order (layers are displayed bottom to top)
    });

    sortedObjects.forEach(obj => {
      // Check if layer is visible
      const layer = layers.find(l => l.id === obj.id);
      if (!layer || !layer.visible) {
        return; // Skip invisible objects
      }

      ctx.save();
      
      // Apply layer opacity
      ctx.globalAlpha = (layer.opacity || 100) / 100;
      
      switch (obj.type) {
        case 'rectangle':
          ctx.fillStyle = obj.color;
          ctx.strokeStyle = obj.strokeColor || '#000';
          ctx.lineWidth = obj.strokeWidth || 1;
          
          if (obj.width && obj.height) {
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            if (obj.strokeWidth) {
              ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            }
          }
          break;
          
        case 'circle':
          ctx.fillStyle = obj.color;
          ctx.strokeStyle = obj.strokeColor || '#000';
          ctx.lineWidth = obj.strokeWidth || 1;
          
          if (obj.radius) {
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
            ctx.fill();
            if (obj.strokeWidth) {
              ctx.stroke();
            }
          }
          break;
          
        case 'triangle':
          if (obj.width && obj.height) {
            ctx.fillStyle = obj.color;
            ctx.strokeStyle = obj.strokeColor || '#000';
            ctx.lineWidth = obj.strokeWidth || 1;
            
            ctx.beginPath();
            ctx.moveTo(obj.x + obj.width / 2, obj.y); // Top point
            ctx.lineTo(obj.x, obj.y + obj.height); // Bottom left
            ctx.lineTo(obj.x + obj.width, obj.y + obj.height); // Bottom right
            ctx.closePath();
            ctx.fill();
            if (obj.strokeWidth) {
              ctx.stroke();
            }
          }
          break;
          
        case 'diamond':
          if (obj.width && obj.height) {
            ctx.fillStyle = obj.color;
            ctx.strokeStyle = obj.strokeColor || '#000';
            ctx.lineWidth = obj.strokeWidth || 1;
            
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            
            ctx.beginPath();
            ctx.moveTo(centerX, obj.y); // Top
            ctx.lineTo(obj.x + obj.width, centerY); // Right
            ctx.lineTo(centerX, obj.y + obj.height); // Bottom
            ctx.lineTo(obj.x, centerY); // Left
            ctx.closePath();
            ctx.fill();
            if (obj.strokeWidth) {
              ctx.stroke();
            }
          }
          break;
          
        case 'star':
          if (obj.width && obj.height) {
            ctx.fillStyle = obj.color;
            ctx.strokeStyle = obj.strokeColor || '#000';
            ctx.lineWidth = obj.strokeWidth || 1;
            
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            const outerRadius = Math.min(obj.width, obj.height) / 2;
            const innerRadius = outerRadius * 0.5;
            const spikes = 5;
            
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (i * Math.PI) / spikes - Math.PI / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            if (obj.strokeWidth) {
              ctx.stroke();
            }
          }
          break;
          
        case 'polygon':
          if (obj.width && obj.height) {
            ctx.fillStyle = obj.color;
            ctx.strokeStyle = obj.strokeColor || '#000';
            ctx.lineWidth = obj.strokeWidth || 1;
            
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            const radius = Math.min(obj.width, obj.height) / 2;
            const sides = obj.sides || 6; // Default hexagon
            
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
              const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            if (obj.strokeWidth) {
              ctx.stroke();
            }
          }
          break;
          
        case 'brush':
          if (obj.points && obj.points.length > 1) {
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = obj.strokeWidth || 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(obj.points[0].x, obj.points[0].y);
            for (let i = 1; i < obj.points.length; i++) {
              ctx.lineTo(obj.points[i].x, obj.points[i].y);
            }
            ctx.stroke();
          }
          break;
      }
      
      ctx.restore();
    });

    // Draw selection border
    if (selectedObject) {
      const obj = objects.find(o => o.id === selectedObject);
      if (obj) {
        ctx.save();
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        switch (obj.type) {
          case 'rectangle':
          case 'triangle':
          case 'diamond':
          case 'star':
          case 'polygon':
            if (obj.width && obj.height) {
              ctx.strokeRect(obj.x - 5, obj.y - 5, obj.width + 10, obj.height + 10);
            }
            break;
            
          case 'circle':
            if (obj.radius) {
              const centerX = obj.x + (obj.width || 0) / 2;
              const centerY = obj.y + (obj.height || 0) / 2;
              ctx.beginPath();
              ctx.arc(centerX, centerY, obj.radius + 5, 0, 2 * Math.PI);
              ctx.stroke();
            }
            break;
            
          case 'brush':
            if (obj.points && obj.points.length > 0) {
              // Find bounding box of brush stroke
              let minX = obj.points[0].x, maxX = obj.points[0].x;
              let minY = obj.points[0].y, maxY = obj.points[0].y;
              
              for (const point of obj.points) {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
              }
              
              ctx.strokeRect(minX - 10, minY - 10, maxX - minX + 20, maxY - minY + 20);
            }
            break;
        }
        
        ctx.restore();
      }
    }
  }, [objects, getContext, layers, selectedObject]);

  // Handle mouse events for drawing
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentProject) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);

    if (canvasState.tool === 'brush') {
      // Start new brush stroke
      const newBrushObject: CanvasObject = {
        id: `brush_${Date.now()}`,
        type: 'brush',
        x,
        y,
        color: canvasState.brushColor,
        strokeWidth: canvasState.brushSize,
        points: [{ x, y }]
      };
      
      setObjects(prev => [...prev, newBrushObject]);
      
      // Add to layers
      addLayer({
        id: newBrushObject.id,
        name: `Brush ${layers.length + 1}`,
        visible: true,
        opacity: 100,
        type: 'shape'
      });
    } else if (canvasState.tool === 'shapes') {
      // Create shape at click position - cycle through different shapes
      const shapeTypes: Array<'circle' | 'triangle' | 'diamond' | 'star' | 'polygon'> = 
        ['circle', 'triangle', 'diamond', 'star', 'polygon'];
      const shapeType = shapeTypes[objects.length % shapeTypes.length];
      
      const newShapeObject: CanvasObject = {
        id: `${shapeType}_${Date.now()}`,
        type: shapeType,
        x: x - 50, // Center the shape
        y: y - 50,
        width: 100,
        height: 100,
        radius: shapeType === 'circle' ? 50 : undefined,
        sides: shapeType === 'polygon' ? 6 : undefined,
        color: canvasState.brushColor,
        strokeColor: '#FFFFFF',
        strokeWidth: 2
      };
      
      setObjects(prev => [...prev, newShapeObject]);
      
      // Add to layers
      addLayer({
        id: newShapeObject.id,
        name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${layers.length + 1}`,
        visible: true,
        opacity: 100,
        type: 'shape'
      });
    }
  }, [canvasState, currentProject, addLayer, layers.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing || !currentProject) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (canvasState.tool === 'brush') {
      // Add point to current brush stroke
      setObjects(prev => {
        const newObjects = [...prev];
        const lastObject = newObjects[newObjects.length - 1];
        
        if (lastObject && lastObject.type === 'brush' && lastObject.points) {
          lastObject.points.push({ x, y });
        }
        
        return newObjects;
      });
    }
  }, [isDrawing, canvasState.tool, currentProject]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Add test shape function
  const addTestShape = useCallback(() => {
    if (!currentProject) return;

    const newRect: CanvasObject = {
      id: `rect_${Date.now()}`,
      type: 'rectangle',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: '#FF0000',
      strokeColor: '#FFFFFF',
      strokeWidth: 3
    };

    setObjects(prev => [...prev, newRect]);
    
    // Add to layers
    addLayer({
      id: newRect.id,
      name: `Shape ${layers.length + 1}`,
      visible: true,
      opacity: 100,
      type: 'shape'
    });

    console.log('✅ Rectangle added successfully!');
    console.log('Objects count:', objects.length + 1);
  }, [currentProject, addLayer, layers.length, objects.length]);

  // Add specific shape type function
  const addTestShapeByType = useCallback((shapeType: 'circle' | 'triangle' | 'diamond' | 'star' | 'polygon') => {
    if (!currentProject) return;

    const newShape: CanvasObject = {
      id: `${shapeType}_${Date.now()}`,
      type: shapeType,
      x: 50 + (objects.length * 20), // Offset each new shape
      y: 50 + (objects.length * 20),
      width: 100,
      height: 100,
      radius: shapeType === 'circle' ? 50 : undefined,
      sides: shapeType === 'polygon' ? 6 : undefined,
      color: canvasState.brushColor,
      strokeColor: '#FFFFFF',
      strokeWidth: 2
    };

    setObjects(prev => [...prev, newShape]);
    
    // Add to layers
    addLayer({
      id: newShape.id,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${layers.length + 1}`,
      visible: true,
      opacity: 100,
      type: 'shape'
    });

    console.log(`✅ ${shapeType} added successfully!`);
  }, [currentProject, addLayer, layers.length, objects.length, canvasState.brushColor]);

  // Clear all objects
  const clearCanvas = useCallback(() => {
    setObjects([]);
    console.log('Canvas cleared');
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 400;
    
    redrawCanvas();
  }, [redrawCanvas]);

  // Redraw when objects change
  useEffect(() => {
    redrawCanvas();
  }, [objects, redrawCanvas]);

  // Sync canvas objects with layers (remove objects when layers are deleted)
  useEffect(() => {
    const layerIds = layers.map(layer => layer.id);
    
    setObjects(prevObjects => 
      prevObjects.filter(obj => layerIds.includes(obj.id))
    );
  }, [layers]);

  // Handle dropped images
  const handleFilesDropped = useCallback(async (files: File[]) => {
    for (const file of files) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = getContext();
          if (!canvas || !ctx) return;

          // Draw image on canvas
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1);
          const width = img.width * scale;
          const height = img.height * scale;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          
          ctx.drawImage(img, x, y, width, height);
          
          // Add to layers
          addLayer({
            id: `image_${Date.now()}`,
            name: `Image ${layers.length + 1}`,
            visible: true,
            opacity: 100,
            type: 'image'
          });
          
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }
  }, [getContext, addLayer, layers.length]);

  return (
    <DropZone 
      onFilesDropped={handleFilesDropped}
      className="flex-1 flex items-center justify-center canvas-container overflow-auto"
      disabled={!currentProject}
      maxFiles={5}
      maxSize={10 * 1024 * 1024} // 10MB max per file
    >
      <div 
        className="w-full h-full flex items-center justify-center"
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
            className="block cursor-crosshair"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {/* Canvas overlay info */}
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {currentProject ? (
              <span>
                {currentProject.name} - {currentProject.width}x{currentProject.height}
              </span>
            ) : (
              <span>No project loaded - Open a project to enable canvas</span>
            )}
          </div>
          
          {/* Tool info */}
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            Tool: {canvasState.tool} | Size: {canvasState.brushSize}px | Objects: {objects.length}
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
            <button 
              onClick={addTestShape}
              className="hover:bg-white/20 px-2 py-1 rounded ml-1 text-xs bg-green-600"
            >
              + Rect
            </button>
            <button 
              onClick={() => addTestShapeByType('circle')}
              className="hover:bg-white/20 px-2 py-1 rounded ml-1 text-xs bg-blue-600"
            >
              + Circle
            </button>
            <button 
              onClick={() => addTestShapeByType('triangle')}
              className="hover:bg-white/20 px-2 py-1 rounded ml-1 text-xs bg-purple-600"
            >
              + Triangle
            </button>
            <button 
              onClick={() => addTestShapeByType('diamond')}
              className="hover:bg-white/20 px-2 py-1 rounded ml-1 text-xs bg-yellow-600"
            >
              + Diamond
            </button>
            <button 
              onClick={() => addTestShapeByType('star')}
              className="hover:bg-white/20 px-2 py-1 rounded ml-1 text-xs bg-pink-600"
            >
              + Star
            </button>
            <button 
              onClick={clearCanvas}
              className="hover:bg-white/20 px-2 py-1 rounded ml-1 text-xs bg-red-600"
            >
              Clear
            </button>
          </div>
          
          {/* No project overlay */}
          {!currentProject && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm rounded-lg">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-medium">No Project Loaded</div>
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