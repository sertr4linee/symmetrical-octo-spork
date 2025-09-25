import React from 'react';
import { useAppStore } from '@/store/app';

const StatusBar: React.FC = () => {
  const { canvas, currentProject } = useAppStore();

  return (
    <div className="h-6 bg-muted border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center space-x-4">
        <span>
          Tool: {canvas.tool.charAt(0).toUpperCase() + canvas.tool.slice(1)}
        </span>
        
        {currentProject && (
          <span>
            Size: {currentProject.width}×{currentProject.height}px
          </span>
        )}
        
        <span>
          Zoom: {Math.round(canvas.zoom * 100)}%
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span>
          Better GIMP v{window.appInfo?.version || '0.1.0'}
        </span>
        
        <span>
          Ready
        </span>
      </div>
    </div>
  );
};

export default StatusBar;