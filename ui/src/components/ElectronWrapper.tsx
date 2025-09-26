import React, { useEffect, useState } from 'react';
import { isElectronAPIReady } from '@/utils';
import LoadingScreen from './LoadingScreen';

interface ElectronWrapperProps {
  children: React.ReactNode;
}

const ElectronWrapper: React.FC<ElectronWrapperProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  // Always call useEffect hooks in the same order
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mounted) return;
      
      if (typeof window !== 'undefined') {
        const inElectron = window.electronAPI !== undefined;
        setIsElectron(inElectron);
        
        if (inElectron) {
          // Wait for Electron APIs to be ready
          const checkReady = () => {
            if (!mounted) return;
            
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
      } else {
        // Fallback for SSR or other edge cases
        setIsReady(true);
      }
    };

    initializeApp();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Always call this useEffect, regardless of state
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('electron-mode', isElectron);
      document.body.classList.toggle('browser-mode', !isElectron);
    }
  }, [isElectron]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default ElectronWrapper;