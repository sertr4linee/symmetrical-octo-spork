#include "bettergimp/image/image_processor.hpp"
#include <opencv2/imgproc.hpp>
#include <tbb/parallel_for.h>
#include <algorithm>
#include <thread>
#include <vector>
#include <cctype>

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

Image ImageProcessor::adjustSaturation(const Image& input, double saturation) {
    if (input.channels() != 3) {
        throw std::runtime_error("Saturation adjustment requires 3-channel image");
    }
    
    Image hsv = input.convertColorSpace(cv::COLOR_BGR2HSV);
    cv::Mat& hsv_data = hsv.data();
    
    std::vector<cv::Mat> channels;
    cv::split(hsv_data, channels);
    
    // Adjust saturation channel (index 1)
    double factor = (saturation + 100.0) / 100.0;
    channels[1].convertTo(channels[1], -1, factor);
    
    cv::merge(channels, hsv_data);
    return hsv.convertColorSpace(cv::COLOR_HSV2BGR);
}

Image ImageProcessor::adjustHue(const Image& input, double hue_shift) {
    if (input.channels() != 3) {
        throw std::runtime_error("Hue adjustment requires 3-channel image");
    }
    
    Image hsv = input.convertColorSpace(cv::COLOR_BGR2HSV);
    cv::Mat& hsv_data = hsv.data();
    
    std::vector<cv::Mat> channels;
    cv::split(hsv_data, channels);
    
    // Adjust hue channel (index 0) - OpenCV uses 0-179 for hue
    cv::add(channels[0], cv::Scalar(hue_shift * 179.0 / 360.0), channels[0]);
    
    cv::merge(channels, hsv_data);
    return hsv.convertColorSpace(cv::COLOR_HSV2BGR);
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

Image ImageProcessor::medianBlur(const Image& input, int kernel_size) {
    // Ensure kernel size is odd
    if (kernel_size % 2 == 0) {
        kernel_size++;
    }
    
    Image result;
    cv::medianBlur(input.data(), result.data(), kernel_size);
    return result;
}

Image ImageProcessor::bilateralFilter(const Image& input, int d, double sigma_color, double sigma_space) {
    Image result;
    cv::bilateralFilter(input.data(), result.data(), d, sigma_color, sigma_space);
    return result;
}

Image ImageProcessor::resize(const Image& input, int new_width, int new_height, int interpolation) {
    Image result;
    cv::resize(input.data(), result.data(), cv::Size(new_width, new_height), 0, 0, interpolation);
    return result;
}

Image ImageProcessor::resizeBicubic(const Image& input, int new_width, int new_height) {
    return resize(input, new_width, new_height, cv::INTER_CUBIC);
}

Image ImageProcessor::resizeLanczos(const Image& input, int new_width, int new_height) {
    return resize(input, new_width, new_height, cv::INTER_LANCZOS4);
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

Image ImageProcessor::flip(const Image& input, int flip_code) {
    Image result;
    cv::flip(input.data(), result.data(), flip_code);
    return result;
}

Image ImageProcessor::affineTransform(const Image& input, const cv::Mat& transform_matrix) {
    Image result;
    cv::warpAffine(input.data(), result.data(), transform_matrix, 
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

Image ImageProcessor::adjustCurves(const Image& input, const std::vector<cv::Point2f>& curve_points) {
    if (curve_points.size() < 2) {
        return input.clone();
    }
    
    // Create lookup table from curve points
    cv::Mat lut(1, 256, CV_8UC1);
    uchar* lut_data = lut.ptr<uchar>();
    
    // Interpolate curve points to create full LUT
    for (int i = 0; i < 256; i++) {
        float x = i / 255.0f;
        float y = x; // Default identity
        
        // Find surrounding points and interpolate
        for (size_t j = 0; j < curve_points.size() - 1; j++) {
            if (x >= curve_points[j].x && x <= curve_points[j + 1].x) {
                float t = (x - curve_points[j].x) / (curve_points[j + 1].x - curve_points[j].x);
                y = curve_points[j].y + t * (curve_points[j + 1].y - curve_points[j].y);
                break;
            }
        }
        
        lut_data[i] = cv::saturate_cast<uchar>(y * 255.0f);
    }
    
    Image result;
    cv::LUT(input.data(), lut, result.data());
    return result;
}

Image ImageProcessor::adjustLevels(const Image& input, double input_min, double input_max, 
                                  double gamma, double output_min, double output_max) {
    Image result = input.clone();
    cv::Mat& data = result.data();
    
    // Normalize to [0,1] range
    data.convertTo(data, CV_32F, 1.0/255.0);
    
    // Apply input levels
    cv::subtract(data, cv::Scalar(input_min / 255.0), data);
    cv::divide(data, cv::Scalar((input_max - input_min) / 255.0), data);
    
    // Apply gamma correction
    cv::pow(data, gamma, data);
    
    // Apply output levels
    cv::multiply(data, cv::Scalar((output_max - output_min) / 255.0), data);
    cv::add(data, cv::Scalar(output_min / 255.0), data);
    
    // Convert back to 8-bit
    data.convertTo(data, CV_8U, 255.0);
    
    return result;
}

Image ImageProcessor::autoLevels(const Image& input) {
    cv::Mat gray;
    if (input.channels() == 3) {
        cv::cvtColor(input.data(), gray, cv::COLOR_BGR2GRAY);
    } else {
        gray = input.data();
    }
    
    double min_val, max_val;
    cv::minMaxLoc(gray, &min_val, &max_val);
    
    return adjustLevels(input, min_val, max_val, 1.0, 0.0, 255.0);
}

Image ImageProcessor::autoContrast(const Image& input) {
    return autoLevels(input); // Simple implementation - same as auto levels
}

bool ImageProcessor::supportedFormat(const std::string& extension) const {
    static const std::vector<std::string> supported = {
        ".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp", ".webp", ".exr", ".hdr"
    };
    
    std::string lower_ext = extension;
    std::transform(lower_ext.begin(), lower_ext.end(), lower_ext.begin(), ::tolower);
    
    return std::find(supported.begin(), supported.end(), lower_ext) != supported.end();
}

std::vector<std::string> ImageProcessor::getSupportedFormats() const {
    return {".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp", ".webp", ".exr", ".hdr"};
}

} // namespace bettergimp
