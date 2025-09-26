import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app';
import { useElectronAPI } from '@/hooks/useElectronAPI';
import { Project, ProjectCreate } from '@/types';

interface FileExplorerProps {
  className?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ className = '' }) => {
  const { 
    projects, 
    setProjects, 
    currentProject, 
    setCurrentProject,
    isLoading,
    error,
    setLoading, 
    setError 
  } = useAppStore();
  
  const electronAPI = useElectronAPI();
  const [isCreating, setIsCreating] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [newProject, setNewProject] = useState<Partial<ProjectCreate>>({
    name: '',
    description: '',
    width: 1920,
    height: 1080,
    color_mode: 'RGB',
    resolution: 300
  });

  // Load projects on component mount
  useEffect(() => {
    let mounted = true;
    
    if (electronAPI && mounted && !hasLoadedOnce) {
      loadProjects();
    }
    
    return () => {
      mounted = false;
    };
  }, [electronAPI, hasLoadedOnce]);

  const loadProjects = async () => {
    if (!electronAPI) {
      setError('Electron API not available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log('Loading projects...');
      
      const response = await electronAPI.apiCall('/api/projects/'); // Add trailing slash
      
      console.log('API response:', response);
      
      if (response.success && response.data) {
        setProjects(response.data);
        console.log('Projects loaded:', response.data.length);
      } else {
        const errorMsg = response.error || `API error: Status ${response.status}`;
        setError(errorMsg);
        console.error('API call failed:', errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Failed to connect to backend server';
      setError(errorMsg);
      console.error('Load projects error:', error);
    } finally {
      setLoading(false);
      setHasLoadedOnce(true); // Mark that we've attempted to load at least once
    }
  };

  const createProject = async () => {
    if (!electronAPI || !newProject.name) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Creating project:', newProject);
      
      const response = await electronAPI.apiCall('/api/projects/', 'POST', newProject);
      
      console.log('Create project response:', response);
      
      if (response.success && response.data) {
        setProjects([...projects, response.data]);
        setIsCreating(false);
        setNewProject({
          name: '',
          description: '',
          width: 1920,
          height: 1080,
          color_mode: 'RGB',
          resolution: 300
        });
        setError(null);
        console.log('Project created successfully:', response.data);
      } else {
        const errorMsg = response.error || `Failed to create project: Status ${response.status}`;
        setError(errorMsg);
        console.error('Create project failed:', errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Failed to create project';
      setError(errorMsg);
      console.error('Create project error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (project: Project) => {
    if (!electronAPI) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Opening project:', project.name);
      
      // Set the project as current project
      setCurrentProject(project);
      
      // Optional: fetch full project details from API
      const response = await electronAPI.apiCall(`/api/projects/${project.id}`);
      
      if (response.success && response.data) {
        setCurrentProject(response.data);
        console.log('Project opened successfully:', response.data.name);
        
        // Here you could add navigation to canvas or other UI updates
        // For now, the project will show as "Current Project" in the UI
      } else {
        console.warn('Failed to fetch full project details, using cached data');
        // Keep the project set even if API call fails
      }
    } catch (error) {
      console.error('Open project error:', error);
      // Still set the project even if there's an error
      setCurrentProject(project);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!electronAPI || !confirm('Are you sure you want to delete this project?')) return;
    
    try {
      setLoading(true);
      const response = await electronAPI.apiCall(`/api/projects/${projectId}`, 'DELETE');
      
      if (response.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
        }
        setError(null);
      } else {
        setError(response.error || 'Failed to delete project');
      }
    } catch (error) {
      setError('Failed to delete project');
      console.error('Delete project error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`file-explorer ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Projects</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              New
            </button>
            <button
              onClick={loadProjects}
              className="px-2 py-1 text-xs border border-border rounded hover:bg-accent"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Current Project Display */}
        {currentProject && (
          <div className="mb-3 p-2 bg-accent rounded-md">
            <div className="text-xs font-medium text-accent-foreground">Current Project</div>
            <div className="text-sm">{currentProject.name}</div>
            <div className="text-xs text-muted-foreground">
              {currentProject.width}×{currentProject.height} • {currentProject.color_mode}
            </div>
          </div>
        )}
      </div>

      {/* New Project Form */}
      {isCreating && (
        <div className="p-4 border-b border-border bg-muted/50">
          <h4 className="text-sm font-medium mb-3">Create New Project</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <input
                type="text"
                value={newProject.name || ''}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                placeholder="Project name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <input
                type="text"
                value={newProject.description || ''}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Width</label>
                <input
                  type="number"
                  value={newProject.width || 1920}
                  onChange={(e) => setNewProject({ ...newProject, width: Number(e.target.value) })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Height</label>
                <input
                  type="number"
                  value={newProject.height || 1080}
                  onChange={(e) => setNewProject({ ...newProject, height: Number(e.target.value) })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Color Mode</label>
                <select
                  value={newProject.color_mode || 'RGB'}
                  onChange={(e) => setNewProject({ ...newProject, color_mode: e.target.value as 'RGB' | 'CMYK' | 'Grayscale' })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                >
                  <option value="RGB">RGB</option>
                  <option value="CMYK">CMYK</option>
                  <option value="Grayscale">Grayscale</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Resolution (DPI)</label>
                <input
                  type="number"
                  value={newProject.resolution || 300}
                  onChange={(e) => setNewProject({ ...newProject, resolution: Number(e.target.value) })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={createProject}
              disabled={!newProject.name}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading projects...
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="p-4 text-center text-red-600 text-sm border border-red-300 bg-red-50 mx-4 my-2 rounded">
            {error}
            <br />
            <button 
              onClick={loadProjects}
              className="mt-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && projects.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No projects found. Create a new project to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <div key={project.id} className="p-3 hover:bg-accent/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {project.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {project.width}×{project.height} • {project.color_mode} • {project.resolution} DPI
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.image_count} images • {(project.file_size / 1024 / 1024).toFixed(1)} MB
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <button
                      onClick={() => openProject(project)}
                      className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;