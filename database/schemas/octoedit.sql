-- OctoEdit Database Schema
-- SQLite database structure for project management, preferences, and metadata

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Projects table - stores project metadata
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    file_path TEXT UNIQUE,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    color_mode TEXT DEFAULT 'RGB',
    bit_depth INTEGER DEFAULT 8,
    resolution_x REAL DEFAULT 72.0,
    resolution_y REAL DEFAULT 72.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_opened_at TIMESTAMP,
    description TEXT,
    tags TEXT, -- JSON array of tags
    thumbnail BLOB, -- Small preview image
    file_size INTEGER,
    version INTEGER DEFAULT 1,
    metadata JSON -- Additional project metadata
);

-- Layers table - stores layer information
CREATE TABLE IF NOT EXISTS layers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    layer_order INTEGER NOT NULL,
    layer_type TEXT DEFAULT 'image', -- image, text, shape, adjustment
    blend_mode TEXT DEFAULT 'normal',
    opacity REAL DEFAULT 1.0,
    visible BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    width INTEGER,
    height INTEGER,
    offset_x INTEGER DEFAULT 0,
    offset_y INTEGER DEFAULT 0,
    rotation REAL DEFAULT 0.0,
    scale_x REAL DEFAULT 1.0,
    scale_y REAL DEFAULT 1.0,
    layer_data BLOB, -- Compressed layer pixel data
    mask_data BLOB, -- Layer mask data
    blend_settings JSON, -- Advanced blend mode settings
    effects JSON, -- Layer effects and filters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Edit history table - for undo/redo functionality
CREATE TABLE IF NOT EXISTS edit_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- brush_stroke, filter_apply, layer_add, etc.
    action_name TEXT NOT NULL, -- Human-readable action name
    layer_id INTEGER, -- Target layer (if applicable)
    action_data JSON, -- Serialized action parameters
    before_state BLOB, -- State before action (compressed)
    after_state BLOB, -- State after action (compressed)
    memory_usage INTEGER, -- Memory used by this history entry
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT, -- Group actions by editing session
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (layer_id) REFERENCES layers(id) ON DELETE SET NULL
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    key TEXT PRIMARY KEY,
    value JSON,
    category TEXT,
    description TEXT,
    default_value JSON,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tool presets table
CREATE TABLE IF NOT EXISTS tool_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tool_type TEXT NOT NULL, -- brush, eraser, clone, etc.
    settings JSON NOT NULL, -- Tool-specific settings
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Filter presets table
CREATE TABLE IF NOT EXISTS filter_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    filter_type TEXT NOT NULL,
    parameters JSON NOT NULL,
    preview_image BLOB, -- Small preview of filter effect
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recent files table
CREATE TABLE IF NOT EXISTS recent_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT UNIQUE NOT NULL,
    file_name TEXT NOT NULL,
    project_id INTEGER,
    file_type TEXT, -- project, image, etc.
    thumbnail BLOB,
    last_opened TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    open_count INTEGER DEFAULT 1,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Plugins table - for installed plugins
CREATE TABLE IF NOT EXISTS plugins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    version TEXT NOT NULL,
    author TEXT,
    description TEXT,
    file_path TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    auto_load BOOLEAN DEFAULT FALSE,
    settings JSON,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP
);

-- Plugin dependencies table
CREATE TABLE IF NOT EXISTS plugin_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plugin_id INTEGER NOT NULL,
    dependency_name TEXT NOT NULL,
    dependency_version TEXT,
    required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
);

-- Application sessions table - for crash recovery
CREATE TABLE IF NOT EXISTS app_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    crash_detected BOOLEAN DEFAULT FALSE,
    open_projects JSON, -- Array of open project IDs
    window_state JSON, -- Window size, position, etc.
    workspace_layout JSON -- UI layout configuration
);

-- Performance metrics table - for optimization
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT NOT NULL,
    operation_name TEXT,
    duration_ms INTEGER,
    memory_used INTEGER,
    image_size INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    system_info JSON -- CPU, RAM, GPU info
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_modified ON projects(modified_at);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_layers_project ON layers(project_id);
CREATE INDEX IF NOT EXISTS idx_layers_order ON layers(project_id, layer_order);
CREATE INDEX IF NOT EXISTS idx_history_project ON edit_history(project_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON edit_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_history_session ON edit_history(session_id);
CREATE INDEX IF NOT EXISTS idx_recent_files_opened ON recent_files(last_opened);
CREATE INDEX IF NOT EXISTS idx_preferences_category ON user_preferences(category);
CREATE INDEX IF NOT EXISTS idx_performance_operation ON performance_metrics(operation_type);
CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_projects_modified_at
    AFTER UPDATE ON projects
    BEGIN
        UPDATE projects SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_layers_modified_at
    AFTER UPDATE ON layers
    BEGIN
        UPDATE layers SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        UPDATE projects SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.project_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_preferences_modified_at
    AFTER UPDATE ON user_preferences
    BEGIN
        UPDATE user_preferences SET modified_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
    END;

-- Insert default user preferences
INSERT OR IGNORE INTO user_preferences (key, value, category, description, default_value) VALUES
('ui.theme', '"dark"', 'interface', 'Application theme', '"dark"'),
('ui.language', '"en"', 'interface', 'Interface language', '"en"'),
('ui.show_splash', 'true', 'interface', 'Show splash screen on startup', 'true'),
('ui.auto_save_interval', '300', 'general', 'Auto-save interval in seconds', '300'),
('ui.max_recent_files', '10', 'general', 'Maximum recent files to remember', '10'),
('ui.canvas_background', '"#808080"', 'canvas', 'Canvas background color', '"#808080"'),
('ui.show_rulers', 'true', 'canvas', 'Show rulers on canvas', 'true'),
('ui.show_guides', 'true', 'canvas', 'Show guides on canvas', 'true'),
('ui.snap_to_guides', 'true', 'canvas', 'Snap objects to guides', 'true'),
('performance.max_history_entries', '50', 'performance', 'Maximum undo history entries', '50'),
('performance.max_memory_usage', '2147483648', 'performance', 'Maximum memory usage in bytes (2GB)', '2147483648'),
('performance.enable_gpu_acceleration', 'true', 'performance', 'Enable GPU acceleration when available', 'true'),
('performance.thread_count', '0', 'performance', 'Number of processing threads (0 = auto)', '0'),
('tools.default_brush_size', '10', 'tools', 'Default brush size', '10'),
('tools.default_brush_hardness', '1.0', 'tools', 'Default brush hardness', '1.0'),
('tools.default_brush_opacity', '1.0', 'tools', 'Default brush opacity', '1.0'),
('export.default_quality', '95', 'export', 'Default JPEG export quality', '95'),
('export.preserve_metadata', 'true', 'export', 'Preserve image metadata on export', 'true');

-- Insert default tool presets
INSERT OR IGNORE INTO tool_presets (name, tool_type, settings, is_default) VALUES
('Basic Brush', 'brush', '{"size": 10, "hardness": 1.0, "opacity": 1.0, "flow": 1.0}', TRUE),
('Soft Brush', 'brush', '{"size": 20, "hardness": 0.2, "opacity": 0.8, "flow": 0.8}', TRUE),
('Airbrush', 'brush', '{"size": 30, "hardness": 0.0, "opacity": 0.3, "flow": 0.1}', TRUE),
('Hard Eraser', 'eraser', '{"size": 15, "hardness": 1.0, "opacity": 1.0}', TRUE),
('Soft Eraser', 'eraser', '{"size": 25, "hardness": 0.0, "opacity": 0.7}', TRUE);

-- Application schema version
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO schema_version (version) VALUES (1);