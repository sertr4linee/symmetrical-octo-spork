import { useElectronAPI } from '@/hooks/useElectronAPI';
import { Project } from '@/types';

export const useProjectService = () => {
  const api = useElectronAPI();

  const getAllProjects = async (): Promise<Project[]> => {
    try {
      const result = await api.apiCall('/api/projects/');
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Failed to fetch projects');
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  };

  const getProject = async (projectId: string): Promise<Project | null> => {
    try {
      const result = await api.apiCall(`/api/projects/${projectId}`);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'image_count' | 'file_size'>): Promise<Project | null> => {
    try {
      const result = await api.apiCall('/api/projects/', 'POST', projectData);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Failed to create project');
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | null> => {
    try {
      const result = await api.apiCall(`/api/projects/${projectId}`, 'PUT', updates);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Failed to update project');
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const result = await api.apiCall(`/api/projects/${projectId}`, 'DELETE');
      return result.success;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  };

  const saveProjectState = async (projectId: string, canvasState: any, objects: any[], layers: any[]): Promise<boolean> => {
    try {
      // Sauvegarder l'état complet du projet
      const projectData = {
        canvas_state: JSON.stringify({
          canvasState,
          objects,
          layers,
          savedAt: new Date().toISOString()
        }),
        updated_at: new Date().toISOString()
      };

      const result = await api.apiCall(`/api/projects/${projectId}`, 'PUT', projectData);
      console.log('Project saved:', result.success);
      return result.success;
    } catch (error) {
      console.error('Error saving project state:', error);
      return false;
    }
  };

  const exportProject = async (projectId: string, format: 'json' | 'zip' = 'json'): Promise<string | null> => {
    try {
      const result = await api.apiCall(`/api/projects/${projectId}/export?format=${format}`);
      if (result.success && result.data) {
        return result.data.export_data;
      }
      return null;
    } catch (error) {
      console.error('Error exporting project:', error);
      return null;
    }
  };

  const exportCanvasAsImage = async (canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality: number = 0.9): Promise<void> => {
    try {
      const dataURL = canvas.toDataURL(`image/${format}`, quality);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.download = `canvas-export.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting canvas as image:', error);
      throw error;
    }
  };

  const loadProjectState = async (project: Project): Promise<{canvasState: any, objects: any[], layers: any[]} | null> => {
    try {
      if (project.canvas_state) {
        const state = JSON.parse(project.canvas_state);
        return {
          canvasState: state.canvasState || {},
          objects: state.objects || [],
          layers: state.layers || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading project state:', error);
      return null;
    }
  };

  const importProject = async (projectData: any): Promise<Project | null> => {
    try {
      const result = await api.apiCall('/api/projects/import', 'POST', projectData);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error importing project:', error);
      return null;
    }
  };

  return {
    getAllProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    saveProjectState,
    loadProjectState,
    exportProject,
    importProject,
    exportCanvasAsImage
  };
};