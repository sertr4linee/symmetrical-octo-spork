#pragma once

#include "bettergimp/image/image.hpp"
#include <memory>

namespace bettergimp {

/**
 * @brief High-level image processing interface
 * 
 * This class provides easy-to-use methods for common image processing
 * operations, with automatic optimization and threading.
 */
class ImageProcessor {
public:
    /**
     * @brief Constructor
     */
    ImageProcessor();
    
    /**
     * @brief Destructor
     */
    ~ImageProcessor() = default;
    
    // Basic adjustments
    Image adjustBrightness(const Image& input, double brightness);
    Image adjustContrast(const Image& input, double contrast);
    Image adjustBrightnessContrast(const Image& input, double brightness, double contrast);
    
    // Filtering
    Image gaussianBlur(const Image& input, double sigma_x, double sigma_y = 0.0);
    Image unsharpMask(const Image& input, double sigma, double strength, double threshold = 0.0);
    
    // Geometric transforms
    Image resize(const Image& input, int new_width, int new_height, int interpolation = cv::INTER_LINEAR);
    Image rotate(const Image& input, double angle, const cv::Point2f& center = cv::Point2f(-1, -1));
    
    // Color space conversions
    Image convertColorSpace(const Image& input, int code);
    
    // Utility functions
    static cv::Size calculateOptimalSize(const cv::Size& original, int max_dimension);
    static double calculateOptimalSigma(const cv::Size& size);
    
private:
    // Internal state if needed
    bool simd_enabled_;
    int num_threads_;
};

} // namespace bettergimp
