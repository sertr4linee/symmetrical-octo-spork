# Better GIMP
*A modern, high-performance image editor built with C++, Python, and Electron*

[![Build Status](https://github.com/sertr4linee/symmetrical-octo-spork/workflows/Build%20and%20Deploy%20Better%20GIMP/badge.svg)](https://github.com/sertr4linee/symmetrical-octo-spork/actions)
[![Release](https://img.shields.io/github/v/release/sertr4linee/symmetrical-octo-spork)](https://github.com/sertr4linee/symmetrical-octo-spork/releases)
[![License](https://img.shields.io/github/license/sertr4linee/symmetrical-octo-spork)](LICENSE)

## 📋 Overview

Better GIMP is a modern alternative to traditional image editing software, combining the power of GIMP with contemporary UI/UX design and optimized performance architecture.

### 🏗️ Architecture

```
┌─────────────┐    ┌──────────────┐    ┌────────────┐
│ Electron UI │◄──►│ Python API   │◄──►│ C++ Core   │
│             │    │              │    │            │
│ • React     │    │ • FastAPI    │    │ • OpenCV   │
│ • Canvas    │    │ • Pydantic   │    │ • SIMD     │
│ • IPC       │    │ • SQLAlchemy │    │ • Threading│
└─────────────┘    └──────────────┘    └────────────┘
       │                    │                   │
       │                    │                   │
       ▼                    ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌────────────┐
│ Local       │    │ Preferences  │    │ Image      │
│ Storage     │    │ Database     │    │ Buffers    │
└─────────────┘    └──────────────┘    └────────────┘
```
