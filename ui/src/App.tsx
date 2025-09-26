import React from 'react';
import { useMenuActions } from '@/hooks/useMenuActions';
import { useAppStore } from '@/store/app';
import Canvas from '@/components/Canvas';
import Sidebar from '@/components/Sidebar';
import ToolsSidebar from '@/components/ToolsSidebar';
import StatusBar from '@/components/StatusBar';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import ElectronWrapper from '@/components/ElectronWrapper';
import ResizablePanel from '@/components/ResizablePanel';

const AppContent: React.FC = () => {
  useMenuActions();
  
  const { isLoading, error, panels, createShape, clearCanvas, currentProject } = useAppStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="dark h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {error && <ErrorMessage message={error} />}
      
      {/* Fixed Header Menu */}
      <div className="h-12 border-b border-border bg-background flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium">Better GIMP</h1>
          <div className="h-4 w-px bg-border"></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Image</span>
            <span>Layer</span>
            <span>Filters</span>
            <span>Help</span>
          </div>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {currentProject?.name || 'No Project'}
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools - Fixed */}
        {panels.tools && (
          <div className="w-72 flex-shrink-0 border-r border-border">
            <ToolsSidebar 
              onAddShape={createShape}
              onClearCanvas={clearCanvas}
            />
          </div>
        )}
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />
        </div>
        
        {/* Right Sidebar - Layers, Properties */}
        <ResizablePanel 
          side="right" 
          isVisible={panels.layers || panels.properties}
          defaultWidth={300}
          minWidth={250}
          maxWidth={500}
        >
          <Sidebar side="right" />
        </ResizablePanel>
      </div>
      
      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ElectronWrapper>
      <AppContent />
    </ElectronWrapper>
  );
};

export default App;