import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app';
import { useAutoSave } from '@/hooks/useAutoSave';
import { getAppInfo } from '@/utils';
import { Save } from 'lucide-react';

const StatusBar: React.FC = () => {
  const { canvas, currentProject } = useAppStore();
  const { canSave, saveProjectManual } = useAutoSave();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const appInfo = getAppInfo();

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!canSave) return;

    const autoSaveInterval = setInterval(async () => {
      setIsSaving(true);
      try {
        await saveProjectManual();
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [canSave, saveProjectManual]);

  const handleManualSave = async () => {
    if (!canSave) return;
    
    setIsSaving(true);
    try {
      await saveProjectManual();
      setLastSaved(new Date());
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

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
        {currentProject && canSave && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
              title="Save project (Ctrl+S)"
            >
              {isSaving ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              <span className="font-mono text-xs">
                {isSaving ? 'Saving...' : `Saved ${formatLastSaved(lastSaved)}`}
              </span>
            </button>
          </div>
        )}
        
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