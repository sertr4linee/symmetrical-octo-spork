import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/app';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  FileImage,
  ChevronDown 
} from 'lucide-react';

interface EditDropdownProps {
  className?: string;
}

const EditDropdown: React.FC<EditDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentProject } = useAppStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImportImage = async () => {
    setIsOpen(false);
    
    try {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp';
      input.multiple = false;
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Read file as base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string;
          
          try {
            // Call Electron API to import the image
            if (window.electronAPI) {
              const result = await window.electronAPI.apiCall(
                `/api/images/import/${currentProject?.id}`,
                'POST',
                {
                  name: file.name,
                  data: base64Data,
                  format: file.type.split('/')[1] || 'png'
                }
              );
              
              if (result.success) {
                console.log('Image imported successfully:', result.data);
                // TODO: Add the image to canvas or layer
              } else {
                console.error('Failed to import image:', result.error);
              }
            }
          } catch (error) {
            console.error('Error importing image:', error);
          }
        };
        
        reader.readAsDataURL(file);
      };
      
      input.click();
    } catch (error) {
      console.error('Error opening file dialog:', error);
    }
  };

  const handleExportProject = async () => {
    setIsOpen(false);
    
    if (!currentProject) {
      console.warn('No project selected for export');
      return;
    }

    try {
      // Call Electron API to export the project
      if (window.electronAPI) {
        const result = await window.electronAPI.apiCall(
          `/api/projects/${currentProject.id}/export`,
          'GET'
        );
        
        if (result.success) {
          // Create download link
          const blob = new Blob([result.data], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentProject.name}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('Project exported successfully');
        } else {
          console.error('Failed to export project:', result.error);
        }
      }
    } catch (error) {
      console.error('Error exporting project:', error);
    }
  };

  const handleExportCanvas = async () => {
    setIsOpen(false);
    
    try {
      // Get canvas element and export as image
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.warn('No canvas found to export');
        return;
      }

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject?.name || 'canvas'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Canvas exported successfully');
      }, 'image/png');
      
    } catch (error) {
      console.error('Error exporting canvas:', error);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-foreground cursor-pointer flex items-center gap-1 text-muted-foreground transition-colors"
      >
        Edit
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-3 text-xs hover:bg-accent"
              onClick={handleImportImage}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Image
            </Button>
            
            <div className="border-t border-border my-1" />
            
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-3 text-xs hover:bg-accent"
              onClick={handleExportCanvas}
              disabled={!currentProject}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Canvas as PNG
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-3 text-xs hover:bg-accent"
              onClick={handleExportProject}
              disabled={!currentProject}
            >
              <FileImage className="w-4 h-4 mr-2" />
              Export Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDropdown;