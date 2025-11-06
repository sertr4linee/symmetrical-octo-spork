import { create } from 'zustand';

export interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star' | 'polygon' | 'brush' | 'pencil' | 'eraser' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  sides?: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  points?: { x: number; y: number }[];
  imageId?: string;
  imageData?: string;
}

interface CanvasObjectsState {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  objectHistory: CanvasObject[][];
  historyIndex: number;
  
  // Actions
  addObject: (object: CanvasObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  setSelectedObject: (id: string | null) => void;
  clearObjects: () => void;
  restoreObjects: (objects: CanvasObject[]) => void;
  saveSnapshot: () => void;
  undo: () => boolean;
  redo: () => boolean;
}

export const useCanvasObjects = create<CanvasObjectsState>((set, get) => ({
  objects: [],
  selectedObjectId: null,
  objectHistory: [[]],
  historyIndex: 0,
  
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
    set({ objects: [], selectedObjectId: null }),
    
  restoreObjects: (objects: CanvasObject[]) =>
    set({ objects, selectedObjectId: null }),
    
  saveSnapshot: () =>
    set((state) => {
      const newSnapshot = [...state.objects];
      const newHistory = state.objectHistory.slice(0, state.historyIndex + 1);
      newHistory.push(newSnapshot);
      
      // Limiter l'historique à 50 entrées
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return {
        objectHistory: newHistory,
        historyIndex: newHistory.length - 1
      };
    }),
    
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const previousObjects = state.objectHistory[newIndex];
      
      set({
        objects: [...previousObjects],
        historyIndex: newIndex,
        selectedObjectId: null
      });
      
      // Déclencher le redraw du canvas
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('canvasRedraw'));
      }, 0);
      
      return true;
    }
    return false;
  },
    
  redo: () => {
    const state = get();
    if (state.historyIndex < state.objectHistory.length - 1) {
      const newIndex = state.historyIndex + 1;
      const nextObjects = state.objectHistory[newIndex];
      
      set({
        objects: [...nextObjects],
        historyIndex: newIndex,
        selectedObjectId: null
      });
      
      // Déclencher le redraw du canvas
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('canvasRedraw'));
      }, 0);
      
      return true;
    }
    return false;
  }
}));