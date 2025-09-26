import { create } from 'zustand';

export interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star' | 'polygon' | 'brush' | 'pencil' | 'eraser';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  sides?: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
}

interface CanvasObjectsState {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  
  // Actions
  addObject: (object: CanvasObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  setSelectedObject: (id: string | null) => void;
  clearObjects: () => void;
}

export const useCanvasObjects = create<CanvasObjectsState>((set) => ({
  objects: [],
  selectedObjectId: null,
  
  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object]
    })),
    
  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter(obj => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
    })),
    
  updateObject: (id, updates) =>
    set((state) => ({
      objects: state.objects.map(obj =>
        obj.id === id ? { ...obj, ...updates } : obj
      )
    })),
    
  setSelectedObject: (id) =>
    set({ selectedObjectId: id }),
    
  clearObjects: () =>
    set({ objects: [], selectedObjectId: null })
}));