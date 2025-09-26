# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-09-26

### Added
- Complete HTML5 Canvas system replacing non-functional Fabric.js
- Drawing tools: Brush, Pencil, and Eraser with size and opacity controls
- Organized color palette with categorized colors (Primary, Greyscale, Warm, Cool)
- Image import/export functionality via EditDropdown component
- Geometric shapes support (Rectangle, Circle, Triangle, Diamond, Star)
- Selection system for all canvas objects
- Modern dark mode UI using Shadcn/UI components
- Comprehensive build system with unified build.sh script
- GitHub Actions workflow for automated cross-platform releases
- Python 3.13 compatibility with updated dependencies
- C++ core with OpenCV integration and comprehensive test suite
- Python FastAPI server with SQLite database
- Electron desktop application with proper configuration

### Technical Features
- Image cache system for optimized canvas rendering
- Layer synchronization between canvas and state management
- Zustand state management for React components
- Cross-platform Electron builds (Linux AppImage/deb, Windows nsis, macOS dmg)
- Automated version management and release scripting
- TypeScript strict type checking and error handling

### Infrastructure
- CMake build system for C++ core with vcpkg dependencies
- Python virtual environment with pip dependency management
- Bun package manager for UI development
- GitHub Actions CI/CD pipeline
- Semantic versioning with automated changelog updates

### Performance
- HTML5 Canvas native rendering for improved performance
- Optimized redraw system with collision detection
- SIMD acceleration support in C++ core
- Efficient memory management for image processing

### Developer Experience
- Unified build script supporting all project components
- Comprehensive error handling and logging
- Development server with hot reload
- Automated testing for C++ core and UI builds
- Cross-platform compatibility (Linux, Windows, macOS)

## [0.1.0] - 2025-09-25

### Added
- Initial project structure
- Basic C++ core foundation
- Python server setup
- UI framework initialization