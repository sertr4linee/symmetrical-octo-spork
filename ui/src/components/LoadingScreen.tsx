import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-foreground mb-2">Loading Better GIMP</h2>
        <p className="text-sm text-muted-foreground">Please wait while we initialize the application...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;