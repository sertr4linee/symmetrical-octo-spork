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
  RotateCcw
} from 'lucide-react';

interface ToolsSidebarProps {
  onAddShape: (type: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star') => void;
  onClearCanvas: () => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ onAddShape, onClearCanvas }) => {
  const { 
    canvas: canvasState, 
    setCurrentTool,
    setZoom,
    updateCanvasState
  } = useAppStore();

  return (
    <div className="w-full h-full bg-background p-6 space-y-8 text-foreground overflow-y-auto">
      {/* Tools Section */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Tools</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              pressed={canvasState.tool === 'select'}
              onPressedChange={() => setCurrentTool('select')}
              className="data-[state=on]:bg-foreground data-[state=on]:text-background h-11 border border-border hover:bg-accent transition-all duration-200"
            >
              <MousePointer2 className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Select</span>
            </Toggle>
            
            <Toggle
              pressed={canvasState.tool === 'brush'}
              onPressedChange={() => setCurrentTool('brush')}
              className="data-[state=on]:bg-foreground data-[state=on]:text-background h-11 border border-border hover:bg-accent transition-all duration-200"
            >
              <Brush className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Brush</span>
            </Toggle>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Brush Settings */}
      {canvasState.tool === 'brush' && (
        <>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Brush Settings</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">
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
            </div>
          </div>
          <Separator className="bg-border" />
        </>
      )}

      {/* Zoom Controls */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Zoom</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.1, canvasState.zoom - 0.1))}
              className="bg-background border-border hover:bg-accent flex-1 h-10 transition-all duration-200"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Badge variant="secondary" className="bg-background border border-border text-foreground px-3 py-1">
              {Math.round(canvasState.zoom * 100)}%
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(5, canvasState.zoom + 0.1))}
              className="bg-background border-border hover:bg-accent flex-1 h-10 transition-all duration-200"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(1)}
            className="w-full bg-background border-border hover:bg-accent h-10 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span className="font-medium">Reset (100%)</span>
          </Button>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Quick Shapes */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Quick Shapes</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onAddShape('rectangle')}
              variant="outline"
              className="bg-background border border-border hover:bg-accent h-11 transition-all duration-200"
            >
              <Square className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Rectangle</span>
            </Button>
            
            <Button
              onClick={() => onAddShape('circle')}
              variant="outline"
              className="bg-background border border-border hover:bg-accent h-11 transition-all duration-200"
            >
              <Circle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Circle</span>
            </Button>
            
            <Button
              onClick={() => onAddShape('triangle')}
              variant="outline"
              className="bg-background border border-border hover:bg-accent h-11 transition-all duration-200"
            >
              <Triangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Triangle</span>
            </Button>
            
            <Button
              onClick={() => onAddShape('diamond')}
              variant="outline"
              className="bg-background border border-border hover:bg-accent h-11 transition-all duration-200"
            >
              <Diamond className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Diamond</span>
            </Button>
            
            <Button
              onClick={() => onAddShape('star')}
              variant="outline"
              className="bg-background border border-border hover:bg-accent h-11 col-span-2 transition-all duration-200"
            >
              <Star className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Star</span>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Canvas Actions */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Canvas Actions</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <Button
            onClick={onClearCanvas}
            variant="destructive"
            className="w-full h-11 bg-destructive hover:bg-destructive/80 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Clear All Objects</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolsSidebar;