// Electron API types
export interface ElectronAPI {
  apiCall: (endpoint: string, method?: string, data?: any) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
    status: number;
  }>;
  readFile: (filePath: string) => Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }>;
  writeFile: (filePath: string, data: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onMenuAction: (callback: (event: any, action: string) => void) => () => void;
  platform: string;
  versions: any;
}

export interface AppInfo {
  name: string;
  version: string;
  description: string;
}

// Extend Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    appInfo: AppInfo;
  }
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  color_mode: 'RGB' | 'CMYK' | 'Grayscale';
  resolution: number;
  created_at: string;
  updated_at: string;
  image_count: number;
  file_size: number;
  canvas_data?: string;
}

export interface ProjectCreate {
  name: string;
  description: string;
  width: number;
  height: number;
  color_mode: 'RGB' | 'CMYK' | 'Grayscale';
  resolution: number;
}

// Image types
export interface ImageInfo {
  id: string;
  project_id: string;
  name: string;
  width: number;
  height: number;
  format: string;
  size: number;
  created_at: string;
  updated_at: string;
}

// Canvas types
export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  tool: string;
  brushSize: number;
  brushOpacity: number;
}

// Filter types
export interface FilterParams {
  [key: string]: number | string | boolean;
}

export interface Filter {
  id: string;
  name: string;
  params: FilterParams;
  preview?: boolean;
}

// Adjustment types
export interface AdjustmentParams {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  gamma?: number;
  levels?: {
    inputMin: number;
    inputMax: number;
    outputMin: number;
    outputMax: number;
  };
  curves?: Array<{ x: number; y: number }>;
}

// History types
export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
  data: any;
}

// UI types
export interface PanelState {
  tools: boolean;
  layers: boolean;
  properties: boolean;
  history: boolean;
}

export interface Theme {
  name: string;
  colors: Record<string, string>;
}