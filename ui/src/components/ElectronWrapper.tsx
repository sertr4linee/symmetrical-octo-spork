import React, { useEffect, useState } from 'react';
import { isElectronAPIReady } from '@/utils';
import LoadingScreen from './LoadingScreen';

interface ElectronWrapperProps {
  children: React.ReactNode;
}

const ElectronWrapper: React.FC<ElectronWrapperProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're in Electron
    const checkElectron = () => {
      if (typeof window !== 'undefined') {
        const inElectron = window.electronAPI !== undefined;
        setIsElectron(inElectron);
        
        if (inElectron) {
          // Wait for Electron APIs to be ready
          const checkReady = () => {
            if (isElectronAPIReady()) {
              setIsReady(true);
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        } else {
          // We're in browser mode (development)
          setIsReady(true);
        }
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(checkElectron, 100);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  // Add a class to indicate if we're in Electron or browser
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('electron-mode', isElectron);
      document.body.classList.toggle('browser-mode', !isElectron);
    }
  }, [isElectron]);

  return <>{children}</>;
};

export default ElectronWrapper;