import React from 'react';
import { useAppStore } from '@/store/app';
import { useCanvasObjects } from '@/store/canvas';

const CanvasToolbar: React.FC = () => {
  const { currentProject, canvas } = useAppStore();
  const { objects } = useCanvasObjects();

  return (
    <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
      {/* Project Info */}
      <div className="flex items-center gap-4">
        {currentProject ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{currentProject.name}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-muted-foreground">
              {currentProject.width}×{currentProject.height}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No project loaded</span>
        )}
      </div>

      {/* Tool & Canvas Info */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Tool:</span>
          <span className="font-medium text-foreground capitalize">{canvas.tool}</span>
        </div>
        
        <div className="w-px h-4 bg-border"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Zoom:</span>
          <span className="font-medium text-foreground">{Math.round(canvas.zoom * 100)}%</span>
        </div>
        
        <div className="w-px h-4 bg-border"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Objects:</span>
          <span className="font-medium text-foreground">{objects.length}</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasToolbar;