import React from 'react';
import { useMenuActions } from '@/hooks/useMenuActions';
import { useAppStore } from '@/store/app';
import Canvas from '@/components/Canvas';
import Sidebar from '@/components/Sidebar';
import StatusBar from '@/components/StatusBar';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import ElectronWrapper from '@/components/ElectronWrapper';

const AppContent: React.FC = () => {
  useMenuActions();
  
  const { isLoading, error } = useAppStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {error && <ErrorMessage message={error} />}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <Sidebar side="left" />
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />
        </div>
        
        {/* Right Sidebar - Layers, Properties */}
        <Sidebar side="right" />
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