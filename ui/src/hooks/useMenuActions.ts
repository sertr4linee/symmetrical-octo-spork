import { useEffect } from 'react';
import { useAppStore } from '@/store/app';

export const useMenuActions = () => {
  const {
    setCurrentProject,
    addHistoryEntry,
    undo,
    redo,
    updateCanvasState,
  } = useAppStore();

  useEffect(() => {
    const cleanup = window.electronAPI.onMenuAction((event, action) => {
      console.log('Menu action:', action);
      
      switch (action) {
        case 'menu-new-project':
          // Handle new project creation
          setCurrentProject(null);
          addHistoryEntry({
            action: 'new-project',
            data: null,
          });
          break;
          
        case 'menu-open-project':
          // Handle project opening
          addHistoryEntry({
            action: 'open-project',
            data: null,
          });
          break;
          
        case 'menu-save-project':
          // Handle project saving
          addHistoryEntry({
            action: 'save-project',
            data: null,
          });
          break;
          
        case 'menu-import-image':
          // Handle image import
          addHistoryEntry({
            action: 'import-image',
            data: null,
          });
          break;
          
        case 'menu-export-image':
          // Handle image export
          addHistoryEntry({
            action: 'export-image',
            data: null,
          });
          break;
          
        case 'menu-undo':
          undo();
          break;
          
        case 'menu-redo':
          redo();
          break;
          
        case 'menu-zoom-in':
          updateCanvasState({
            zoom: Math.min(useAppStore.getState().canvas.zoom * 1.2, 10),
          });
          break;
          
        case 'menu-zoom-out':
          updateCanvasState({
            zoom: Math.max(useAppStore.getState().canvas.zoom / 1.2, 0.1),
          });
          break;
          
        case 'menu-zoom-fit':
          updateCanvasState({
            zoom: 1,
            pan: { x: 0, y: 0 },
          });
          break;
          
        default:
          console.log('Unhandled menu action:', action);
      }
    });

    return cleanup;
  }, [setCurrentProject, addHistoryEntry, undo, redo, updateCanvasState]);
};