# Core - C++ Image Processing Engine

Ce dossier contient le moteur de traitement d'images haute performance de Better GIMP, écrit en C++.

## Structure

```
core/
├── src/
│   ├── filters/          # Filtres et effets d'images
│   ├── processing/       # Algorithmes de traitement core
│   └── python_bindings/  # Bindings Python avec pybind11
├── include/              # Headers publics
├── tests/               # Tests unitaires C++
├── CMakeLists.txt       # Configuration CMake
├── CMakePresets.json    # Presets de build
├── conanfile.txt        # Dépendances Conan
└── vcpkg.json          # Dépendances vcpkg
```

## Dépendances

- **OpenCV 4.8+**: Traitement d'images
- **Intel TBB**: Parallélisation
- **Eigen 3.4+**: Calculs matriciels
- **pybind11**: Bindings Python

## Build

```bash
cmake --preset linux-release  # ou macos-release, windows-release
cmake --build --preset linux-release
```
