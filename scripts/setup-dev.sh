#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

detect_platform() {
    case "$(uname -s)" in
        Linux*) PLATFORM="linux";;
        Darwin*) PLATFORM="macos";;
        *) PLATFORM="unknown";;
    esac
    log_info "Detected platform: $PLATFORM"
}

install_system_deps() {
    log_info "Installing system dependencies..."
    
    case $PLATFORM in
        linux)
            if command -v apt-get >/dev/null 2>&1; then
                sudo apt-get update
                sudo apt-get install -y \
                    build-essential cmake ninja-build pkg-config git curl \
                    libtbb-dev libeigen3-dev libopencv-dev \
                    libgtk-3-dev libx11-dev python3 python3-pip \
                    nodejs npm
            elif command -v dnf >/dev/null 2>&1; then
                sudo dnf install -y \
                    gcc-c++ cmake ninja-build pkgconfig git curl \
                    tbb-devel eigen3-devel opencv-devel \
                    gtk3-devel libX11-devel python3 python3-pip \
                    nodejs npm
            elif command -v pacman >/dev/null 2>&1; then
                sudo pacman -S --needed \
                    base-devel cmake ninja pkgconf git curl \
                    intel-tbb eigen opencv \
                    gtk3 libx11 python python-pip \
                    nodejs npm
            fi
            ;;
        macos)
            if ! command -v brew >/dev/null 2>&1; then
                log_info "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            
            brew update
            brew install cmake ninja pkg-config git curl \
                         tbb eigen opencv \
                         python@3.11 node
            ;;
    esac
    
    log_success "System dependencies installed"
}

setup_vcpkg() {
    log_info "Setting up vcpkg..."
    
    VCPKG_DIR="$HOME/vcpkg"
    
    if [ ! -d "$VCPKG_DIR" ]; then
        git clone https://github.com/Microsoft/vcpkg.git "$VCPKG_DIR"
        cd "$VCPKG_DIR"
        git checkout 2024.07.12
        
        case $PLATFORM in
            linux|macos) ./bootstrap-vcpkg.sh ;;
            windows) ./bootstrap-vcpkg.bat ;;
        esac
        
        ./vcpkg integrate install
    else
        log_info "vcpkg already exists, updating..."
        cd "$VCPKG_DIR"
        git pull
    fi
    
    SHELL_PROFILE=""
    if [ -f "$HOME/.bashrc" ]; then
        SHELL_PROFILE="$HOME/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
        SHELL_PROFILE="$HOME/.zshrc"
    fi
    
    if [ -n "$SHELL_PROFILE" ]; then
        if ! grep -q "VCPKG_ROOT" "$SHELL_PROFILE"; then
            echo "export VCPKG_ROOT=$VCPKG_DIR" >> "$SHELL_PROFILE"
            echo "export PATH=\$VCPKG_ROOT:\$PATH" >> "$SHELL_PROFILE"
        fi
    fi
    
    export VCPKG_ROOT="$VCPKG_DIR"
    
    log_success "vcpkg setup completed"
}

setup_python() {
    log_info "Setting up Python environment..."
    
    python3 -m pip install --upgrade pip setuptools wheel
    python3 -m pip install virtualenv
    
    if [ ! -d "backend-python/venv" ]; then
        cd backend-python
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
        deactivate
        cd ..
    fi
    
    log_success "Python environment setup completed"
}

setup_nodejs() {
    log_info "Setting up Node.js environment..."
    
    npm install -g @electron/rebuild electron-builder
    
    if [ -d "frontend-electron" ]; then
        cd frontend-electron
        npm install
        cd ..
    fi
    
    log_success "Node.js environment setup completed"
}

setup_dev_tools() {
    log_info "Setting up development tools..."
    
    case $PLATFORM in
        linux)
            if command -v apt-get >/dev/null 2>&1; then
                curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
                sudo apt-get update
                sudo apt-get install -y gh
            fi
            ;;
        macos)
            brew install gh
            ;;
    esac
    
    if ! command -v docker >/dev/null 2>&1; then
        log_warning "Docker not found. Please install Docker manually."
