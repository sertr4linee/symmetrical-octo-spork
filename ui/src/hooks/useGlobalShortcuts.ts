import { useEffect } from 'react';
import { useAppStore } from '@/store/app';

interface GlobalShortcutsProps {
  onOpenSettings: () => void;
}

export const useGlobalShortcuts = ({ onOpenSettings }: GlobalShortcutsProps) => {
  const { preferences, undo, redo, updateCanvasState, setCurrentTool } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key, shiftKey } = event;
      const modifier = ctrlKey || metaKey;

      // Prevent default for our shortcuts
      const isOurShortcut = (() => {
        // Settings shortcut
        if (modifier && key === ',') return true;
        
        // Check if this matches any of our configured shortcuts
        const currentKey = `${modifier ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${key}`;
        return Object.values(preferences.shortcuts).includes(currentKey);
      })();

      if (!isOurShortcut) return;
      
      event.preventDefault();
      event.stopPropagation();

      // Settings shortcut (Ctrl+, or Cmd+,)
      if (modifier && key === ',') {
        onOpenSettings();
        return;
      }

      // Check configured shortcuts
      const shortcutEntry = Object.entries(preferences.shortcuts).find(([_, shortcut]) => {
        const normalized = shortcut.replace('Ctrl', modifier ? 'Ctrl' : '').replace('Cmd', modifier ? 'Ctrl' : '');
        const currentKey = `${modifier ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${key}`;
        return normalized === currentKey;
      });

      if (!shortcutEntry) return;

      const [action] = shortcutEntry;

      switch (action) {
        case 'undo':
          undo();
          break;
        case 'redo':
          redo();
          break;
        case 'zoom-in':
          updateCanvasState({
            zoom: Math.min(useAppStore.getState().canvas.zoom * 1.2, 10),
          });
          break;
        case 'zoom-out':
          updateCanvasState({
            zoom: Math.max(useAppStore.getState().canvas.zoom / 1.2, 0.1),
          });
          break;
        case 'zoom-fit':
          updateCanvasState({
            zoom: 1,
            pan: { x: 0, y: 0 },
          });
          break;
        case 'brush-tool':
          setCurrentTool('brush');
          break;
        case 'select-tool':
          setCurrentTool('select');
          break;
        case 'pencil-tool':
          setCurrentTool('pencil');
          break;
        case 'eraser-tool':
          setCurrentTool('eraser');
          break;
        default:
          console.log('Unhandled shortcut action:', action);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [preferences.shortcuts, onOpenSettings, undo, redo, updateCanvasState, setCurrentTool]);
};