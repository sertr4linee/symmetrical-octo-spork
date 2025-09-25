import { useEffect } from 'react';
import { useAppStore } from '@/store/app';

export const useElectronAPI = () => {
  const setError = useAppStore((state) => state.setError);

  const apiCall = async (endpoint: string, method = 'GET', data?: any) => {
    try {
      const result = await window.electronAPI.apiCall(endpoint, method, data);
      if (!result.success) {
        setError(result.error || 'API call failed');
      }
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return { success: false, error: 'API call failed', status: 500 };
    }
  };

  const readFile = async (filePath: string) => {
    try {
      return await window.electronAPI.readFile(filePath);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'File read failed');
      return { success: false, error: 'File read failed' };
    }
  };

  const writeFile = async (filePath: string, data: string) => {
    try {
      return await window.electronAPI.writeFile(filePath, data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'File write failed');
      return { success: false, error: 'File write failed' };
    }
  };

  return {
    apiCall,
    readFile,
    writeFile,
  };
};