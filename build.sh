#!/bin/bash

# BetterPS - Build and Run Script
# This script builds the core C++ library, starts the Python server, and launches the UI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE_DIR="$SCRIPT_DIR/core"
SERVER_DIR="$SCRIPT_DIR/server"
UI_DIR="$SCRIPT_DIR/ui"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check C++ build tools
    if ! command_exists cmake; then
        print_error "CMake not found. Please install CMake."
        exit 1
    fi
    
    if ! command_exists make; then
        print_error "Make not found. Please install build-essential."
        exit 1
    fi
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python3 not found. Please install Python 3.8+."
        exit 1
    fi
    
    # Check Node.js/Bun
    if ! command_exists bun && ! command_exists npm; then
        print_error "Neither Bun nor npm found. Please install Node.js or Bun."
        exit 1
    fi
    
    print_success "All dependencies found!"
}

# Function to build C++ core
build_core() {
    print_status "Building C++ core library..."
    
    cd "$CORE_DIR"
    
    # Create build directory if it doesn't exist
    if [ ! -d "build" ]; then
        mkdir build
    fi
    
    cd build
    
    # Configure with CMake
    print_status "Configuring CMake..."
    cmake .. -DCMAKE_BUILD_TYPE=Release
    
    # Build
    print_status "Compiling C++ code..."
    make -j$(nproc)
    
    print_success "C++ core built successfully!"
}

# Function to setup Python environment and start server
start_server() {
    print_status "Setting up Python server..."
    
    cd "$SERVER_DIR"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        # Use Python 3.11 or 3.12 if available, fallback to 3.13
        if command -v python3.11 &> /dev/null; then
            print_status "Using Python 3.11..."
            python3.11 -m venv venv
        elif command -v python3.12 &> /dev/null; then
            print_status "Using Python 3.12..."
            python3.12 -m venv venv
        else
            print_warning "Using Python 3.13 which may have compatibility issues..."
            python3 -m venv venv
        fi
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip and setuptools to latest versions
    print_status "Upgrading pip and setuptools..."
    pip install --upgrade pip setuptools wheel
    
    # Install requirements with compatibility handling
    print_status "Installing Python dependencies..."
    if pip install -r requirements.txt; then
        print_success "Dependencies installed successfully"
    else
        print_warning "Installation failed, trying with compatibility mode..."
        pip install "setuptools<70" wheel
        pip install -r requirements.txt
    fi
    
    # Start server in background
    print_status "Starting Python server..."
    python main.py &
    SERVER_PID=$!
    echo $SERVER_PID > server.pid
    
    # Wait a moment for server to start
    sleep 3
    
    print_success "Python server started (PID: $SERVER_PID)"
}

# Function to start UI
start_ui() {
    print_status "Setting up UI..."
    
    cd "$UI_DIR"
    
    # Install dependencies
    if command_exists bun; then
        print_status "Installing UI dependencies with Bun..."
        bun install
        
        print_status "Starting UI development server..."
        bun run dev &
        UI_PID=$!
    else
        print_status "Installing UI dependencies with npm..."
        npm install
        
        print_status "Starting UI development server..."
        npm run dev &
        UI_PID=$!
    fi
    
    echo $UI_PID > ui.pid
    
    print_success "UI development server started (PID: $UI_PID)"
}

# Function to stop all services
stop_services() {
    print_status "Stopping services..."
    
    # Stop server
    if [ -f "$SERVER_DIR/server.pid" ]; then
        SERVER_PID=$(cat "$SERVER_DIR/server.pid")
        if ps -p $SERVER_PID > /dev/null; then
            kill $SERVER_PID
            print_success "Server stopped (PID: $SERVER_PID)"
        fi
        rm -f "$SERVER_DIR/server.pid"
    fi
    
    # Stop UI
    if [ -f "$UI_DIR/ui.pid" ]; then
        UI_PID=$(cat "$UI_DIR/ui.pid")
        if ps -p $UI_PID > /dev/null; then
            kill $UI_PID
            print_success "UI server stopped (PID: $UI_PID)"
        fi
        rm -f "$UI_DIR/ui.pid"
    fi
}

# Function to show help
show_help() {
    echo "BetterPS Build Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  build     Build only the C++ core"
    echo "  server    Start only the Python server"
    echo "  ui        Start only the UI"
    echo "  dev       Build core and start development servers (default)"
    echo "  prod      Build for production"
    echo "  stop      Stop all running services"
    echo "  clean     Clean build artifacts and virtual environments"
    echo "  reset     Clean everything and rebuild from scratch"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                # Build and start everything for development"
    echo "  $0 dev            # Same as above"
    echo "  $0 build          # Only build the C++ core"
    echo "  $0 stop           # Stop all services"
}

# Function to clean build artifacts
clean_build() {
    print_status "Cleaning build artifacts..."
    
    # Clean C++ build
    if [ -d "$CORE_DIR/build" ]; then
        rm -rf "$CORE_DIR/build"
        print_success "C++ build directory cleaned"
    fi
    
    # Clean Python cache
    find "$SERVER_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find "$SERVER_DIR" -name "*.pyc" -delete 2>/dev/null || true
    print_success "Python cache cleaned"
    
    # Clean UI build
    if [ -d "$UI_DIR/dist" ]; then
        rm -rf "$UI_DIR/dist"
        print_success "UI dist directory cleaned"
    fi
    
    if [ -d "$UI_DIR/node_modules" ]; then
        rm -rf "$UI_DIR/node_modules"
        print_success "UI node_modules cleaned"
    fi
    
    # Clean Python virtual environment
    if [ -d "$SERVER_DIR/venv" ]; then
        rm -rf "$SERVER_DIR/venv"
        print_success "Python virtual environment cleaned"
    fi
    
    print_success "All build artifacts cleaned!"
}

# Function for production build
build_production() {
    print_status "Building for production..."
    
    # Build C++ core
    build_core
    
    # Build UI for production
    cd "$UI_DIR"
    if command_exists bun; then
        bun install
        bun run build
    else
        npm install
        npm run build
    fi
    
    print_success "Production build complete!"
    print_warning "To deploy:"
    print_warning "1. Copy core/build/libbettergimp_core.a to production server"
    print_warning "2. Copy server/ directory with requirements.txt"
    print_warning "3. Copy ui/dist/ directory to web server"
}

# Trap to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    stop_services
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main script logic
case "${1:-dev}" in
    "build")
        check_dependencies
        build_core
        ;;
    "server")
        start_server
        print_status "Server is running. Press Ctrl+C to stop."
        wait
        ;;
    "ui")
        start_ui
        print_status "UI is running. Press Ctrl+C to stop."
        wait
        ;;
    "dev")
        check_dependencies
        build_core
        start_server
        start_ui
        
        print_success "🚀 BetterPS is now running!"
        echo ""
        print_status "Services:"
        print_status "  • C++ Core: Built and ready"
        print_status "  • Python API: http://localhost:8000"
        print_status "  • UI Development: http://localhost:5173"
        echo ""
        print_status "Press Ctrl+C to stop all services..."
        
        # Wait for user to stop
        wait
        ;;
    "prod")
        check_dependencies
        build_production
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        stop_services
        clean_build
        ;;
    "reset")
        stop_services
        clean_build
        print_status "Rebuilding from scratch..."
        check_dependencies
        build_core
        start_server
        start_ui
        
        print_success "🚀 BetterPS has been reset and is now running!"
        echo ""
        print_status "Services:"
        print_status "  • C++ Core: Built and ready"
        print_status "  • Python API: http://localhost:8000"
        print_status "  • UI Development: http://localhost:5173"
        echo ""
        print_status "Press Ctrl+C to stop all services..."
        wait
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac