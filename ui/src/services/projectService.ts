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

  const saveProjectState = async (projectId: string, canvasState: any): Promise<boolean> => {
    try {
      // Sauvegarder l'état du canvas avec les objets, layers, etc.
      const projectData = {
        canvas_state: JSON.stringify(canvasState),
        updated_at: new Date().toISOString()
      };

      const result = await api.apiCall(`/api/projects/${projectId}`, 'PUT', projectData);
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
    exportProject,
    importProject
  };
};