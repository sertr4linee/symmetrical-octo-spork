import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { useAppStore } from '@/store/app';
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
        <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
            <Toggle
              pressed={canvasState.tool === 'select'}
              onPressedChange={() => setCurrentTool('select')}
              className="w-full justify-start h-11 px-4 data-[state=on]:bg-foreground data-[state=on]:text-background border border-border hover:bg-accent transition-all duration-200"
            >
              <MousePointer2 className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="font-medium">Select</span>
            </Toggle>
            
            <Toggle
              pressed={canvasState.tool === 'brush'}
              onPressedChange={() => setCurrentTool('brush')}
              className="w-full justify-start h-11 px-4 data-[state=on]:bg-foreground data-[state=on]:text-background border border-border hover:bg-accent transition-all duration-200"
            >
              <Brush className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="font-medium">Brush</span>
            </Toggle>
        </div>
      </div>

        {canvasState.tool === 'brush' && (
          <>
            <div className="pt-6 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Brush Settings</h3>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Size
                    </label>
                    <span className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded border border-border">
                      {canvasState.brushSize}px
                    </span>
                  </div>
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
          </>
        )}

        {/* Zoom Controls */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Zoom</h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.1, canvasState.zoom - 0.1))}
                className="flex-1 h-9 bg-background border-border hover:bg-accent transition-all duration-200"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <div className="flex-1 text-center">
                <Badge variant="secondary" className="bg-background text-foreground border border-border px-3 py-1 font-mono text-xs">
                  {Math.round(canvasState.zoom * 100)}%
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(5, canvasState.zoom + 0.1))}
                className="flex-1 h-9 bg-background border-border hover:bg-accent transition-all duration-200"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(1)}
              className="w-full h-9 bg-background border-border hover:bg-accent transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="font-medium">Reset (100%)</span>
            </Button>
          </div>
        </div>

        {/* Quick Shapes */}
        <div className="pt-6 border-t border-border">
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

        {/* Canvas Actions */}
        <div className="pt-6 border-t border-border">
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
    </div>
  );
};

export default ToolsSidebar;