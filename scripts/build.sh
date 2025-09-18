#!/bin/bash

# Better GIMP Build Script
# Cross-platform build automation

set -euo pipefail

# Configuration
PROJECT_NAME="Better GIMP"
BUILD_DIR="build"
DIST_DIR="dist"
CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect platform
detect_platform() {
    case "$(uname -s)" in
        Linux*)     PLATFORM="linux";;
        Darwin*)    PLATFORM="macos";;
        CYGWIN*|MINGW*|MSYS*) PLATFORM="windows";;
        *)          PLATFORM="unknown";;
    esac
    
    case "$(uname -m)" in
        x86_64|amd64) ARCH="x64";;
        arm64|aarch64) ARCH="arm64";;
        i386|i686) ARCH="x86";;
        *) ARCH="unknown";;
    esac
    
    log_info "Detected platform: $PLATFORM-$ARCH"
}

# Setup build environment
setup_environment() {
    log_info "Setting up build environment..."
    
    # Create directories
    mkdir -p "$BUILD_DIR" "$DIST_DIR"
    
    # Platform-specific setup
    case $PLATFORM in
        linux)
            if ! command -v cmake &> /dev/null; then
                log_error "CMake not found. Please install cmake."
                exit 1
            fi
            ;;
        macos)
            if ! command -v brew &> /dev/null; then
                log_warning "Homebrew not found. Some dependencies might be missing."
            fi
            ;;
        windows)
            log_info "Windows build detected. Ensure Visual Studio Build Tools are installed."
            ;;
    esac
}

# Build C++ Core
build_cpp_core() {
    log_info "Building C++ Core..."
    
    cd core-cpp
    
    # Determine preset based on platform
    case "$PLATFORM-$ARCH" in
        linux-x64) PRESET="linux-release";;
        macos-x64) PRESET="macos-release";;
        macos-arm64) PRESET="macos-arm-release";;
        windows-x64) PRESET="windows-release";;
        *) 
            log_error "Unsupported platform: $PLATFORM-$ARCH"
            exit 1
            ;;
    esac
    
    # Configure
    log_info "Configuring with preset: $PRESET"
    cmake --preset "$PRESET" \
        -DCMAKE_TOOLCHAIN_FILE="$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake" \
        -DVCPKG_TARGET_TRIPLET="$ARCH-$PLATFORM"
    
    # Build
    log_info "Building C++ core with $CORES cores..."
    cmake --build --preset "$PRESET" --parallel $CORES
    
    # Package
    log_info "Creating C++ packages..."
    cmake --build --preset "$PRESET" --target package
    
    cd ..
    log_success "C++ Core built successfully"
}

# Build Python Backend
build_python_backend() {
    log_info "Building Python Backend..."
    
    cd backend-python
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        log_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate
    
    # Install dependencies
    log_info "Installing Python dependencies..."
    pip install --upgrade pip setuptools wheel
    pip install -r requirements.txt
    
    # Build package
    log_info "Building Python package..."
    python -m build --wheel --sdist
    
    # Create executable
    log_info "Creating standalone executable..."
    pip install pyinstaller
    pyinstaller --onefile --name bettergimp-backend src/main.py
    
    deactivate
    cd ..
    log_success "Python Backend built successfully"
}

# Build Electron Frontend
build_electron_frontend() {
    log_info "Building Electron Frontend..."
    
    cd frontend-electron
    
    # Install dependencies
    log_info "Installing Node.js dependencies..."
    npm ci
    
    # Build the application
    log_info "Building React application..."
    npm run build
    
    # Build Electron package
    log_info "Building Electron package..."
    npm run electron:build
    
    cd ..
    log_success "Electron Frontend built successfully"
}

# Create distribution package
create_distribution() {
    log_info "Creating distribution package..."
    
    DIST_NAME="bettergimp-$PLATFORM-$ARCH"
    DIST_PATH="$DIST_DIR/$DIST_NAME"
    
    # Create distribution directory
    mkdir -p "$DIST_PATH"
    
    # Copy built artifacts
    if [ -d "core-cpp/build" ]; then
        cp -r core-cpp/build/*/Release/* "$DIST_PATH/" 2>/dev/null || true
    fi
    
    if [ -d "backend-python/dist" ]; then
        mkdir -p "$DIST_PATH/backend"
        cp -r backend-python/dist/* "$DIST_PATH/backend/"
    fi
    
    if [ -d "frontend-electron/dist" ]; then
        mkdir -p "$DIST_PATH/frontend"
        cp -r frontend-electron/dist/* "$DIST_PATH/frontend/"
    fi
    
    # Create startup script
    case $PLATFORM in
        linux|macos)
            cat > "$DIST_PATH/bettergimp.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./backend/bettergimp-backend &
BACKEND_PID=$!
./frontend/bettergimp
kill $BACKEND_PID 2>/dev/null || true
EOF
            chmod +x "$DIST_PATH/bettergimp.sh"
            ;;
        windows)
            cat > "$DIST_PATH/bettergimp.bat" << 'EOF'
@echo off
cd /d "%~dp0"
start /b backend\bettergimp-backend.exe
frontend\bettergimp.exe
taskkill /f /im bettergimp-backend.exe >nul 2>&1
EOF
            ;;
    esac
    
    # Create archive
    cd "$DIST_DIR"
    case $PLATFORM in
        linux|macos)
            tar -czf "$DIST_NAME.tar.gz" "$DIST_NAME/"
            log_success "Created: $DIST_DIR/$DIST_NAME.tar.gz"
            ;;
        windows)
            zip -r "$DIST_NAME.zip" "$DIST_NAME/"
            log_success "Created: $DIST_DIR/$DIST_NAME.zip"
            ;;
    esac
    cd ..
}

# Clean build artifacts
clean() {
    log_info "Cleaning build artifacts..."
    rm -rf "$BUILD_DIR" "$DIST_DIR"
    rm -rf core-cpp/build
    rm -rf backend-python/build backend-python/dist backend-python/venv
    rm -rf frontend-electron/build frontend-electron/dist
    log_success "Clean completed"
}

# Main function
main() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}    $PROJECT_NAME Build Script${NC}"
    echo -e "${BLUE}=====================================${NC}"
    
    # Parse arguments
    case "${1:-all}" in
        clean)
            clean
            ;;
        cpp|core)
            detect_platform
            setup_environment
            build_cpp_core
            ;;
        python|backend)
            detect_platform
            setup_environment
            build_python_backend
            ;;
        electron|frontend)
            detect_platform
            setup_environment
            build_electron_frontend
            ;;
        dist|package)
            detect_platform
            create_distribution
            ;;
        all|*)
            detect_platform
            setup_environment
            build_cpp_core
            build_python_backend
            build_electron_frontend
            create_distribution
            ;;
    esac
    
    log_success "Build completed successfully!"
}

# Check if vcpkg is available
if [ -z "${VCPKG_ROOT:-}" ]; then
    if [ -d "/opt/vcpkg" ]; then
        export VCPKG_ROOT="/opt/vcpkg"
    elif [ -d "$HOME/vcpkg" ]; then
        export VCPKG_ROOT="$HOME/vcpkg"
    else
        log_error "VCPKG_ROOT not set and vcpkg not found in standard locations"
        exit 1
    fi
fi

# Run main function
main "$@"
