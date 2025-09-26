# BetterPS - Build & Run Guide

## Quick Start

### 1. Build and run everything (Development)
```bash
./build.sh
# or
./build.sh dev
```

### 2. Build only C++ core
```bash
./build.sh build
```

### 3. Start only the server
```bash
./build.sh server
```

### 4. Start only the UI
```bash
./build.sh ui
```

### 5. Build for production
```bash
./build.sh prod
```

### 6. Stop all services
```bash
./build.sh stop
```

### 7. Clean build artifacts
```bash
./build.sh clean
```

## Prerequisites

### System Dependencies
- **CMake** (3.16+)
- **Make** / **build-essential**
- **Python 3.8+**
- **Node.js** or **Bun**

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install cmake build-essential python3 python3-venv python3-pip nodejs npm
```

### macOS
```bash
brew install cmake python@3.11 node
```

### Arch Linux
```bash
sudo pacman -S cmake make python nodejs npm
```

## Project Structure

```
betterps/
├── build.sh          # Main build script
├── core/             # C++ image processing library
│   ├── CMakeLists.txt
│   ├── src/
│   └── include/
├── server/           # Python FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── src/
└── ui/               # React/TypeScript frontend
    ├── package.json
    ├── src/
    └── public/
```

## Development Workflow

1. **First time setup:**
   ```bash
   ./build.sh dev
   ```

2. **After making C++ changes:**
   ```bash
   ./build.sh build
   ```

3. **Stop everything:**
   ```bash
   ./build.sh stop
   # or Ctrl+C if running in foreground
   ```

4. **Clean and rebuild:**
   ```bash
   ./build.sh clean
   ./build.sh dev
   ```

## Services URLs

When running in development mode:

- **UI (Frontend)**: http://localhost:5173
- **API (Backend)**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Troubleshooting

### Common Issues

1. **CMake not found:**
   ```bash
   sudo apt install cmake
   ```

2. **Python virtual environment issues:**
   ```bash
   ./build.sh clean
   rm -rf server/venv
   ./build.sh dev
   ```

3. **Node modules issues:**
   ```bash
   ./build.sh clean
   ./build.sh dev
   ```

4. **Port already in use:**
   ```bash
   ./build.sh stop
   # Kill any remaining processes
   pkill -f "python main.py"
   pkill -f "bun run dev"
   ```

### Logs

- **Server logs**: Check terminal output where you ran `./build.sh`
- **UI logs**: Check browser developer console
- **Build logs**: CMake and Make output in terminal

## Production Deployment

1. **Build for production:**
   ```bash
   ./build.sh prod
   ```

2. **Deploy components:**
   - Copy `core/build/libbettergimp_core.a` to production server
   - Deploy `server/` directory with Python environment
   - Serve `ui/dist/` with nginx/apache

## Contributing

1. Make changes in respective directories
2. Test with `./build.sh dev`
3. Clean build with `./build.sh clean && ./build.sh dev`
4. Submit PR

## License

[Your License Here]