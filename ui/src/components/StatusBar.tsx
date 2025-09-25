import React from 'react';
import { useAppStore } from '@/store/app';
import { getAppInfo } from '@/utils';

const StatusBar: React.FC = () => {
  const { canvas, currentProject } = useAppStore();
  const appInfo = getAppInfo();

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
          {appInfo.name} v{appInfo.version}
        </span>
        
        <span>
          Ready
        </span>
      </div>
    </div>
  );
};

export default StatusBar;