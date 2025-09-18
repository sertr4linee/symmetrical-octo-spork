cmake_minimum_required(VERSION 3.20)
project(BetterGimpCore VERSION 1.0.0 LANGUAGES CXX)

# ====================================
# BUILD CONFIGURATION
# ====================================
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Build options
option(BUILD_TESTING "Build tests" ON)
option(BUILD_BENCHMARKS "Build performance benchmarks" OFF)
option(ENABLE_SIMD "Enable SIMD optimizations" ON)
option(ENABLE_PROFILING "Enable profiling support" OFF)
option(BUILD_PYTHON_BINDINGS "Build Python bindings" ON)

# Set default build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# ====================================
# COMPILER FLAGS
# ====================================
set(CMAKE_CXX_FLAGS_DEBUG "-g -O0 -DDEBUG")
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")
set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "-g -O2 -DNDEBUG")

# Platform-specific flags
if(MSVC)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W4")
    if(ENABLE_SIMD)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /arch:AVX2")
    endif()
else()
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wpedantic")
    if(ENABLE_SIMD)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -mavx2 -msse4.1 -mfma")
    endif()
    
    if(ENABLE_PROFILING)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pg")
        set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -pg")
    endif()
endif()

# ====================================
# DEPENDENCIES
# ====================================
find_package(PkgConfig REQUIRED)

# OpenCV
find_package(OpenCV 4.8 REQUIRED COMPONENTS core imgproc imgcodecs)
if(OpenCV_FOUND)
    message(STATUS "OpenCV version: ${OpenCV_VERSION}")
    message(STATUS "OpenCV libraries: ${OpenCV_LIBS}")
endif()

# Intel TBB
find_package(TBB REQUIRED)

# Eigen3
find_package(Eigen3 3.4 REQUIRED NO_MODULE)

# pybind11 for Python bindings
if(BUILD_PYTHON_BINDINGS)
    find_package(pybind11 CONFIG REQUIRED)
endif()

# Testing framework
if(BUILD_TESTING)
    find_package(GTest REQUIRED)
    enable_testing()
endif()

# Benchmarking framework
if(BUILD_BENCHMARKS)
    find_package(benchmark REQUIRED)
endif()

# ====================================
# SOURCE FILES
# ====================================
set(CORE_SOURCES
    src/image/image.cpp
    src/image/image_loader.cpp
    src/image/image_processor.cpp
    src/filters/basic_filters.cpp
    src/filters/gaussian_blur.cpp
    src/filters/unsharp_mask.cpp
    src/transforms/resize.cpp
    src/transforms/rotate.cpp
    src/adjustments/brightness_contrast.cpp
    src/adjustments/curves.cpp
    src/adjustments/levels.cpp
    src/utils/simd_utils.cpp
    src/utils/memory_pool.cpp
)

set(CORE_HEADERS
    include/bettergimp/image/image.hpp
    include/bettergimp/image/image_loader.hpp
    include/bettergimp/image/image_processor.hpp
    include/bettergimp/filters/basic_filters.hpp
    include/bettergimp/filters/gaussian_blur.hpp
    include/bettergimp/filters/unsharp_mask.hpp
    include/bettergimp/transforms/resize.hpp
    include/bettergimp/transforms/rotate.hpp
    include/bettergimp/adjustments/brightness_contrast.hpp
    include/bettergimp/adjustments/curves.hpp
    include/bettergimp/adjustments/levels.hpp
    include/bettergimp/utils/simd_utils.hpp
    include/bettergimp/utils/memory_pool.hpp
    include/bettergimp/core.hpp
)

# ====================================
# CORE LIBRARY
# ====================================
add_library(bettergimp_core ${CORE_SOURCES} ${CORE_HEADERS})

target_include_directories(bettergimp_core
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(bettergimp_core
    PUBLIC
        ${OpenCV_LIBS}
        TBB::tbb
        Eigen3::Eigen
)

# SIMD optimizations
if(ENABLE_SIMD)
    target_compile_definitions(bettergimp_core PRIVATE ENABLE_SIMD)
endif()

# ====================================
# PYTHON BINDINGS
# ====================================
if(BUILD_PYTHON_BINDINGS)
    pybind11_add_module(bettergimp_py
        src/python/bindings.cpp
        src/python/image_bindings.cpp
        src/python/filter_bindings.cpp
        src/python/transform_bindings.cpp
    )
    
    target_link_libraries(bettergimp_py PRIVATE bettergimp_core)
    
    # Set properties for Python module
    set_target_properties(bettergimp_py PROPERTIES
        CXX_VISIBILITY_PRESET "hidden"
        INTERPROCEDURAL_OPTIMIZATION TRUE
    )
endif()

# ====================================
# TESTING
# ====================================
if(BUILD_TESTING)
    # Test configuration
    set(TEST_SOURCES
        tests/test_main.cpp
        tests/image/test_image.cpp
        tests/image/test_image_loader.cpp
        tests/image/test_image_processor.cpp
        tests/filters/test_gaussian_blur.cpp
        tests/filters/test_unsharp_mask.cpp
        tests/transforms/test_resize.cpp
        tests/transforms/test_rotate.cpp
        tests/adjustments/test_brightness_contrast.cpp
        tests/adjustments/test_curves.cpp
        tests/adjustments/test_levels.cpp
        tests/utils/test_simd_utils.cpp
        tests/performance/test_performance.cpp
    )
    
    add_executable(bettergimp_tests ${TEST_SOURCES})
    
    target_link_libraries(bettergimp_tests
        PRIVATE
            bettergimp_core
            GTest::gtest
            GTest::gtest_main
            GTest::gmock
    )
    
    target_include_directories(bettergimp_tests
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/tests
    )
    
    # Test discovery
    include(GoogleTest)
    gtest_discover_tests(bettergimp_tests)
    
    # Coverage support
    if(CMAKE_BUILD_TYPE STREQUAL "Debug")
        target_compile_options(bettergimp_tests PRIVATE --coverage)
        target_link_options(bettergimp_tests PRIVATE --coverage)
    endif()
    
    # Copy test data
    file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/tests/data/
         DESTINATION ${CMAKE_CURRENT_BINARY_DIR}/test_data/)
endif()

# ====================================
# BENCHMARKS
# ====================================
if(BUILD_BENCHMARKS)
    set(BENCHMARK_SOURCES
        benchmarks/basic_ops_bench.cpp
        benchmarks/simd_bench.cpp
        benchmarks/memory_bench.cpp
        benchmarks/large_image_bench.cpp
    )
    
    foreach(bench_src ${BENCHMARK_SOURCES})
        get_filename_component(bench_name ${bench_src} NAME_WE)
        add_executable(${bench_name} ${bench_src})
        
        target_link_libraries(${bench_name}
            PRIVATE
                bettergimp_core
                benchmark::benchmark
        )
        
        target_include_directories(${bench_name}
            PRIVATE
                ${CMAKE_CURRENT_SOURCE_DIR}/benchmarks
        )
    endforeach()
endif()

# ====================================
# INSTALLATION
# ====================================
include(GNUInstallDirs)

install(TARGETS bettergimp_core
    EXPORT bettergimp-targets
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

install(DIRECTORY include/
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)

# Install Python module
if(BUILD_PYTHON_BINDINGS)
    install(TARGETS bettergimp_py
        DESTINATION ${CMAKE_INSTALL_PREFIX}/python
    )
endif()

# Export targets
install(EXPORT bettergimp-targets
    FILE bettergimp-config.cmake
    NAMESPACE bettergimp::
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/bettergimp
)

# ====================================
# PACKAGING
# ====================================
set(CPACK_PACKAGE_NAME "BetterGimpCore")
set(CPACK_PACKAGE_VERSION "${PROJECT_VERSION}")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "High-performance image processing core")
set(CPACK_PACKAGE_VENDOR "Better GIMP Project")

include(CPack)
