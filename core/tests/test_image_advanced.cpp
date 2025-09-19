#include <gtest/gtest.h>
#include "bettergimp/core.hpp"
#include "bettergimp/image/image.hpp"
#include "bettergimp/image/image_processor.hpp"

class ImageAdvancedTest : public ::testing::Test {
protected:
    void SetUp() override {
        ASSERT_TRUE(bettergimp::initialize(4));
        
        // Create a test image
        test_image = bettergimp::Image(100, 100, CV_8UC3);
        test_image.data() = cv::Scalar(128, 128, 128);
        
        // Create a grayscale test image
        gray_image = bettergimp::Image(100, 100, CV_8UC1);
        gray_image.data() = cv::Scalar(128);
    }
    
    void TearDown() override {
        bettergimp::cleanup();
    }
    
    bettergimp::Image test_image;
    bettergimp::Image gray_image;
    bettergimp::ImageProcessor processor;
};

TEST_F(ImageAdvancedTest, ColorSpaceConversions) {
    // Test RGB conversion
    bettergimp::Image rgb = test_image.toRGB();
    EXPECT_EQ(rgb.channels(), 3);
    EXPECT_FALSE(rgb.empty());
    
    // Test grayscale conversion
    bettergimp::Image gray = test_image.toGray();
    EXPECT_EQ(gray.channels(), 1);
    EXPECT_FALSE(gray.empty());
    
    // Test HSV conversion
    bettergimp::Image hsv = test_image.toHSV();
    EXPECT_EQ(hsv.channels(), 3);
    EXPECT_FALSE(hsv.empty());
    
    // Test LAB conversion
    bettergimp::Image lab = test_image.toLAB();
    EXPECT_EQ(lab.channels(), 3);
    EXPECT_FALSE(lab.empty());
}

TEST_F(ImageAdvancedTest, BitDepthConversions) {
    // Test bit depth detection
    EXPECT_EQ(test_image.bitDepth(), 8);
    
    // Test 16-bit conversion
    bettergimp::Image img16 = test_image.to16Bit();
    EXPECT_EQ(img16.bitDepth(), 16);
    EXPECT_FALSE(img16.empty());
    
    // Test 32-bit conversion
    bettergimp::Image img32 = test_image.to32Bit();
    EXPECT_EQ(img32.bitDepth(), 32);
    EXPECT_FALSE(img32.empty());
    
    // Test conversion back to 8-bit
    bettergimp::Image img8 = img16.to8Bit();
    EXPECT_EQ(img8.bitDepth(), 8);
}

TEST_F(ImageAdvancedTest, AdvancedFiltering) {
    // Test median blur
    bettergimp::Image median = processor.medianBlur(test_image, 5);
    EXPECT_FALSE(median.empty());
    EXPECT_EQ(median.width(), test_image.width());
    EXPECT_EQ(median.height(), test_image.height());
    
    // Test bilateral filter
    bettergimp::Image bilateral = processor.bilateralFilter(test_image, 9, 75.0, 75.0);
    EXPECT_FALSE(bilateral.empty());
    EXPECT_EQ(bilateral.width(), test_image.width());
    EXPECT_EQ(bilateral.height(), test_image.height());
}

TEST_F(ImageAdvancedTest, GeometricTransforms) {
    // Test bicubic resize
    bettergimp::Image bicubic = processor.resizeBicubic(test_image, 200, 200);
    EXPECT_EQ(bicubic.width(), 200);
    EXPECT_EQ(bicubic.height(), 200);
    
    // Test Lanczos resize
    bettergimp::Image lanczos = processor.resizeLanczos(test_image, 50, 50);
    EXPECT_EQ(lanczos.width(), 50);
    EXPECT_EQ(lanczos.height(), 50);
    
    // Test flip
    bettergimp::Image flipped = processor.flip(test_image, 1); // Horizontal flip
    EXPECT_EQ(flipped.width(), test_image.width());
    EXPECT_EQ(flipped.height(), test_image.height());
}

TEST_F(ImageAdvancedTest, ColorAdjustments) {
    // Test saturation adjustment
    bettergimp::Image saturated = processor.adjustSaturation(test_image, 50.0);
    EXPECT_FALSE(saturated.empty());
    EXPECT_EQ(saturated.channels(), 3);
    
    // Test hue adjustment
    bettergimp::Image hue_shifted = processor.adjustHue(test_image, 30.0);
    EXPECT_FALSE(hue_shifted.empty());
    EXPECT_EQ(hue_shifted.channels(), 3);
}

TEST_F(ImageAdvancedTest, LevelsAndCurves) {
    // Test auto levels
    bettergimp::Image auto_levels = processor.autoLevels(test_image);
    EXPECT_FALSE(auto_levels.empty());
    EXPECT_EQ(auto_levels.width(), test_image.width());
    EXPECT_EQ(auto_levels.height(), test_image.height());
    
    // Test manual levels adjustment
    bettergimp::Image levels = processor.adjustLevels(test_image, 0.0, 255.0, 1.0, 0.0, 255.0);
    EXPECT_FALSE(levels.empty());
    
    // Test curves adjustment
    std::vector<cv::Point2f> curve_points = {
        cv::Point2f(0.0f, 0.0f),
        cv::Point2f(0.5f, 0.6f),
        cv::Point2f(1.0f, 1.0f)
    };
    bettergimp::Image curves = processor.adjustCurves(test_image, curve_points);
    EXPECT_FALSE(curves.empty());
}

TEST_F(ImageAdvancedTest, FormatSupport) {
    // Test format support detection
    EXPECT_TRUE(processor.supportedFormat(".jpg"));
    EXPECT_TRUE(processor.supportedFormat(".png"));
    EXPECT_TRUE(processor.supportedFormat(".tiff"));
    EXPECT_FALSE(processor.supportedFormat(".xyz"));
    
    // Test case insensitive
    EXPECT_TRUE(processor.supportedFormat(".JPG"));
    EXPECT_TRUE(processor.supportedFormat(".PNG"));
    
    // Test supported formats list
    auto formats = processor.getSupportedFormats();
    EXPECT_GT(formats.size(), 0);
    EXPECT_TRUE(std::find(formats.begin(), formats.end(), ".jpg") != formats.end());
}
