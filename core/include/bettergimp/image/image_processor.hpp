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
    Image adjustSaturation(const Image& input, double saturation);
    Image adjustHue(const Image& input, double hue_shift);
    
    // Filtering
    Image gaussianBlur(const Image& input, double sigma_x, double sigma_y = 0.0);
    Image unsharpMask(const Image& input, double sigma, double strength, double threshold = 0.0);
    Image medianBlur(const Image& input, int kernel_size);
    Image bilateralFilter(const Image& input, int d, double sigma_color, double sigma_space);
    
    // Geometric transforms
    Image resize(const Image& input, int new_width, int new_height, int interpolation = cv::INTER_LINEAR);
    Image resizeBicubic(const Image& input, int new_width, int new_height);
    Image resizeLanczos(const Image& input, int new_width, int new_height);
    Image rotate(const Image& input, double angle, const cv::Point2f& center = cv::Point2f(-1, -1));
    Image flip(const Image& input, int flip_code);
    Image affineTransform(const Image& input, const cv::Mat& transform_matrix);
    
    // Color space conversions
    Image convertColorSpace(const Image& input, int code);
    
    // Advanced adjustments
    Image adjustCurves(const Image& input, const std::vector<cv::Point2f>& curve_points);
    Image adjustLevels(const Image& input, double input_min, double input_max, 
                      double gamma, double output_min, double output_max);
    Image autoLevels(const Image& input);
    Image autoContrast(const Image& input);
    
    // Format support
    bool supportedFormat(const std::string& extension) const;
    std::vector<std::string> getSupportedFormats() const;
    
    // Utility functions
    static cv::Size calculateOptimalSize(const cv::Size& original, int max_dimension);
    static double calculateOptimalSigma(const cv::Size& size);
    
private:
    // Internal state if needed
    bool simd_enabled_;
    int num_threads_;
};

} // namespace bettergimp
