#include "bettergimp/image/image_processor.hpp"
#include <opencv2/imgproc.hpp>
#include <tbb/parallel_for.h>
#include <algorithm>

namespace bettergimp {

ImageProcessor::ImageProcessor() : simd_enabled_(true), num_threads_(std::thread::hardware_concurrency()) {
#ifndef ENABLE_SIMD
    simd_enabled_ = false;
#endif
}

Image ImageProcessor::adjustBrightness(const Image& input, double brightness) {
    Image result = input.clone();
    cv::Mat& data = result.data();
    
    // Convert brightness from [-100, 100] to additive value
    double beta = brightness * 2.55; // Scale to [0, 255] range
    
    data.convertTo(data, -1, 1.0, beta);
    return result;
}

Image ImageProcessor::adjustContrast(const Image& input, double contrast) {
    Image result = input.clone();
    cv::Mat& data = result.data();
    
    // Convert contrast from [-100, 100] to multiplicative factor
    double alpha = (contrast + 100.0) / 100.0;
    
    data.convertTo(data, -1, alpha, 0.0);
    return result;
}

Image ImageProcessor::adjustBrightnessContrast(const Image& input, double brightness, double contrast) {
    Image result = input.clone();
    cv::Mat& data = result.data();
    
    double alpha = (contrast + 100.0) / 100.0;
    double beta = brightness * 2.55;
    
    data.convertTo(data, -1, alpha, beta);
    return result;
}

Image ImageProcessor::gaussianBlur(const Image& input, double sigma_x, double sigma_y) {
    if (sigma_y <= 0.0) {
        sigma_y = sigma_x;
    }
    
    Image result;
    cv::GaussianBlur(input.data(), result.data(), cv::Size(0, 0), sigma_x, sigma_y);
    return result;
}

Image ImageProcessor::unsharpMask(const Image& input, double sigma, double strength, double threshold) {
    // Create blurred version
    Image blurred = gaussianBlur(input, sigma);
    
    // Calculate unsharp mask
    Image result = input.clone();
    cv::Mat& original = result.data();
    const cv::Mat& blur = blurred.data();
    
    cv::Mat mask;
    cv::subtract(original, blur, mask);
    
    // Apply threshold if specified
    if (threshold > 0.0) {
        cv::Mat thresh_mask;
        cv::threshold(cv::abs(mask), thresh_mask, threshold, 1.0, cv::THRESH_BINARY);
        thresh_mask.convertTo(thresh_mask, mask.type());
        cv::multiply(mask, thresh_mask, mask);
    }
    
    // Apply strength and add back to original
    cv::addWeighted(original, 1.0, mask, strength, 0.0, original);
    
    return result;
}

Image ImageProcessor::resize(const Image& input, int new_width, int new_height, int interpolation) {
    Image result;
    cv::resize(input.data(), result.data(), cv::Size(new_width, new_height), 0, 0, interpolation);
    return result;
}

Image ImageProcessor::rotate(const Image& input, double angle, const cv::Point2f& center) {
    cv::Point2f rotation_center = center;
    if (center.x < 0 || center.y < 0) {
        rotation_center = cv::Point2f(input.width() / 2.0f, input.height() / 2.0f);
    }
    
    cv::Mat rotation_matrix = cv::getRotationMatrix2D(rotation_center, angle, 1.0);
    
    Image result;
    cv::warpAffine(input.data(), result.data(), rotation_matrix, 
                   cv::Size(input.width(), input.height()));
    return result;
}

Image ImageProcessor::convertColorSpace(const Image& input, int code) {
    Image result;
    cv::cvtColor(input.data(), result.data(), code);
    return result;
}

cv::Size ImageProcessor::calculateOptimalSize(const cv::Size& original, int max_dimension) {
    if (original.width <= max_dimension && original.height <= max_dimension) {
        return original;
    }
    
    double scale = static_cast<double>(max_dimension) / std::max(original.width, original.height);
    return cv::Size(
        static_cast<int>(original.width * scale),
        static_cast<int>(original.height * scale)
    );
}

double ImageProcessor::calculateOptimalSigma(const cv::Size& size) {
    // Rule of thumb: sigma should be proportional to image size
    int max_dim = std::max(size.width, size.height);
    return std::max(0.5, max_dim / 1000.0);
}

} // namespace bettergimp
