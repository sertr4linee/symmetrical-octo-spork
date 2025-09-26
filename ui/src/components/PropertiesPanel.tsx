import React from 'react';
import { useAppStore } from '@/store/app';
import { Palette, Brush, Move, MousePointer } from 'lucide-react';

const PropertiesPanel: React.FC = () => {
  const { 
    canvas, 
    updateCanvasState, 
    setCurrentTool,
    setBrushColor
  } = useAppStore();

  const tools = [
    { id: 'select', label: 'Select', icon: MousePointer },
    { id: 'brush', label: 'Brush', icon: Brush },
    { id: 'move', label: 'Move', icon: Move },
  ];

  const handleToolChange = (toolId: string) => {
    setCurrentTool(toolId);
  };

  const handleBrushSizeChange = (size: number) => {
    updateCanvasState({ brushSize: size });
  };

  const handleBrushOpacityChange = (opacity: number) => {
    updateCanvasState({ brushOpacity: opacity });
  };

  const handleBrushColorChange = (color: string) => {
    setBrushColor(color);
  };

  return (
    <div className="w-64 bg-background border-r border-border h-full flex flex-col">
      {/* Tools Section */}
      <div className="p-3 border-b border-border">
        <h3 className="font-medium text-sm mb-3">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`p-3 rounded-lg border transition-colors ${
                  canvas.tool === tool.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
                title={tool.label}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">{tool.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Properties */}
      <div className="p-3 border-b border-border">
        <h3 className="font-medium text-sm mb-3">Tool Properties</h3>
        
        {canvas.tool === 'brush' && (
          <div className="space-y-4">
            {/* Brush Size */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Brush Size: {canvas.brushSize}px
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={canvas.brushSize}
                onChange={(e) => handleBrushSizeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brush Opacity */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Opacity: {Math.round(canvas.brushOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={canvas.brushOpacity}
                onChange={(e) => handleBrushOpacityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brush Color */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvas.brushColor}
                  onChange={(e) => handleBrushColorChange(e.target.value)}
                  className="w-8 h-8 border border-border rounded cursor-pointer"
                  title="Brush Color"
                />
                <input
                  type="text"
                  value={canvas.brushColor}
                  onChange={(e) => handleBrushColorChange(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        )}

        {canvas.tool === 'select' && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Select objects to transform them.
            </div>
          </div>
        )}

        {canvas.tool === 'move' && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Click and drag to move the canvas view.
            </div>
          </div>
        )}
      </div>

      {/* Canvas Properties */}
      <div className="p-3 border-b border-border">
        <h3 className="font-medium text-sm mb-3">Canvas</h3>
        
        <div className="space-y-3">
          {/* Zoom */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Zoom: {Math.round(canvas.zoom * 100)}%
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateCanvasState({ zoom: Math.max(0.1, canvas.zoom - 0.1) })}
                className="px-2 py-1 text-xs border border-border rounded hover:bg-muted"
              >
                -
              </button>
              <button
                onClick={() => updateCanvasState({ zoom: 1 })}
                className="px-2 py-1 text-xs border border-border rounded hover:bg-muted flex-1"
              >
                Fit
              </button>
              <button
                onClick={() => updateCanvasState({ zoom: Math.min(5, canvas.zoom + 0.1) })}
                className="px-2 py-1 text-xs border border-border rounded hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>

          {/* Pan Reset */}
          <div>
            <button
              onClick={() => updateCanvasState({ pan: { x: 0, y: 0 } })}
              className="w-full px-2 py-1 text-xs border border-border rounded hover:bg-muted"
            >
              Center View
            </button>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="p-3 border-b border-border">
        <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color Palette
        </h3>
        
        <div className="grid grid-cols-8 gap-1">
          {[
            '#000000', '#333333', '#666666', '#999999',
            '#CCCCCC', '#FFFFFF', '#FF0000', '#00FF00',
            '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
            '#800000', '#008000', '#000080', '#808000',
          ].map((color, index) => (
            <button
              key={index}
              className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                canvas.brushColor === color ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
              title={color}
              onClick={() => handleBrushColorChange(color)}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3">
        <h3 className="font-medium text-sm mb-3">Quick Actions</h3>
        
        <div className="space-y-2">
          <button className="w-full px-3 py-2 text-sm border border-border rounded hover:bg-muted text-left">
            Reset Canvas
          </button>
          <button className="w-full px-3 py-2 text-sm border border-border rounded hover:bg-muted text-left">
            Clear All Objects
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;