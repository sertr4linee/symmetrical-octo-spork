#!/bin/bash

# Better GIMP Development Environment Setup
# Sets up all dependencies and tools needed for development

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Detect platform
detect_platform() {
    case "$(uname -s)" in
        Linux*) PLATFORM="linux";;
        Darwin*) PLATFORM="macos";;
        *) PLATFORM="unknown";;
    esac
    log_info "Detected platform: $PLATFORM"
}

# Install system dependencies
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

# Setup vcpkg
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
    
    # Add to shell profile
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

# Setup Python environment
setup_python() {
    log_info "Setting up Python environment..."
    
    # Install Python dependencies
    python3 -m pip install --upgrade pip setuptools wheel
    python3 -m pip install virtualenv
    
    # Create virtual environment for backend
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

# Setup Node.js environment
setup_nodejs() {
    log_info "Setting up Node.js environment..."
    
    # Install global dependencies
    npm install -g @electron/rebuild electron-builder
    
    # Install frontend dependencies
    if [ -d "frontend-electron" ]; then
        cd frontend-electron
        npm install
        cd ..
    fi
    
    log_success "Node.js environment setup completed"
}

# Setup development tools
setup_dev_tools() {
    log_info "Setting up development tools..."
    
    # Install GitHub CLI
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
    
    # Install Docker if not present
    if ! command -v docker >/dev/null 2>&1; then
        log_warning "Docker not found. Please install Docker manually."
    fi
    
    # Install task-master if not present
    if ! command -v task-master >/dev/null 2>&1; then
        log_info "Installing Claude Taskmaster..."
        npm install -g @eyaltoledano/taskmaster
    fi
    
    log_success "Development tools setup completed"
}

# Create initial project structure
create_project_structure() {
    log_info "Creating project structure..."
    
    # Create directories if they don't exist
    mkdir -p core-cpp/{src,include,tests}
    mkdir -p backend-python/{src,tests}
    mkdir -p frontend-electron/{src,public}
    mkdir -p docs
    mkdir -p packaging/{homebrew,arch,snap}
    
    # Create basic files if they don't exist
    touch core-cpp/src/.gitkeep
    touch backend-python/src/.gitkeep
    touch frontend-electron/src/.gitkeep
    touch docs/.gitkeep
    
    log_success "Project structure created"
}

# Setup git hooks
setup_git_hooks() {
    log_info "Setting up git hooks..."
    
    mkdir -p .git/hooks
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Run basic checks before commit

echo "Running pre-commit checks..."

# Check if there are staged files
if git diff --cached --quiet; then
    echo "No staged changes to commit"
    exit 1
fi

# Format C++ code if clang-format is available
if command -v clang-format >/dev/null 2>&1; then
    echo "Formatting C++ code..."
    find core-cpp/src core-cpp/include -name "*.cpp" -o -name "*.hpp" -o -name "*.h" | xargs clang-format -i
fi

# Format Python code if black is available
if command -v black >/dev/null 2>&1; then
    echo "Formatting Python code..."
    black backend-python/src/
fi

# Format TypeScript code if prettier is available
if command -v prettier >/dev/null 2>&1; then
    echo "Formatting TypeScript code..."
    prettier --write frontend-electron/src/
fi

echo "Pre-commit checks completed"
EOF

    chmod +x .git/hooks/pre-commit
    
    log_success "Git hooks setup completed"
}

# Main setup function
main() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}  Better GIMP Development Setup${NC}"
    echo -e "${BLUE}======================================${NC}"
    
    detect_platform
    
    # Check if we're in the right directory
    if [ ! -f "example_prd.txt" ]; then
        log_error "Please run this script from the project root directory"
        exit 1
    fi
    
    install_system_deps
    setup_vcpkg
    setup_python
    setup_nodejs
    setup_dev_tools
    create_project_structure
    setup_git_hooks
    
    log_success "Development environment setup completed!"
    
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Restart your terminal or run: source ~/.bashrc (or ~/.zshrc)"
    echo "2. Run: ./scripts/build.sh to build the project"
    echo "3. Run: task-master list to see available tasks"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

main "$@"
