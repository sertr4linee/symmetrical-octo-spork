import React from 'react';
import { useAppStore } from '@/store/app';
import { getAppInfo } from '@/utils';

const StatusBar: React.FC = () => {
  const { canvas, currentProject } = useAppStore();
  const appInfo = getAppInfo();

  return (
    <div className="h-8 bg-background border-t border-border flex items-center justify-between px-6 text-xs text-muted-foreground">
      <div className="flex items-center space-x-6">
        <span className="font-mono">
          Tool: <span className="text-foreground font-medium">{canvas.tool.charAt(0).toUpperCase() + canvas.tool.slice(1)}</span>
        </span>
        
        {currentProject && (
          <span className="font-mono">
            Size: <span className="text-foreground font-medium">{currentProject.width}×{currentProject.height}px</span>
          </span>
        )}
        
        <span className="font-mono">
          Zoom: <span className="text-foreground font-medium">{Math.round(canvas.zoom * 100)}%</span>
        </span>
      </div>
      
      <div className="flex items-center space-x-6">
        <span className="font-mono">
          {appInfo.name} <span className="text-foreground font-medium">v{appInfo.version}</span>
        </span>
        
        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-medium">
          Ready
        </span>
      </div>
    </div>
  );
};

export default StatusBar;