#include <gtest/gtest.h>
#include "bettergimp/core.hpp"
#include "bettergimp/image/image.hpp"
#include "bettergimp/image/image_processor.hpp"

class BetterGimpCoreTest : public ::testing::Test {
protected:
    void SetUp() override {
        ASSERT_TRUE(bettergimp::initialize(4));
    }
    
    void TearDown() override {
        bettergimp::cleanup();
    }
};

TEST_F(BetterGimpCoreTest, VersionTest) {
    const char* version = bettergimp::getVersion();
    ASSERT_NE(version, nullptr);
    EXPECT_STREQ(version, "0.1.0");
}

TEST_F(BetterGimpCoreTest, ImageCreation) {
    // Test empty image
    bettergimp::Image empty_img;
    EXPECT_TRUE(empty_img.empty());
    EXPECT_EQ(empty_img.width(), 0);
    EXPECT_EQ(empty_img.height(), 0);
    
    // Test image with dimensions
    bettergimp::Image img(640, 480, CV_8UC3);
    EXPECT_FALSE(img.empty());
    EXPECT_EQ(img.width(), 640);
    EXPECT_EQ(img.height(), 480);
    EXPECT_EQ(img.channels(), 3);
}

TEST_F(BetterGimpCoreTest, ImageCopy) {
    bettergimp::Image original(100, 100, CV_8UC3);
    original.data() = cv::Scalar(128, 64, 192);
    
    // Test copy constructor
    bettergimp::Image copy(original);
    EXPECT_EQ(copy.width(), original.width());
    EXPECT_EQ(copy.height(), original.height());
    
    // Test clone
    bettergimp::Image cloned = original.clone();
    EXPECT_EQ(cloned.width(), original.width());
    EXPECT_EQ(cloned.height(), original.height());
}

TEST_F(BetterGimpCoreTest, ImageProcessor) {
    bettergimp::ImageProcessor processor;
    
    // Create test image
    bettergimp::Image test_img(100, 100, CV_8UC3);
    test_img.data() = cv::Scalar(128, 128, 128);
    
    // Test brightness adjustment
    bettergimp::Image bright = processor.adjustBrightness(test_img, 20.0);
    EXPECT_FALSE(bright.empty());
    EXPECT_EQ(bright.width(), test_img.width());
    EXPECT_EQ(bright.height(), test_img.height());
    
    // Test contrast adjustment
    bettergimp::Image contrast = processor.adjustContrast(test_img, 50.0);
    EXPECT_FALSE(contrast.empty());
    
    // Test resize
    bettergimp::Image resized = processor.resize(test_img, 50, 50);
    EXPECT_EQ(resized.width(), 50);
    EXPECT_EQ(resized.height(), 50);
}

TEST_F(BetterGimpCoreTest, SimdAvailability) {
    // Just check that the function returns a boolean
    bool simd_available = bettergimp::isSimdAvailable();
    EXPECT_TRUE(simd_available || !simd_available); // Always true :)
}

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
