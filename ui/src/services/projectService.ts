import { useElectronAPI } from '@/hooks/useElectronAPI';
import { Project } from '@/types';

export const useProjectService = () => {
  const api = useElectronAPI();

  async getAllProjects(): Promise<Project[]> {
    try {
      const result = await this.api.apiCall('/api/projects/');
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Failed to fetch projects');
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const result = await this.api.apiCall(`/api/projects/${projectId}`);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'image_count' | 'file_size'>): Promise<Project | null> {
    try {
      const result = await this.api.apiCall('/api/projects/', 'POST', projectData);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Failed to create project');
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const result = await this.api.apiCall(`/api/projects/${projectId}`, 'PUT', updates);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Failed to update project');
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const result = await this.api.apiCall(`/api/projects/${projectId}`, 'DELETE');
      return result.success;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  async saveProjectState(projectId: string, canvasState: any): Promise<boolean> {
    try {
      // Sauvegarder l'état du canvas avec les objets, layers, etc.
      const projectData = {
        canvas_state: JSON.stringify(canvasState),
        updated_at: new Date().toISOString()
      };

      const result = await this.api.apiCall(`/api/projects/${projectId}`, 'PUT', projectData);
      return result.success;
    } catch (error) {
      console.error('Error saving project state:', error);
      return false;
    }
  }

  async exportProject(projectId: string, format: 'json' | 'zip' = 'json'): Promise<string | null> {
    try {
      const result = await this.api.apiCall(`/api/projects/${projectId}/export?format=${format}`);
      if (result.success && result.data) {
        return result.data.export_data;
      }
      return null;
    } catch (error) {
      console.error('Error exporting project:', error);
      return null;
    }
  }

  async importProject(projectData: any): Promise<Project | null> {
    try {
      const result = await this.api.apiCall('/api/projects/import', 'POST', projectData);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error importing project:', error);
      return null;
    }
  }
}

// Singleton instance
export const projectService = new ProjectService();