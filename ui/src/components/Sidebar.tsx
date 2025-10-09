import React, { useState } from 'react';
import { useAppStore } from '@/store/app';
import FileExplorer from './FileExplorer';
import LayerPanel from './LayerPanel';
import PropertiesPanel from './PropertiesPanel';

interface SidebarProps {
  side: 'left' | 'right';
}

const Sidebar: React.FC<SidebarProps> = ({ side }) => {
  const { panels } = useAppStore();
  const [leftTab, setLeftTab] = useState<'tools' | 'files'>('tools');

  if (side === 'left') {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex border-b border-border">
          <button
            onClick={() => setLeftTab('tools')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              leftTab === 'tools' 
                ? 'text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setLeftTab('files')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              leftTab === 'files' 
                ? 'text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Files
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {leftTab === 'tools' ? (
            <PropertiesPanel />
          ) : (
            <FileExplorer className="flex-1" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {panels.layers && <LayerPanel />}
    </div>
  );
};

export default Sidebar;
