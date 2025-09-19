#include "bettergimp/core.hpp"
#include "bettergimp/image/image.hpp"
#include "bettergimp/image/image_processor.hpp"
#include <iostream>
#include <opencv2/opencv.hpp>

int main() {
    // Initialize Better GIMP Core
    if (!bettergimp::initialize(4)) {
        std::cerr << "Failed to initialize Better GIMP Core" << std::endl;
        return -1;
    }
    
    std::cout << "Better GIMP Core Demo - Image Processing Functions" << std::endl;
    std::cout << "Version: " << bettergimp::getVersion() << std::endl;
    std::cout << "SIMD Available: " << (bettergimp::isSimdAvailable() ? "Yes" : "No") << std::endl;
    std::cout << std::endl;
    
    // Create a test image
    bettergimp::Image test_image(512, 512, CV_8UC3);
    
    // Fill with a gradient pattern
    cv::Mat& data = test_image.data();
    for (int y = 0; y < 512; y++) {
        for (int x = 0; x < 512; x++) {
            data.at<cv::Vec3b>(y, x) = cv::Vec3b(
                static_cast<uchar>(x / 2),     // Red gradient
                static_cast<uchar>(y / 2),     // Green gradient  
                static_cast<uchar>(128)        // Blue constant
            );
        }
    }
    
    bettergimp::ImageProcessor processor;
    
    // Demonstrate image properties
    std::cout << "Original Image Properties:" << std::endl;
    std::cout << "  Size: " << test_image.width() << "x" << test_image.height() << std::endl;
    std::cout << "  Channels: " << test_image.channels() << std::endl;
    std::cout << "  Bit Depth: " << test_image.bitDepth() << " bits" << std::endl;
    std::cout << "  Data Size: " << test_image.dataSize() << " bytes" << std::endl;
    std::cout << std::endl;
    
    // Test color space conversions
    std::cout << "Testing Color Space Conversions:" << std::endl;
    
    auto gray = test_image.toGray();
    std::cout << "  Grayscale: " << gray.width() << "x" << gray.height() 
              << ", " << gray.channels() << " channels" << std::endl;
    
    auto hsv = test_image.toHSV();
    std::cout << "  HSV: " << hsv.width() << "x" << hsv.height() 
              << ", " << hsv.channels() << " channels" << std::endl;
    
    auto lab = test_image.toLAB();
    std::cout << "  LAB: " << lab.width() << "x" << lab.height() 
              << ", " << lab.channels() << " channels" << std::endl;
    std::cout << std::endl;
    
    // Test bit depth conversions
    std::cout << "Testing Bit Depth Conversions:" << std::endl;
    
    auto img16 = test_image.to16Bit();
    std::cout << "  16-bit: " << img16.bitDepth() << " bits, " 
              << img16.dataSize() << " bytes" << std::endl;
    
    auto img32 = test_image.to32Bit();
    std::cout << "  32-bit: " << img32.bitDepth() << " bits, " 
              << img32.dataSize() << " bytes" << std::endl;
    std::cout << std::endl;
    
    // Test geometric transformations
    std::cout << "Testing Geometric Transformations:" << std::endl;
    
    auto resized = processor.resizeBicubic(test_image, 256, 256);
    std::cout << "  Bicubic Resize: " << resized.width() << "x" << resized.height() << std::endl;
    
    auto rotated = processor.rotate(test_image, 45.0);
    std::cout << "  Rotation (45°): " << rotated.width() << "x" << rotated.height() << std::endl;
    
    auto flipped = processor.flip(test_image, 1);
    std::cout << "  Horizontal Flip: " << flipped.width() << "x" << flipped.height() << std::endl;
    std::cout << std::endl;
    
    // Test filtering operations
    std::cout << "Testing Filter Operations:" << std::endl;
    
    auto blurred = processor.gaussianBlur(test_image, 5.0);
    std::cout << "  Gaussian Blur: Applied with sigma=5.0" << std::endl;
    
    auto sharpened = processor.unsharpMask(test_image, 1.0, 0.5);
    std::cout << "  Unsharp Mask: Applied with sigma=1.0, strength=0.5" << std::endl;
    
    auto median = processor.medianBlur(test_image, 5);
    std::cout << "  Median Blur: Applied with kernel size=5" << std::endl;
    
    auto bilateral = processor.bilateralFilter(test_image, 9, 75.0, 75.0);
    std::cout << "  Bilateral Filter: Applied with d=9" << std::endl;
    std::cout << std::endl;
    
    // Test color adjustments
    std::cout << "Testing Color Adjustments:" << std::endl;
    
    auto brighter = processor.adjustBrightness(test_image, 20.0);
    std::cout << "  Brightness: +20" << std::endl;
    
    auto contrasted = processor.adjustContrast(test_image, 30.0);
    std::cout << "  Contrast: +30%" << std::endl;
    
    auto saturated = processor.adjustSaturation(test_image, 50.0);
    std::cout << "  Saturation: +50%" << std::endl;
    
    auto hue_shifted = processor.adjustHue(test_image, 30.0);
    std::cout << "  Hue Shift: +30°" << std::endl;
    std::cout << std::endl;
    
    // Test advanced adjustments
    std::cout << "Testing Advanced Adjustments:" << std::endl;
    
    auto auto_levels = processor.autoLevels(test_image);
    std::cout << "  Auto Levels: Applied" << std::endl;
    
    auto levels = processor.adjustLevels(test_image, 10.0, 245.0, 1.2, 0.0, 255.0);
    std::cout << "  Manual Levels: Applied with gamma=1.2" << std::endl;
    
    std::vector<cv::Point2f> curve_points = {
        cv::Point2f(0.0f, 0.0f),
        cv::Point2f(0.3f, 0.2f),
        cv::Point2f(0.7f, 0.8f),
        cv::Point2f(1.0f, 1.0f)
    };
    auto curves = processor.adjustCurves(test_image, curve_points);
    std::cout << "  Curves: Applied S-curve" << std::endl;
    std::cout << std::endl;
    
    // Test format support
    std::cout << "Supported Image Formats:" << std::endl;
    auto formats = processor.getSupportedFormats();
    for (const auto& format : formats) {
        std::cout << "  " << format;
    }
    std::cout << std::endl << std::endl;
    
    // Performance test
    std::cout << "Performance Test (1000 iterations of brightness adjustment):" << std::endl;
    auto start = cv::getTickCount();
    for (int i = 0; i < 1000; i++) {
        auto result = processor.adjustBrightness(test_image, 10.0);
    }
    auto end = cv::getTickCount();
    double duration = (end - start) / cv::getTickFrequency();
    std::cout << "  Time: " << duration << " seconds" << std::endl;
    std::cout << "  Rate: " << 1000.0 / duration << " operations/second" << std::endl;
    std::cout << std::endl;
    
    std::cout << "Demo completed successfully!" << std::endl;
    
    // Cleanup
    bettergimp::cleanup();
    return 0;
}
