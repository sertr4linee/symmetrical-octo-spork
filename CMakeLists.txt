cmake_minimum_required(VERSION 3.20)
project(OctoEditCore 
    VERSION 1.0.0
    DESCRIPTION "OctoEdit - Open Source Image Editor Core Engine"
    LANGUAGES CXX C
)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Compiler-specific options
if(MSVC)
    add_compile_options(/W4 /WX /arch:AVX2)
    add_compile_definitions(_CRT_SECURE_NO_WARNINGS)
else()
    add_compile_options(-Wall -Wextra -Wpedantic -Werror)
    add_compile_options(-mavx2 -mfma)
    
    if(CMAKE_BUILD_TYPE STREQUAL "Debug")
        add_compile_options(-g -O0 -fsanitize=address)
        add_link_options(-fsanitize=address)
    else()
        add_compile_options(-O3 -DNDEBUG)
    endif()
endif()

# Find required packages
find_package(PkgConfig REQUIRED)

# OpenCV for image processing
find_package(OpenCV REQUIRED COMPONENTS core imgproc imgcodecs)
if(OpenCV_FOUND)
    message(STATUS "Found OpenCV version: ${OpenCV_VERSION}")
else()
    message(FATAL_ERROR "OpenCV not found!")
endif()

# SQLite for database
find_package(SQLite3 REQUIRED)
if(SQLite3_FOUND)
    message(STATUS "Found SQLite3")
else()
    message(FATAL_ERROR "SQLite3 not found!")
endif()

# Python for scripting integration
find_package(Python3 COMPONENTS Interpreter Development REQUIRED)
if(Python3_FOUND)
    message(STATUS "Found Python3 version: ${Python3_VERSION}")
else()
    message(FATAL_ERROR "Python3 not found!")
endif()

# Threading support
find_package(Threads REQUIRED)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/core/include
    ${OpenCV_INCLUDE_DIRS}
    ${Python3_INCLUDE_DIRS}
)

# Source files
file(GLOB_RECURSE CORE_SOURCES
    "core/src/*.cpp"
    "core/src/*.c"
)

file(GLOB_RECURSE CORE_HEADERS
    "core/include/*.h"
    "core/include/*.hpp"
)

# Create the core library
add_library(octoedit_core SHARED
    ${CORE_SOURCES}
    ${CORE_HEADERS}
)

# Link libraries
target_link_libraries(octoedit_core
    ${OpenCV_LIBS}
    SQLite::SQLite3
    ${Python3_LIBRARIES}
    Threads::Threads
)

# Set library properties
set_target_properties(octoedit_core PROPERTIES
    VERSION ${PROJECT_VERSION}
    SOVERSION 1
    PUBLIC_HEADER "${CORE_HEADERS}"
)

# Install targets
install(TARGETS octoedit_core
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include/octoedit
)

# Python bindings (using pybind11 if available)
find_package(pybind11 QUIET)
if(pybind11_FOUND)
    pybind11_add_module(octoedit_py python/api/bindings.cpp)
    target_link_libraries(octoedit_py PRIVATE octoedit_core)
    
    # Install Python module
    install(TARGETS octoedit_py
        LIBRARY DESTINATION python/octoedit
    )
endif()

# Testing
enable_testing()
find_package(GTest QUIET)
if(GTest_FOUND)
    file(GLOB_RECURSE TEST_SOURCES "tests/unit/core/*.cpp")
    add_executable(octoedit_tests ${TEST_SOURCES})
    target_link_libraries(octoedit_tests
        octoedit_core
        GTest::gtest_main
    )
    add_test(NAME UnitTests COMMAND octoedit_tests)
endif()

# Documentation
find_package(Doxygen QUIET)
if(Doxygen_FOUND)
    configure_file(${CMAKE_CURRENT_SOURCE_DIR}/docs/Doxyfile.in
                   ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile @ONLY)
    add_custom_target(docs
        ${DOXYGEN_EXECUTABLE} ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile
        WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
        COMMENT "Generating API documentation with Doxygen"
        VERBATIM
    )
endif()

# Print configuration summary
message(STATUS "")
message(STATUS "OctoEdit Core Configuration Summary:")
message(STATUS "  Version: ${PROJECT_VERSION}")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  Install prefix: ${CMAKE_INSTALL_PREFIX}")
message(STATUS "  C++ compiler: ${CMAKE_CXX_COMPILER}")
message(STATUS "  C++ flags: ${CMAKE_CXX_FLAGS}")
message(STATUS "  OpenCV version: ${OpenCV_VERSION}")
message(STATUS "  Python version: ${Python3_VERSION}")
if(pybind11_FOUND)
    message(STATUS "  Python bindings: Enabled")
else()
    message(STATUS "  Python bindings: Disabled (pybind11 not found)")
endif()
if(GTest_FOUND)
    message(STATUS "  Unit tests: Enabled")
else()
    message(STATUS "  Unit tests: Disabled (GTest not found)")
endif()
message(STATUS "")