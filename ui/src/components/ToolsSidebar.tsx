import React from 'react';
import { useAppStore } from '@/store/app';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer2,
  Brush, 
  PenTool,
  Eraser,
  Square, 
  Circle, 
  Triangle, 
  Diamond,
  Star,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus
} from 'lucide-react';

interface ToolsSidebarProps {
  onAddShape: (type: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star') => void;
  onClearCanvas: () => void;
  onNewProject: () => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ onAddShape, onClearCanvas, onNewProject }) => {
  const { 
    canvas: canvasState, 
    setCurrentTool,
    setZoom,
    updateCanvasState
  } = useAppStore();

  // Organized color palettes
  const primaryColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const greyScale = [
    '#F8F8F8', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#808080',
    '#606060', '#404040', '#303030', '#202020', '#101010'
  ];

  const warmColors = [
    '#FFE4E1', '#FFA07A', '#FF7F50', '#FF6347', '#FF4500',
    '#DC143C', '#B22222', '#8B0000', '#A0522D', '#D2691E'
  ];

  const coolColors = [
    '#E0FFFF', '#AFEEEE', '#48D1CC', '#00CED1', '#5F9EA0',
    '#4682B4', '#1E90FF', '#0000CD', '#000080', '#191970'
  ];

  return (
    <div className="w-full h-full bg-background flex flex-col p-4 space-y-4 overflow-hidden">
      {/* New Project */}
      <Button 
        onClick={onNewProject}
        className="w-full bg-foreground text-background hover:bg-foreground/90 h-9 flex-shrink-0"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Project
      </Button>

      <Separator className="bg-border flex-shrink-0" />

      {/* Drawing Tools */}
      <div className="flex-shrink-0">
        <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Drawing Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <Toggle
            pressed={canvasState.tool === 'select'}
            onPressedChange={() => setCurrentTool('select')}
            className="data-[state=on]:bg-foreground data-[state=on]:text-background h-9 border border-border hover:bg-accent text-xs justify-start"
          >
            <MousePointer2 className="w-4 h-4 mr-1" />
            Select
          </Toggle>
          
          <Toggle
            pressed={canvasState.tool === 'brush'}
            onPressedChange={() => setCurrentTool('brush')}
            className="data-[state=on]:bg-foreground data-[state=on]:text-background h-9 border border-border hover:bg-accent text-xs justify-start"
          >
            <Brush className="w-4 h-4 mr-1" />
            Brush
          </Toggle>

          <Toggle
            pressed={canvasState.tool === 'pencil'}
            onPressedChange={() => setCurrentTool('pencil')}
            className="data-[state=on]:bg-foreground data-[state=on]:text-background h-9 border border-border hover:bg-accent text-xs justify-start"
          >
            <PenTool className="w-4 h-4 mr-1" />
            Pencil
          </Toggle>

          <Toggle
            pressed={canvasState.tool === 'eraser'}
            onPressedChange={() => setCurrentTool('eraser')}
            className="data-[state=on]:bg-foreground data-[state=on]:text-background h-9 border border-border hover:bg-accent text-xs justify-start"
          >
            <Eraser className="w-4 h-4 mr-1" />
            Eraser
          </Toggle>
        </div>
      </div>

      <Separator className="bg-border flex-shrink-0" />

      {/* Tool Settings */}
      {(canvasState.tool === 'brush' || canvasState.tool === 'pencil' || canvasState.tool === 'eraser') && (
        <>
          <div className="flex-shrink-0">
            <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Tool Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Size: {canvasState.brushSize}px
                </label>
                <Slider
                  value={[canvasState.brushSize]}
                  onValueChange={([value]) => updateCanvasState({ brushSize: value })}
                  max={canvasState.tool === 'pencil' ? 20 : 100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {canvasState.tool !== 'eraser' && (
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Opacity: {Math.round(canvasState.brushOpacity * 100)}%
                  </label>
                  <Slider
                    value={[canvasState.brushOpacity * 100]}
                    onValueChange={([value]) => updateCanvasState({ brushOpacity: value / 100 })}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border flex-shrink-0" />
        </>
      )}

      {/* Colors - Scrollable */}
      {(canvasState.tool === 'brush' || canvasState.tool === 'pencil') && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Colors</h3>
            
            {/* Current Color */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-border flex-shrink-0"
                  style={{ backgroundColor: canvasState.brushColor }}
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {canvasState.brushColor.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Primary Colors */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block">Primary</label>
              <div className="grid grid-cols-5 gap-1">
                {primaryColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCanvasState({ brushColor: color })}
                    className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                      canvasState.brushColor === color ? 'ring-2 ring-foreground ring-offset-1' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Grey Scale */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block">Greyscale</label>
              <div className="grid grid-cols-5 gap-1">
                {greyScale.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCanvasState({ brushColor: color })}
                    className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                      canvasState.brushColor === color ? 'ring-2 ring-foreground ring-offset-1' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Warm Colors */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block">Warm</label>
              <div className="grid grid-cols-5 gap-1">
                {warmColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCanvasState({ brushColor: color })}
                    className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                      canvasState.brushColor === color ? 'ring-2 ring-foreground ring-offset-1' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Cool Colors */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block">Cool</label>
              <div className="grid grid-cols-5 gap-1">
                {coolColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCanvasState({ brushColor: color })}
                    className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                      canvasState.brushColor === color ? 'ring-2 ring-foreground ring-offset-1' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-border flex-shrink-0" />
        </>
      )}

      {/* Bottom Fixed Controls */}
      <div className="flex-shrink-0 space-y-4">
        {/* Zoom Controls */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Zoom</h3>
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.1, canvasState.zoom - 0.1))}
              className="bg-background border-border hover:bg-accent h-7 w-7 p-0"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            
            <span className="text-xs text-muted-foreground font-mono">
              {Math.round(canvasState.zoom * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(5, canvasState.zoom + 0.1))}
              className="bg-background border-border hover:bg-accent h-7 w-7 p-0"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(1)}
            className="w-full bg-background border-border hover:bg-accent h-7 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        <Separator className="bg-border" />

        {/* Shapes */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Shapes</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => onAddShape('rectangle')}
              variant="outline"
              className="h-8 w-8 p-0 border-border hover:bg-accent"
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => onAddShape('circle')}
              variant="outline"
              className="h-8 w-8 p-0 border-border hover:bg-accent"
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => onAddShape('triangle')}
              variant="outline"
              className="h-8 w-8 p-0 border-border hover:bg-accent"
              title="Triangle"
            >
              <Triangle className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => onAddShape('diamond')}
              variant="outline"
              className="h-8 w-8 p-0 border-border hover:bg-accent"
              title="Diamond"
            >
              <Diamond className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => onAddShape('star')}
              variant="outline"
              className="h-8 w-8 p-0 border-border hover:bg-accent"
              title="Star"
            >
              <Star className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Actions */}
        <Button
          onClick={onClearCanvas}
          variant="destructive"
          className="w-full bg-destructive hover:bg-destructive/80 h-9"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ToolsSidebar;
