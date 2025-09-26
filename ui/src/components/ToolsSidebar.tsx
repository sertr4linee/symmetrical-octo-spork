import React from 'react';
import { useAppStore } from '@/store/app';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer2,
  Brush, 
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
  onOpenProjectManager: () => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ onAddShape, onClearCanvas, onOpenProjectManager }) => {
  const { 
    canvas: canvasState, 
    setCurrentTool,
    setZoom,
    updateCanvasState
  } = useAppStore();

  return (
    <div className="w-full h-full bg-background p-4 space-y-4 text-foreground overflow-hidden flex flex-col">
      
      {/* Project Section */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Project</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={onOpenProjectManager}
          className="w-full justify-start h-8 text-xs"
        >
          <Plus className="w-3 h-3 mr-2" />
          New Project
        </Button>
      </div>

      <Separator className="bg-border" />

      {/* Tools Section */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <Toggle
            pressed={canvasState.tool === 'select'}
            onPressedChange={() => setCurrentTool('select')}
            className="data-[state=on]:bg-foreground data-[state=on]:text-background h-8 border border-border hover:bg-accent text-xs justify-start"
          >
            <MousePointer2 className="w-3 h-3 mr-1" />
            Select
          </Toggle>
          
          <Toggle
            pressed={canvasState.tool === 'brush'}
            onPressedChange={() => setCurrentTool('brush')}
            className="data-[state=on]:bg-foreground data-[state=on]:text-background h-8 border border-border hover:bg-accent text-xs justify-start"
          >
            <Brush className="w-3 h-3 mr-1" />
            Brush
          </Toggle>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Brush Settings */}
      {canvasState.tool === 'brush' && (
        <>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Brush Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Size: {canvasState.brushSize}px
                </label>
                <Slider
                  value={[canvasState.brushSize]}
                  onValueChange={(value) => updateCanvasState({ brushSize: value[0] })}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
                    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateCanvasState({ brushColor: color })}
                      className={`w-6 h-6 rounded border-2 ${
                        canvasState.brushColor === color 
                          ? 'border-foreground' 
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={canvasState.brushColor}
                  onChange={(e) => updateCanvasState({ brushColor: e.target.value })}
                  className="w-full h-8 rounded border border-border bg-background"
                />
              </div>
            </div>
          </div>
          <Separator className="bg-border" />
        </>
      )}

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
          
          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs px-2 py-1">
            {Math.round(canvasState.zoom * 100)}%
          </Badge>
          
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
          <RotateCcw className="w-3 h-3 mr-2" />
          Reset
        </Button>
      </div>

      <Separator className="bg-border" />

      {/* Quick Shapes */}
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

      {/* Canvas Actions */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Canvas Actions</h3>
        <Button
          onClick={onClearCanvas}
          variant="destructive"
          className="w-full bg-destructive hover:bg-destructive/80 h-8 text-xs"
        >
          <Trash2 className="w-3 h-3 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ToolsSidebar;