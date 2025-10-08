import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Project, CanvasState, PanelState, HistoryEntry, Layer } from '@/types';

interface AppState {
  // Current project
  currentProject: Project | null;
  projects: Project[];
  
  // Canvas state
  canvas: CanvasState;
  
  // Layers state
  layers: Layer[];
  activeLayerId: string | null;
  
  // UI state
  panels: PanelState;
  isLoading: boolean;
  error: string | null;
  hasLoadedProjects: boolean;
  
  // History
  history: HistoryEntry[];
  historyIndex: number;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  updateCanvasState: (updates: Partial<CanvasState>) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setCurrentTool: (tool: string) => void;
  setBrushColor: (color: string) => void;
  togglePanel: (panel: keyof PanelState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasLoadedProjects: (loaded: boolean) => void;
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
  
  // Layer actions
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setActiveLayer: (layerId: string) => void;
  moveLayer: (layerId: string, newIndex: number) => void;
  updateLayerOpacity: (layerId: string, opacity: number) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  
  // Canvas actions for sidebar
  createShape: (shapeType: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star' | 'polygon') => void;
  clearCanvas: () => void;
  clearShapeLayers: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state with default project
      currentProject: {
        id: 'default',
        name: 'Untitled Project',
        description: 'A new project',
        width: 800,
        height: 600,
        color_mode: 'RGB' as const,
        resolution: 72,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_count: 0,
        file_size: 0
      },
      projects: [
        {
          id: 'default',
          name: 'Untitled Project',
          description: 'A new project',
          width: 800,
          height: 600,
          color_mode: 'RGB' as const,
          resolution: 72,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          image_count: 0,
          file_size: 0
        },
        {
          id: 'sample1',
          name: 'Logo Design',
          description: 'Company logo redesign project',
          width: 1200,
          height: 800,
          color_mode: 'RGB' as const,
          resolution: 300,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          image_count: 3,
          file_size: 2450000
        }
      ],
      
      canvas: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        rotation: 0,
        tool: 'select',
        brushSize: 10,
        brushOpacity: 1,
        brushColor: '#000000',
        brushType: 'round' as any, // BrushType.ROUND
        brushHardness: 0.5,
        brushSpacing: 0.25,
        brushAngle: 0,
      },
      
      // Initialize with a background layer
      layers: [
        {
          id: 'background',
          name: 'Background',
          visible: true,
          opacity: 100,
          type: 'background',
        }
      ],
      activeLayerId: 'background',
      
      panels: {
        tools: true,
        layers: true,
        properties: true,
        history: false,
      },
      
      isLoading: false,
      error: null,
      hasLoadedProjects: false,
      
      history: [],
      historyIndex: -1,
      
      // Actions
      setCurrentProject: (project) => set({ currentProject: project }),
      
      setProjects: (projects) => set({ projects }),
      
      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project]
        })),
      
      removeProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProject: state.currentProject?.id === projectId ? null : state.currentProject
        })),
      
      updateCanvasState: (updates) =>
        set((state) => ({
          canvas: { ...state.canvas, ...updates },
        })),

      // Canvas-specific actions
      setZoom: (zoom: number) =>
        set((state) => ({
          canvas: { ...state.canvas, zoom },
        })),

      setPan: (pan: { x: number; y: number }) =>
        set((state) => ({
          canvas: { ...state.canvas, pan },
        })),

      setCurrentTool: (tool: string) =>
        set((state) => ({
          canvas: { ...state.canvas, tool },
        })),

      setBrushColor: (color: string) =>
        set((state) => ({
          canvas: { ...state.canvas, brushColor: color },
        })),
      
      togglePanel: (panel) =>
        set((state) => ({
          panels: { ...state.panels, [panel]: !state.panels[panel] },
        })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setHasLoadedProjects: (loaded) => set({ hasLoadedProjects: loaded }),
      
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
      
      // Layer actions
      addLayer: (layer) =>
        set((state) => ({
          layers: [...state.layers, layer],
          activeLayerId: layer.id,
        })),
      
      removeLayer: (layerId) =>
        set((state) => {
          const newLayers = state.layers.filter(layer => layer.id !== layerId);
          const newActiveLayerId = state.activeLayerId === layerId
            ? (newLayers.length > 0 ? newLayers[newLayers.length - 1].id : null)
            : state.activeLayerId;
          
          return {
            layers: newLayers,
            activeLayerId: newActiveLayerId,
          };
        }),
      
      toggleLayerVisibility: (layerId) =>
        set((state) => ({
          layers: state.layers.map(layer =>
            layer.id === layerId
              ? { ...layer, visible: !layer.visible }
              : layer
          ),
        })),
      
      setActiveLayer: (layerId) => set({ activeLayerId: layerId }),
      
      moveLayer: (layerId, newIndex) =>
        set((state) => {
          const layers = [...state.layers];
          const currentIndex = layers.findIndex(layer => layer.id === layerId);
          
          if (currentIndex === -1 || newIndex < 0 || newIndex >= layers.length) {
            return state;
          }
          
          const [movedLayer] = layers.splice(currentIndex, 1);
          layers.splice(newIndex, 0, movedLayer);
          
          return { layers };
        }),
      
      updateLayerOpacity: (layerId, opacity) =>
        set((state) => ({
          layers: state.layers.map(layer =>
            layer.id === layerId
              ? { ...layer, opacity }
              : layer
          ),
        })),
      
      updateLayer: (layerId, updates) =>
        set((state) => ({
          layers: state.layers.map(layer =>
            layer.id === layerId
              ? { ...layer, ...updates }
              : layer
          ),
        })),
      
      // Canvas actions for sidebar
      createShape: (shapeType) =>
        set((state) => {
          const layerId = `${shapeType}_${Date.now()}`;
          const newLayer: Layer = {
            id: layerId,
            name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${state.layers.length + 1}`,
            visible: true,
            opacity: 100,
            type: 'shape'
          };
          
          // Dispatch a custom event for the Canvas component to handle
          window.dispatchEvent(new CustomEvent('canvasCreateShape', { 
            detail: { shapeType, layerId, color: state.canvas.brushColor } 
          }));
          
          return {
            layers: [...state.layers, newLayer]
          };
        }),
      
      clearCanvas: () => {
        // Dispatch event to clear canvas objects
        window.dispatchEvent(new CustomEvent('canvasClear'));
        
        set((state) => ({
          layers: state.layers.filter(layer => layer.type !== 'shape')
        }));
      },
      
      clearShapeLayers: () =>
        set((state) => ({
          layers: state.layers.filter(layer => layer.type !== 'shape')
        }))
    }),
    {
      name: 'bettergimp-store',
    }
  )
);