import React, { useState } from 'react';
import { useAppStore } from '@/store/app';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon,
  Monitor,
  Sun,
  Moon,
  Keyboard,
  Clock,
  Zap,
  Palette,
  FileText,
  Save,
  RotateCcw,
  X,
  Trash2
} from 'lucide-react';
import { RecentFile } from '@/types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, recentFiles, clearRecentFiles } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'interface' | 'performance' | 'shortcuts' | 'recent'>('general');

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'interface', label: 'Interface', icon: Palette },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'recent', label: 'Recent Files', icon: Clock },
  ] as const;

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    console.log('Changing theme to:', theme);
    updatePreferences({ theme });
    
    // Apply theme immediately
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme;
      console.log('Applied system theme:', systemTheme);
    } else {
      root.classList.add(theme);
      root.style.colorScheme = theme;
      console.log('Applied theme:', theme);
    }
  };

  const defaultShortcuts = {
    'new-project': 'Ctrl+N',
    'open-project': 'Ctrl+O',
    'save-project': 'Ctrl+S',
    'undo': 'Ctrl+Z',
    'redo': 'Ctrl+Y',
    'zoom-in': 'Ctrl++',
    'zoom-out': 'Ctrl+-',
    'zoom-fit': 'Ctrl+0',
    'brush-tool': 'B',
    'select-tool': 'V',
    'pencil-tool': 'P',
    'eraser-tool': 'E',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-[800px] h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Settings
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-border bg-muted/30">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'general' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">General Settings</h3>
                  
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Theme</h4>
                      <div className="flex gap-2">
                        <Button
                          variant={preferences.theme === 'light' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleThemeChange('light')}
                          className="flex items-center gap-2"
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </Button>
                        <Button
                          variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleThemeChange('dark')}
                          className="flex items-center gap-2"
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </Button>
                        <Button
                          variant={preferences.theme === 'system' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleThemeChange('system')}
                          className="flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          System
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Language */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Language</h4>
                      <select
                        value={preferences.language}
                        onChange={(e) => updatePreferences({ language: e.target.value })}
                        className="px-3 py-2 text-sm border border-border rounded-md bg-background"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                      </select>
                    </div>

                    <Separator />

                    {/* Auto Save */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Auto Save</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Enable auto save</span>
                          <Toggle
                            pressed={preferences.autoSave}
                            onPressedChange={(pressed) => updatePreferences({ autoSave: pressed })}
                          />
                        </div>
                        {preferences.autoSave && (
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">
                              Auto save interval: {preferences.autoSaveInterval} minutes
                            </label>
                            <Slider
                              value={[preferences.autoSaveInterval]}
                              onValueChange={([value]) => updatePreferences({ autoSaveInterval: value })}
                              max={30}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interface' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Interface Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Welcome Screen */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Show welcome screen</span>
                        <p className="text-xs text-muted-foreground">Display welcome screen on startup</p>
                      </div>
                      <Toggle
                        pressed={preferences.interface.showWelcomeScreen}
                        onPressedChange={(pressed) => 
                          updatePreferences({ 
                            interface: { ...preferences.interface, showWelcomeScreen: pressed }
                          })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Toolbar Size */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Toolbar Size</h4>
                      <div className="flex gap-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <Button
                            key={size}
                            variant={preferences.interface.toolbarSize === size ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => 
                              updatePreferences({ 
                                interface: { ...preferences.interface, toolbarSize: size }
                              })
                            }
                            className="capitalize"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Tooltips */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Show tooltips</span>
                        <p className="text-xs text-muted-foreground">Display helpful tooltips on hover</p>
                      </div>
                      <Toggle
                        pressed={preferences.interface.showTooltips}
                        onPressedChange={(pressed) => 
                          updatePreferences({ 
                            interface: { ...preferences.interface, showTooltips: pressed }
                          })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Animations */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Enable animations</span>
                        <p className="text-xs text-muted-foreground">Use smooth animations in interface</p>
                      </div>
                      <Toggle
                        pressed={preferences.interface.enableAnimations}
                        onPressedChange={(pressed) => 
                          updatePreferences({ 
                            interface: { ...preferences.interface, enableAnimations: pressed }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Performance Settings</h3>
                  
                  <div className="space-y-4">
                    {/* High Quality Preview */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">High quality preview</span>
                        <p className="text-xs text-muted-foreground">Better quality but slower performance</p>
                      </div>
                      <Toggle
                        pressed={preferences.performance.highQualityPreview}
                        onPressedChange={(pressed) => 
                          updatePreferences({ 
                            performance: { ...preferences.performance, highQualityPreview: pressed }
                          })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Hardware Acceleration */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Hardware acceleration</span>
                        <p className="text-xs text-muted-foreground">Use GPU for faster rendering</p>
                      </div>
                      <Toggle
                        pressed={preferences.performance.hardwareAcceleration}
                        onPressedChange={(pressed) => 
                          updatePreferences({ 
                            performance: { ...preferences.performance, hardwareAcceleration: pressed }
                          })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Memory Limit */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Memory limit: {preferences.performance.memoryLimit} MB
                      </label>
                      <Slider
                        value={[preferences.performance.memoryLimit]}
                        onValueChange={([value]) => 
                          updatePreferences({ 
                            performance: { ...preferences.performance, memoryLimit: value }
                          })
                        }
                        max={8192}
                        min={512}
                        step={256}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum memory usage for image processing
                      </p>
                    </div>

                    <Separator />

                    {/* Max Undo Steps */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Max undo steps: {preferences.performance.maxUndoSteps}
                      </label>
                      <Slider
                        value={[preferences.performance.maxUndoSteps]}
                        onValueChange={([value]) => 
                          updatePreferences({ 
                            performance: { ...preferences.performance, maxUndoSteps: value }
                          })
                        }
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Number of undo/redo steps to keep in memory
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePreferences({ shortcuts: defaultShortcuts })}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset to Default
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(defaultShortcuts).map(([action, defaultShortcut]) => (
                      <div key={action} className="flex items-center justify-between p-3 border border-border rounded-md">
                        <div>
                          <span className="text-sm font-medium capitalize">
                            {action.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={preferences.shortcuts[action] || defaultShortcut}
                            onChange={(e) => 
                              updatePreferences({ 
                                shortcuts: { ...preferences.shortcuts, [action]: e.target.value }
                              })
                            }
                            className="px-2 py-1 text-sm border border-border rounded bg-background font-mono"
                            placeholder={defaultShortcut}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recent' && (
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Recent Files</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearRecentFiles}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {recentFiles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recent files</p>
                      </div>
                    ) : (
                      recentFiles.map((file: RecentFile) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-accent/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded border flex items-center justify-center">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.path}</p>
                              <p className="text-xs text-muted-foreground">
                                Last opened: {new Date(file.lastOpened).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Remove this file from recent files
                              // This would be implemented in the store
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;