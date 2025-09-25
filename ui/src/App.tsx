import React from 'react';
import { useMenuActions } from '@/hooks/useMenuActions';
import { useAppStore } from '@/store/app';
import Canvas from '@/components/Canvas';
import Sidebar from '@/components/Sidebar';
import StatusBar from '@/components/StatusBar';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import ElectronWrapper from '@/components/ElectronWrapper';
import ResizablePanel from '@/components/ResizablePanel';

const AppContent: React.FC = () => {
  useMenuActions();
  
  const { isLoading, error, panels } = useAppStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {error && <ErrorMessage message={error} />}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <ResizablePanel 
          side="left" 
          isVisible={panels.tools}
          defaultWidth={264}
          minWidth={200}
          maxWidth={400}
        >
          <Sidebar side="left" />
        </ResizablePanel>
        
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