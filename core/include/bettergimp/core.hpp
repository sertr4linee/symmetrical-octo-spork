#pragma once

/**
 * @file core.hpp
 * @brief Main header file for Better GIMP Core library
 * @version 0.1.0
 */

#include <opencv2/opencv.hpp>
#include <tbb/tbb.h>
#include <Eigen/Dense>

// Forward declarations
namespace bettergimp {
    class Image;
    class ImageProcessor;
    class FilterBase;
}

// Core components
#include "bettergimp/image/image.hpp"
#include "bettergimp/image/image_processor.hpp"

/**
 * @namespace bettergimp
 * @brief Main namespace for Better GIMP Core library
 */
namespace bettergimp {

/**
 * @brief Get library version string
 * @return Version string in format "major.minor.patch"
 */
const char* getVersion();

/**
 * @brief Initialize Better GIMP Core library
 * @param num_threads Number of threads to use (0 = auto-detect)
 * @return true if initialization successful
 */
bool initialize(int num_threads = 0);

/**
 * @brief Cleanup Better GIMP Core library resources
 */
void cleanup();

/**
 * @brief Check if SIMD optimizations are available
 * @return true if SIMD optimizations are enabled and supported
 */
bool isSimdAvailable();

} // namespace bettergimp
