import React, { useState } from 'react';
import { useAppStore } from '@/store/app';
import { BrushType } from '@/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, Circle, Pen, Droplet, Stamp, Brush, Sparkles } from 'lucide-react';

const brushIcons: Record<BrushType, React.ReactNode> = {
  [BrushType.ROUND]: <Circle className="w-4 h-4" />,
  [BrushType.SOFT_ROUND]: <Circle className="w-4 h-4 opacity-60" />,
  [BrushType.HARD_ROUND]: <Circle className="w-4 h-4" strokeWidth={3} />,
  [BrushType.CALLIGRAPHY]: <Pen className="w-4 h-4" />,
  [BrushType.FLAT]: <div className="w-4 h-1 bg-current rounded" />,
  [BrushType.SPRAY]: <Sparkles className="w-4 h-4" />,
  [BrushType.STAMP]: <Stamp className="w-4 h-4" />,
  [BrushType.PENCIL]: <Pen className="w-4 h-4" strokeWidth={1} />,
  [BrushType.MARKER]: <Brush className="w-4 h-4" />,
  [BrushType.WATERCOLOR]: <Droplet className="w-4 h-4" />,
};

const brushNames: Record<BrushType, string> = {
  [BrushType.ROUND]: 'Round',
  [BrushType.SOFT_ROUND]: 'Soft Round',
  [BrushType.HARD_ROUND]: 'Hard Round',
  [BrushType.CALLIGRAPHY]: 'Calligraphy',
  [BrushType.FLAT]: 'Flat',
  [BrushType.SPRAY]: 'Spray',
  [BrushType.STAMP]: 'Stamp',
  [BrushType.PENCIL]: 'Pencil',
  [BrushType.MARKER]: 'Marker',
  [BrushType.WATERCOLOR]: 'Watercolor',
};

interface BrushSelectorProps {
  compact?: boolean;
}

const BrushSelector: React.FC<BrushSelectorProps> = ({ compact = false }) => {
  const { canvas, updateCanvasState } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentBrushType = canvas.brushType || BrushType.ROUND;
  const brushHardness = canvas.brushHardness ?? 0.5;
  const brushSpacing = canvas.brushSpacing ?? 0.25;
  const brushAngle = canvas.brushAngle ?? 0;

  const handleBrushTypeChange = (type: BrushType) => {
    updateCanvasState({ brushType: type });
    setIsOpen(false);
  };

  const handleHardnessChange = (value: number[]) => {
    updateCanvasState({ brushHardness: value[0] });
  };

  const handleSpacingChange = (value: number[]) => {
    updateCanvasState({ brushSpacing: value[0] });
  };

  const handleAngleChange = (value: number[]) => {
    updateCanvasState({ brushAngle: value[0] });
  };

  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {brushIcons[currentBrushType]}
          <ChevronDown className="w-3 h-3" />
        </Button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50 p-2">
            <div className="text-xs font-medium mb-2 text-muted-foreground">Brush Type</div>
            <div className="space-y-1">
              {Object.values(BrushType).map((type) => (
                <button
                  key={type}
                  onClick={() => handleBrushTypeChange(type)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
                >
                  {brushIcons[type]}
                  <span>{brushNames[type]}</span>
                  {currentBrushType === type && (
                    <span className="ml-auto text-foreground">●</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-background/50">
      <div>
        <label className="text-sm font-medium mb-2 block">Brush Type</label>
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              {brushIcons[currentBrushType]}
              <span>{brushNames[currentBrushType]}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-lg shadow-lg z-50 p-2">
              <div className="text-xs font-medium mb-2 text-muted-foreground">Select Brush</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.values(BrushType).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleBrushTypeChange(type)}
                    className="flex flex-col items-center gap-1 py-3 rounded hover:bg-accent cursor-pointer"
                  >
                    <div className={`text-foreground ${currentBrushType === type ? 'scale-125' : ''} transition-transform`}>
                      {brushIcons[type]}
                    </div>
                    <span className="text-xs">{brushNames[type]}</span>
                    {currentBrushType === type && (
                      <div className="w-1 h-1 rounded-full bg-foreground mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hardness */}
      {(currentBrushType === BrushType.ROUND || 
        currentBrushType === BrushType.SOFT_ROUND ||
        currentBrushType === BrushType.MARKER) && (
        <div>
          <label className="text-sm font-medium mb-2 block flex justify-between">
            <span>Hardness</span>
            <span className="text-muted-foreground">{Math.round(brushHardness * 100)}%</span>
          </label>
          <Slider
            value={[brushHardness]}
            onValueChange={handleHardnessChange}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
      )}

      {/* Spacing */}
      <div>
        <label className="text-sm font-medium mb-2 block flex justify-between">
          <span>Spacing</span>
          <span className="text-muted-foreground">{Math.round(brushSpacing * 100)}%</span>
        </label>
        <Slider
          value={[brushSpacing]}
          onValueChange={handleSpacingChange}
          min={0.1}
          max={1}
          step={0.05}
          className="w-full"
        />
      </div>

      {/* Angle for Calligraphy and Flat brushes */}
      {(currentBrushType === BrushType.CALLIGRAPHY || 
        currentBrushType === BrushType.FLAT) && (
        <div>
          <label className="text-sm font-medium mb-2 block flex justify-between">
            <span>Angle</span>
            <span className="text-muted-foreground">{Math.round(brushAngle)}°</span>
          </label>
          <Slider
            value={[brushAngle]}
            onValueChange={handleAngleChange}
            min={0}
            max={360}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Brush Preview */}
      <div className="mt-4">
        <label className="text-sm font-medium mb-2 block">Preview</label>
        <div className="w-full h-20 border border-border rounded bg-background flex items-center justify-center">
          <div 
            className="rounded-full bg-foreground transition-all"
            style={{
              width: `${Math.min(canvas.brushSize, 60)}px`,
              height: `${Math.min(canvas.brushSize, 60)}px`,
              opacity: canvas.brushOpacity,
              filter: currentBrushType === BrushType.SOFT_ROUND ? 'blur(2px)' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BrushSelector;
