import React, { useState } from 'react';
import { useAppStore } from '@/store/app';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { 
  Plus, 
  FolderOpen, 
  Trash2,
  Calendar,
  Layers,
  X
} from 'lucide-react';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ isOpen, onClose }) => {
  const { projects, currentProject, setCurrentProject, addProject, removeProject } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  if (!isOpen) return null;

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: newProjectName.trim(),
      description: 'New project',
      width: 800,
      height: 600,
      color_mode: 'RGB',
      resolution: 72,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      image_count: 0,
      file_size: 0
    };

    addProject(newProject);
    setCurrentProject(newProject);
    setNewProjectName('');
    setIsCreating(false);
    onClose();
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Create New Project */}
          <div className="mb-6">
            {!isCreating ? (
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            ) : (
              <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20">
                <input
                  type="text"
                  placeholder="Enter project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateProject();
                    if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewProjectName('');
                    }
                  }}
                />
                <Button 
                  onClick={handleCreateProject}
                  size="sm"
                  disabled={!newProjectName.trim()}
                >
                  Create
                </Button>
                <Button 
                  onClick={() => {
                    setIsCreating(false);
                    setNewProjectName('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
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
                  onClick={() => {
                    setCurrentProject(project);
                    onClose();
                  }}
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
                          removeProject(project.id);
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