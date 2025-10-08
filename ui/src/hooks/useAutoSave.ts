import { useAppStore } from '@/store/app';
import { useProjectService } from '@/services/projectService';
import { useCallback } from 'react';

export const useAutoSave = () => {
  const { currentProject, canvas, layers } = useAppStore();
  const projectService = useProjectService();

  const saveProject = useCallback(async () => {
    if (!currentProject) return false;

    try {
      // Créer l'état du canvas à sauvegarder
      const canvasState = {
        layers: layers,
        canvas: {
          zoom: canvas.zoom,
          pan: canvas.pan,
          rotation: canvas.rotation,
          tool: canvas.tool,
          brushColor: canvas.brushColor,
          brushSize: canvas.brushSize,
          brushOpacity: canvas.brushOpacity
        },
        project: {
          width: currentProject.width,
          height: currentProject.height
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      const success = await projectService.saveProjectState(currentProject.id, canvasState);
      
      if (success) {
        console.log('Project auto-saved successfully');
        return true;
      } else {
        console.error('Failed to auto-save project');
        return false;
      }
    } catch (error) {
      console.error('Error during auto-save:', error);
      return false;
    }
  }, [currentProject, canvas, layers, projectService]);

  const saveProjectManual = useCallback(async () => {
    if (!currentProject) {
      console.warn('No current project to save');
      return false;
    }

    try {
      const success = await saveProject();
      if (success) {
        // Optionally show a success notification
        console.log('Project saved manually');
      }
      return success;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  }, [saveProject, currentProject]);

  return {
    saveProject,
    saveProjectManual,
    canSave: !!currentProject
  };
};