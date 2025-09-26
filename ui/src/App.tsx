import React from 'react';
import { useMenuActions } from '@/hooks/useMenuActions';
import { useAppStore } from '@/store/app';
import Canvas from '@/components/Canvas';
import Sidebar from '@/components/Sidebar';
import ToolsSidebar from '@/components/ToolsSidebar';
import CanvasToolbar from '@/components/CanvasToolbar';
import ProjectManager from '@/components/ProjectManager';
import StatusBar from '@/components/StatusBar';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import ElectronWrapper from '@/components/ElectronWrapper';
import ResizablePanel from '@/components/ResizablePanel';

const AppContent: React.FC = () => {
  useMenuActions();
  
  const { isLoading, error, panels, createShape, clearCanvas } = useAppStore();
  const [isProjectManagerOpen, setIsProjectManagerOpen] = React.useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="dark h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {error && <ErrorMessage message={error} />}
      
      <div className="h-10 border-b border-border bg-background flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium">Better GIMP</span>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span 
              className="hover:text-foreground cursor-pointer"
              onClick={() => setIsProjectManagerOpen(true)}
            >
              Open Project
            </span>
            <span className="hover:text-foreground cursor-pointer">Edit</span>
            <span className="hover:text-foreground cursor-pointer">View</span>
            <span className="hover:text-foreground cursor-pointer">Image</span>
            <span className="hover:text-foreground cursor-pointer">Layer</span>
            <span className="hover:text-foreground cursor-pointer">Filters</span>
            <span className="hover:text-foreground cursor-pointer">Help</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {panels.tools && (
          <div className="w-48 flex-shrink-0 border-r border-border">
            <ToolsSidebar 
              onAddShape={createShape}
              onClearCanvas={clearCanvas}
              onOpenProjectManager={() => setIsProjectManagerOpen(true)}
            />
          </div>
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <CanvasToolbar />
          <Canvas />
        </div>
        
        <ResizablePanel 
          side="right" 
          isVisible={panels.layers || panels.properties}
          defaultWidth={240}
          minWidth={200}
          maxWidth={350}
        >
          <Sidebar side="right" />
        </ResizablePanel>
      </div>
      
      <StatusBar />
      
      {/* Project Manager Modal */}
      <ProjectManager 
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
      />
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
