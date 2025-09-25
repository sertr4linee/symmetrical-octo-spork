import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Project, CanvasState, PanelState, HistoryEntry } from '@/types';

interface AppState {
  // Current project
  currentProject: Project | null;
  projects: Project[];
  
  // Canvas state
  canvas: CanvasState;
  
  // UI state
  panels: PanelState;
  isLoading: boolean;
  error: string | null;
  
  // History
  history: HistoryEntry[];
  historyIndex: number;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  updateCanvasState: (updates: Partial<CanvasState>) => void;
  togglePanel: (panel: keyof PanelState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      
      canvas: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        rotation: 0,
        tool: 'select',
        brushSize: 10,
        brushOpacity: 1,
      },
      
      panels: {
        tools: true,
        layers: true,
        properties: true,
        history: false,
      },
      
      isLoading: false,
      error: null,
      
      history: [],
      historyIndex: -1,
      
      // Actions
      setCurrentProject: (project) => set({ currentProject: project }),
      
      setProjects: (projects) => set({ projects }),
      
      updateCanvasState: (updates) =>
        set((state) => ({
          canvas: { ...state.canvas, ...updates },
        })),
      
      togglePanel: (panel) =>
        set((state) => ({
          panels: { ...state.panels, [panel]: !state.panels[panel] },
        })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      addHistoryEntry: (entry) =>
        set((state) => {
          const newEntry: HistoryEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          };
          
          // Remove any entries after current index (when undoing and then doing new action)
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newEntry);
          
          // Limit history size
          const maxHistory = 50;
          if (newHistory.length > maxHistory) {
            newHistory.shift();
          }
          
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }),
      
      undo: () =>
        set((state) => {
          if (state.historyIndex > 0) {
            return { historyIndex: state.historyIndex - 1 };
          }
          return state;
        }),
      
      redo: () =>
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            return { historyIndex: state.historyIndex + 1 };
          }
          return state;
        }),
      
      resetHistory: () => set({ history: [], historyIndex: -1 }),
    }),
    {
      name: 'bettergimp-store',
    }
  )
);