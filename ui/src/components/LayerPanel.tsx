import React from 'react';
import { useAppStore } from '@/store/app';
import { Layer } from '@/types';
import { Eye, EyeOff, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

const LayerPanel: React.FC = () => {
  const { 
    layers, 
    activeLayerId, 
    addLayer, 
    removeLayer, 
    toggleLayerVisibility, 
    setActiveLayer, 
    moveLayer, 
    updateLayerOpacity 
  } = useAppStore();

  const handleAddLayer = () => {
    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 100,
      type: 'shape'
    };
    addLayer(newLayer);
  };

  const handleRemoveLayer = (layerId: string) => {
    if (layers.length <= 1) return; // Keep at least one layer
    removeLayer(layerId);
  };

  const handleMoveLayer = (layerId: string, direction: 'up' | 'down') => {
    const currentIndex = layers.findIndex(layer => layer.id === layerId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === layers.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    moveLayer(layerId, newIndex);
  };

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'text':
        return '📝';
      case 'shape':
        return '⭕';
      case 'background':
        return '🎨';
      default:
        return '📄';
    }
  };

  return (
    <div className="w-64 bg-background border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-medium text-sm">Layers</h3>
        <button
          onClick={handleAddLayer}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          title="Add Layer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`p-2 border-b border-border cursor-pointer hover:bg-muted/50 ${
              activeLayerId === layer.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
            }`}
            onClick={() => setActiveLayer(layer.id)}
          >
            {/* Layer Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm">{getLayerIcon(layer.type)}</span>
                <span className="text-sm font-medium truncate">{layer.name}</span>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                {/* Move buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveLayer(layer.id, 'up');
                  }}
                  disabled={index === 0}
                  className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveLayer(layer.id, 'down');
                  }}
                  disabled={index === layers.length - 1}
                  className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {/* Visibility toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="p-1 hover:bg-muted rounded"
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLayer(layer.id);
                  }}
                  disabled={layers.length <= 1}
                  className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Layer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground min-w-[50px]">Opacity:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.opacity}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateLayerOpacity(layer.id, parseInt(e.target.value));
                  }}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="min-w-[30px] text-right">{layer.opacity}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Layer Info */}
      {activeLayerId && (
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Active: {layers.find(l => l.id === activeLayerId)?.name}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total: {layers.length} layer{layers.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerPanel;