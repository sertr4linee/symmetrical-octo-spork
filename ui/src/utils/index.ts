// Utility functions for the Better GIMP application

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

export const isElectronAPIReady = (): boolean => {
  return isElectron() && 
         typeof window.electronAPI.apiCall === 'function' &&
         typeof window.electronAPI.onMenuAction === 'function';
};

export const getAppInfo = () => {
  if (typeof window !== 'undefined' && window.appInfo) {
    return window.appInfo;
  }
  return {
    name: 'Better GIMP',
    version: '0.1.0',
    description: 'Modern and performant image editor'
  };
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};