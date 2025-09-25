import React from 'react';
import { useAppStore } from '@/store/app';

interface SidebarProps {
  side: 'left' | 'right';
}

const Sidebar: React.FC<SidebarProps> = ({ side }) => {
  const { 
    panels, 
    togglePanel, 
    canvas, 
    updateCanvasState 
  } = useAppStore();

  if (side === 'left') {
    return (
      <div className={`w-64 bg-card border-r border-border flex-shrink-0 ${panels.tools ? 'block' : 'hidden'}`}>
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Tools</h3>
          
          <div className="grid grid-cols-2 gap-2">
            {['Select', 'Brush', 'Eraser', 'Text', 'Rectangle', 'Circle', 'Line', 'Eyedropper'].map((tool) => (
              <button
                key={tool}
                className="p-3 rounded border border-border hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
              >
                {tool}
              </button>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Brush Settings</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Size</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Layers Panel */}
        {panels.layers && (
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Layers</h3>
              <button
                onClick={() => togglePanel('layers')}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="p-2 bg-accent rounded border">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Background</span>
                </div>
              </div>
              <div className="p-2 border border-border rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Layer 1</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Properties Panel */}
        {panels.properties && (
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Properties</h3>
              <button
                onClick={() => togglePanel('properties')}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Brightness</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Contrast</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Saturation</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* History Panel */}
        {panels.history && (
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">History</h3>
              <button
                onClick={() => togglePanel('history')}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-1 text-sm scrollbar-thin max-h-32 overflow-y-auto">
              <div className="p-1 hover:bg-accent rounded cursor-pointer">New Project</div>
              <div className="p-1 hover:bg-accent rounded cursor-pointer">Import Image</div>
              <div className="p-1 hover:bg-accent rounded cursor-pointer">Apply Filter</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;