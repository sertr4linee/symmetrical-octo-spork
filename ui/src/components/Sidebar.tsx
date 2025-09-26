import React, { useState } from 'react';import React, { useState } from 'react';import React, { useState } from 'react';

import { useAppStore } from '@/store/app';

import FileExplorer from './FileExplorer';import { useAppStore } from '@/store/app';import { useAppStore } from '@/store/app';

import LayerPanel from './LayerPanel';

import PropertiesPanel from './PropertiesPanel';import FileExplorer from './FileExplorer';import FileExplorer from './FileExplorer';



interface SidebarProps {import LayerPanel from './LayerPanel';import LayerPanel from './LayerPanel';

  side: 'left' | 'right';

}import PropertiesPanel from './PropertiesPanel';import PropertiesPanel from './PropertiesPanel';



const Sidebar: React.FC<SidebarProps> = ({ side }) => {

  const { panels } = useAppStore();

  const [leftTab, setLeftTab] = useState<'tools' | 'files'>('tools');interface SidebarProps {interface SidebarProps {



  if (side === 'left') {  side: 'left' | 'right';  side: 'left' | 'right';

    return (

      <div className="w-full h-full flex flex-col">}}

        {/* Tab Headers */}

        <div className="flex border-b border-border">

          <button

            onClick={() => setLeftTab('tools')}const Sidebar: React.FC<SidebarProps> = ({ side }) => {const Sidebar: React.FC<SidebarProps> = ({ side }) => {

            className={`flex-1 px-4 py-2 text-sm font-medium ${

              leftTab === 'tools'   const { panels } = useAppStore();  const { 

                ? 'text-foreground border-b-2 border-primary' 

                : 'text-muted-foreground hover:text-foreground'  const [leftTab, setLeftTab] = useState<'tools' | 'files'>('tools');    panels, 

            }`}

          >    togglePanel, 

            Tools

          </button>  if (side === 'left') {    canvas, 

          <button

            onClick={() => setLeftTab('files')}    return (    updateCanvasState 

            className={`flex-1 px-4 py-2 text-sm font-medium ${

              leftTab === 'files'       <div className="w-full h-full flex flex-col">  } = useAppStore();

                ? 'text-foreground border-b-2 border-primary' 

                : 'text-muted-foreground hover:text-foreground'        {/* Tab Headers */}  

            }`}

          >        <div className="flex border-b border-border">  const [leftTab, setLeftTab] = useState<'tools' | 'files'>('tools');

            Files

          </button>          <button

        </div>

            onClick={() => setLeftTab('tools')}  if (side === 'left') {

        {/* Tab Content */}

        <div className="flex-1 overflow-hidden">            className={`flex-1 px-4 py-2 text-sm font-medium ${    return (

          {leftTab === 'tools' ? (

            <PropertiesPanel />              leftTab === 'tools'       <div className="w-full h-full flex flex-col">

          ) : (

            <FileExplorer className="flex-1" />                ? 'text-foreground border-b-2 border-primary'         {/* Tab Headers */}

          )}

        </div>                : 'text-muted-foreground hover:text-foreground'        <div className="flex border-b border-border">

      </div>

    );            }`}          <button

  }

          >            onClick={() => setLeftTab('tools')}

  // Right side - Layers Panel

  return (            Tools            className={`flex-1 px-4 py-2 text-sm font-medium ${

    <div className="w-full h-full">

      {panels.layers && <LayerPanel />}          </button>              leftTab === 'tools' 

    </div>

  );          <button                ? 'text-foreground border-b-2 border-primary' 

};

            onClick={() => setLeftTab('files')}                : 'text-muted-foreground hover:text-foreground'

export default Sidebar;
            className={`flex-1 px-4 py-2 text-sm font-medium ${            }`}

              leftTab === 'files'           >

                ? 'text-foreground border-b-2 border-primary'             Tools

                : 'text-muted-foreground hover:text-foreground'          </button>

            }`}          <button

          >            onClick={() => setLeftTab('files')}

            Files            className={`flex-1 px-4 py-2 text-sm font-medium ${

          </button>              leftTab === 'files' 

        </div>                ? 'text-foreground border-b-2 border-primary' 

                : 'text-muted-foreground hover:text-foreground'

        {/* Tab Content */}            }`}

        <div className="flex-1 overflow-hidden">          >

          {leftTab === 'tools' ? (            Files

            <PropertiesPanel />          </button>

          ) : (        </div>

            <FileExplorer className="flex-1" />

          )}        {/* Tab Content */}

        </div>        <div className="flex-1 overflow-hidden">

      </div>          {leftTab === 'tools' ? (

    );            <PropertiesPanel />

  }          ) : (

            <div className="p-4">

  // Right side - Layers Panel              <h3 className="text-sm font-medium text-muted-foreground mb-3">Tools</h3>

  return (            

    <div className="w-full h-full">              <div className="grid grid-cols-2 gap-2">

      {panels.layers && <LayerPanel />}                {['select', 'brush', 'eraser', 'text', 'rectangle', 'circle', 'line', 'eyedropper'].map((tool) => (

    </div>                  <button

  );                    key={tool}

};                    onClick={() => updateCanvasState({ tool })}

                    className={`p-3 rounded border border-border hover:bg-accent hover:text-accent-foreground text-sm transition-colors capitalize ${

export default Sidebar;                      canvas.tool === tool ? 'bg-primary text-primary-foreground' : ''
                    }`}
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
                      value={canvas.brushSize}
                      onChange={(e) => updateCanvasState({ brushSize: Number(e.target.value) })}
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-center mt-1">{canvas.brushSize}px</div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={canvas.brushOpacity * 100}
                      onChange={(e) => updateCanvasState({ brushOpacity: Number(e.target.value) / 100 })}
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-center mt-1">{Math.round(canvas.brushOpacity * 100)}%</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <FileExplorer className="flex-1" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Layers Panel */}
      {panels.layers && (
        <LayerPanel />
      )}
        
        </div>
  );
        
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