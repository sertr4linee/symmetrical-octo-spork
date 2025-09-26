import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  side: 'left' | 'right';
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  isVisible: boolean;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  side,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 264,
  isVisible
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;
      
      const rect = panelRef.current.getBoundingClientRect();
      let newWidth;
      
      if (side === 'left') {
        newWidth = e.clientX - rect.left;
      } else {
        newWidth = rect.right - e.clientX;
      }
      
      // Constrain width
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, side, minWidth, maxWidth]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      ref={panelRef}
      className="bg-card border-border flex-shrink-0 relative"
      style={{ 
        width: `${width}px`,
        borderLeft: side === 'right' ? '1px solid hsl(var(--border))' : 'none',
        borderRight: side === 'left' ? '1px solid hsl(var(--border))' : 'none'
      }}
    >
      {children}
      
      {/* Resize handle */}
      <div
        className={`absolute top-0 bottom-0 w-1 hover:bg-primary/50 cursor-col-resize ${
          side === 'left' ? 'right-0' : 'left-0'
        } ${isResizing ? 'bg-primary/50' : ''}`}
        onMouseDown={handleMouseDown}
        style={{ 
          zIndex: 10,
          cursor: 'col-resize'
        }}
      >
        {/* Visual indicator */}
        <div className={`absolute top-1/2 transform -translate-y-1/2 w-1 h-8 bg-border rounded ${
          side === 'left' ? '-translate-x-1/2' : 'translate-x-1/2'
        }`} />
      </div>
    </div>
  );
};

export default ResizablePanel;