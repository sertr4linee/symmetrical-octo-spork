import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app';
import { useProjectService } from '@/services/projectService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { 
  Plus, 
  FolderOpen, 
  Trash2,
  Calendar,
  Layers,
  X,
  Save
} from 'lucide-react';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ isOpen, onClose }) => {
  const { projects, currentProject, setCurrentProject, addProject, removeProject, setProjects, setLoading, canvas } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectWidth, setNewProjectWidth] = useState(800);
  const [newProjectHeight, setNewProjectHeight] = useState(600);
  const projectService = useProjectService();

  // Charger les projets au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsFromApi = await projectService.getAllProjects();
      setProjects(projectsFromApi);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentProject = async () => {
    if (!currentProject) return;
    
    try {
      setLoading(true);
      await projectService.saveProjectState(currentProject.id, canvas);
      // Optionally show a success message
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

    const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setLoading(true);
      const projectData = {
        name: newProjectName.trim(),
        description: newProjectDescription || 'New project',
        width: newProjectWidth,
        height: newProjectHeight,
        color_mode: 'RGB' as const,
        resolution: 72
      };

      const newProject = await projectService.createProject(projectData);
      
      if (newProject) {
        addProject(newProject);
        setCurrentProject(newProject);
        setNewProjectName('');
        setNewProjectDescription('');
        setIsCreating(false);
        onClose();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setLoading(true);
        const success = await projectService.deleteProject(projectId);
        if (success) {
          removeProject(projectId);
          if (currentProject?.id === projectId) {
            setCurrentProject(null);
          }
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoadProject = async (project: Project) => {
    try {
      setLoading(true);
      const fullProject = await projectService.getProject(project.id);
      if (fullProject) {
        setCurrentProject(fullProject);
        onClose();
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Project Manager</h2>
            <p className="text-sm text-muted-foreground">Manage your Better GIMP projects</p>
          </div>
          <div className="flex items-center gap-2">
            {currentProject && (
              <Button
                onClick={handleSaveCurrentProject}
                variant="outline"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Current
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Create New Project */}
          <div className="mb-6">
            {!isCreating && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            )}
            
            {isCreating && (
              <div className="space-y-4 mt-4 p-4 border border-border rounded-lg bg-accent/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Project Name</label>
                    <input
                      type="text"
                      placeholder="Enter project name..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                    <input
                      type="text"
                      placeholder="Project description..."
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Width (px)</label>
                    <input
                      type="number"
                      value={newProjectWidth}
                      onChange={(e) => setNewProjectWidth(parseInt(e.target.value) || 800)}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20"
                      min="1"
                      max="10000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Height (px)</label>
                    <input
                      type="number"
                      value={newProjectHeight}
                      onChange={(e) => setNewProjectHeight(parseInt(e.target.value) || 600)}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20"
                      min="1"
                      max="10000"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button 
                    onClick={() => {
                      setIsCreating(false);
                      setNewProjectName('');
                      setNewProjectDescription('');
                      setNewProjectWidth(800);
                      setNewProjectHeight(600);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    size="sm"
                    disabled={!newProjectName.trim()}
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No projects yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                    currentProject?.id === project.id ? 'ring-2 ring-foreground/20 bg-accent/30' : ''
                  }`}
                  onClick={() => handleLoadProject(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-foreground truncate">{project.name}</h3>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{project.width}×{project.height}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  
                  {currentProject?.id === project.id && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;