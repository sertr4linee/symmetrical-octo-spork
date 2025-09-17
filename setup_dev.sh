#!/bin/bash

# OctoEdit Development Setup Script
# This script helps set up the development environment for all components

set -e  # Exit on any error

echo "🎨 OctoEdit Development Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Check if running on supported OS
check_os() {
    print_section "Checking Operating System"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_status "Detected Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_status "Detected macOS"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        print_status "Detected Windows (Git Bash/Cygwin)"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check for required tools
check_dependencies() {
    print_section "Checking Dependencies"
    
    local missing_deps=()
    
    # Check C++ compiler
    if command -v g++ &> /dev/null || command -v clang++ &> /dev/null; then
        print_status "✓ C++ compiler found"
    else
        print_error "✗ C++ compiler not found (need g++ or clang++)"
        missing_deps+=("C++ compiler")
    fi
    
    # Check CMake
    if command -v cmake &> /dev/null; then
        CMAKE_VERSION=$(cmake --version | head -n1 | cut -d' ' -f3)
        print_status "✓ CMake found (version $CMAKE_VERSION)"
    else
        print_error "✗ CMake not found"
        missing_deps+=("CMake")
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_status "✓ Python found (version $PYTHON_VERSION)"
    else
        print_error "✗ Python 3 not found"
        missing_deps+=("Python 3")
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "✓ Node.js found (version $NODE_VERSION)"
    else
        print_error "✗ Node.js not found"
        missing_deps+=("Node.js")
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "✓ npm found (version $NPM_VERSION)"
    else
        print_error "✗ npm not found"
        missing_deps+=("npm")
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        print_status "✓ Git found (version $GIT_VERSION)"
    else
        print_error "✗ Git not found"
        missing_deps+=("Git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_section "Installation Instructions"
        
        if [[ "$OS" == "linux" ]]; then
            echo "Ubuntu/Debian:"
            echo "  sudo apt update"
            echo "  sudo apt install build-essential cmake python3 python3-pip nodejs npm git"
            echo ""
            echo "Fedora/CentOS:"
            echo "  sudo dnf install gcc-c++ cmake python3 python3-pip nodejs npm git"
        elif [[ "$OS" == "macos" ]]; then
            echo "macOS (using Homebrew):"
            echo "  brew install cmake python3 node npm git"
            echo "  xcode-select --install  # For C++ compiler"
        elif [[ "$OS" == "windows" ]]; then
            echo "Windows:"
            echo "  Install Visual Studio Community with C++ support"
            echo "  Install CMake from cmake.org"
            echo "  Install Python from python.org"
            echo "  Install Node.js from nodejs.org"
            echo "  Install Git from git-scm.com"
        fi
        
        exit 1
    fi
}

# Setup C++ build environment
setup_cpp() {
    print_section "Setting up C++ Build Environment"
    
    if [ ! -d "build" ]; then
        mkdir build
        print_status "Created build directory"
    fi
    
    cd build
    
    print_status "Running CMake configuration..."
    if cmake .. -DCMAKE_BUILD_TYPE=Debug; then
        print_status "✓ CMake configuration successful"
    else
        print_error "✗ CMake configuration failed"
        cd ..
        return 1
    fi
    
    print_status "Building C++ components..."
    if cmake --build . --parallel; then
        print_status "✓ C++ build successful"
    else
        print_warning "C++ build had issues (expected - missing dependencies)"
    fi
    
    cd ..
}

# Setup Python environment
setup_python() {
    print_section "Setting up Python Environment"
    
    cd python
    
    print_status "Creating Python virtual environment..."
    if python3 -m venv venv; then
        print_status "✓ Virtual environment created"
    else
        print_error "✗ Failed to create virtual environment"
        cd ..
        return 1
    fi
    
    # Activate virtual environment
    if [[ "$OS" == "windows" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    print_status "Installing Python dependencies..."
    if pip install --upgrade pip && pip install -r requirements.txt; then
        print_status "✓ Python dependencies installed"
    else
        print_warning "Some Python dependencies may not have installed correctly"
    fi
    
    deactivate
    cd ..
}

# Setup Node.js/Electron environment
setup_nodejs() {
    print_section "Setting up Node.js/Electron Environment"
    
    cd ui
    
    print_status "Installing Node.js dependencies..."
    if npm install; then
        print_status "✓ Node.js dependencies installed"
    else
        print_error "✗ Failed to install Node.js dependencies"
        cd ..
        return 1
    fi
    
    cd ..
}

# Create development database
setup_database() {
    print_section "Setting up Development Database"
    
    if command -v sqlite3 &> /dev/null; then
        print_status "Creating development database..."
        sqlite3 octoedit_dev.db < database/schemas/octoedit.sql
        print_status "✓ Development database created (octoedit_dev.db)"
    else
        print_warning "SQLite3 not found - database setup skipped"
        print_warning "Install SQLite3 to enable database functionality"
    fi
}

# Create useful development scripts
create_dev_scripts() {
    print_section "Creating Development Scripts"
    
    # Create a convenient development launcher
    cat > dev.sh << 'EOF'
#!/bin/bash
# OctoEdit Development Launcher

case "$1" in
    "build-cpp")
        echo "Building C++ components..."
        cd build && cmake --build . --parallel
        ;;
    "python")
        echo "Activating Python environment..."
        cd python && source venv/bin/activate && bash
        ;;
    "ui")
        echo "Starting UI development server..."
        cd ui && npm run dev
        ;;
    "test-cpp")
        echo "Running C++ tests..."
        cd build && ctest
        ;;
    "test-python")
        echo "Running Python tests..."
        cd python && source venv/bin/activate && pytest
        ;;
    "test-ui")
        echo "Running UI tests..."
        cd ui && npm test
        ;;
    "clean")
        echo "Cleaning build artifacts..."
        rm -rf build/CMakeFiles build/CMakeCache.txt
        cd ui && rm -rf node_modules
        cd ../python && rm -rf venv __pycache__
        ;;
    *)
        echo "OctoEdit Development Launcher"
        echo "Usage: $0 {build-cpp|python|ui|test-cpp|test-python|test-ui|clean}"
        echo ""
        echo "Commands:"
        echo "  build-cpp     - Build C++ components"
        echo "  python        - Enter Python development environment"
        echo "  ui            - Start UI development server"
        echo "  test-cpp      - Run C++ tests"
        echo "  test-python   - Run Python tests"
        echo "  test-ui       - Run UI tests"
        echo "  clean         - Clean all build artifacts"
        ;;
esac
EOF
    
    chmod +x dev.sh
    print_status "✓ Created dev.sh development launcher"
}

# Print setup completion message
print_completion() {
    print_section "Setup Complete! 🎉"
    
    echo -e "${GREEN}Your OctoEdit development environment is ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Read CONTRIBUTING.md for development guidelines"
    echo "  2. Check PROJECT_BREAKDOWN.md for tasks to work on"
    echo "  3. Use ./dev.sh to build and test components"
    echo ""
    echo "Quick commands:"
    echo "  ./dev.sh build-cpp  # Build C++ core"
    echo "  ./dev.sh python     # Enter Python environment"
    echo "  ./dev.sh ui         # Start UI development"
    echo ""
    echo "For issues, check:"
    echo "  - GitHub Issues: https://github.com/sertr4linee/symmetrical-octo-spork/issues"
    echo "  - Documentation: README.md and docs/"
    echo ""
    echo -e "${BLUE}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    check_os
    check_dependencies
    setup_cpp
    setup_python
    setup_nodejs
    setup_database
    create_dev_scripts
    print_completion
}

# Run main function
main "$@"