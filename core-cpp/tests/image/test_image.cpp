#include <gtest/gtest.h>
#include <opencv2/opencv.hpp>
#include <bettergimp/image/image.hpp>

class ImageTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Create test images
        test_image_rgb = cv::Mat::zeros(100, 100, CV_8UC3);
        test_image_gray = cv::Mat::zeros(100, 100, CV_8UC1);
        
        // Fill with test pattern
        for (int y = 0; y < test_image_rgb.rows; ++y) {
            for (int x = 0; x < test_image_rgb.cols; ++x) {
                test_image_rgb.at<cv::Vec3b>(y, x) = cv::Vec3b(
                    static_cast<uint8_t>(x * 255 / test_image_rgb.cols),
                    static_cast<uint8_t>(y * 255 / test_image_rgb.rows),
                    128
                );
            }
        }
        
        // Fill grayscale with gradient
        for (int y = 0; y < test_image_gray.rows; ++y) {
            for (int x = 0; x < test_image_gray.cols; ++x) {
                test_image_gray.at<uint8_t>(y, x) = static_cast<uint8_t>(
                    (x + y) * 255 / (test_image_gray.cols + test_image_gray.rows)
                );
            }
        }
    }
    
    cv::Mat test_image_rgb;
    cv::Mat test_image_gray;
};

TEST_F(ImageTest, CreateImage) {
    // Test image creation
    BetterGimp::Image img(test_image_rgb);
    
    EXPECT_EQ(img.width(), 100);
    EXPECT_EQ(img.height(), 100);
    EXPECT_EQ(img.channels(), 3);
    EXPECT_FALSE(img.empty());
}

TEST_F(ImageTest, ImageFormat) {
    // Test different color formats
    BetterGimp::Image rgb_img(test_image_rgb);
    BetterGimp::Image gray_img(test_image_gray);
    
    EXPECT_EQ(rgb_img.format(), BetterGimp::ColorFormat::RGB);
    EXPECT_EQ(gray_img.format(), BetterGimp::ColorFormat::GRAYSCALE);
}

TEST_F(ImageTest, ImageCopy) {
    BetterGimp::Image original(test_image_rgb);
    BetterGimp::Image copy = original;
    
    EXPECT_EQ(copy.width(), original.width());
    EXPECT_EQ(copy.height(), original.height());
    EXPECT_EQ(copy.channels(), original.channels());
    
    // Verify data is actually copied (deep copy)
    cv::Mat orig_data = original.data();
    cv::Mat copy_data = copy.data();
    
    // Modify original
    orig_data.at<cv::Vec3b>(0, 0) = cv::Vec3b(255, 255, 255);
    
    // Copy should remain unchanged
    EXPECT_NE(copy_data.at<cv::Vec3b>(0, 0)[0], 255);
}

TEST_F(ImageTest, ImageMove) {
    BetterGimp::Image original(test_image_rgb);
    int orig_width = original.width();
    int orig_height = original.height();
    
    BetterGimp::Image moved = std::move(original);
    
    EXPECT_EQ(moved.width(), orig_width);
    EXPECT_EQ(moved.height(), orig_height);
    EXPECT_TRUE(original.empty());  // Original should be empty after move
}

TEST_F(ImageTest, ColorSpaceConversion) {
    BetterGimp::Image rgb_img(test_image_rgb);
    
    // Convert to grayscale
    BetterGimp::Image gray_img = rgb_img.convertTo(BetterGimp::ColorFormat::GRAYSCALE);
    EXPECT_EQ(gray_img.channels(), 1);
    EXPECT_EQ(gray_img.format(), BetterGimp::ColorFormat::GRAYSCALE);
    
    // Convert back to RGB
    BetterGimp::Image rgb_converted = gray_img.convertTo(BetterGimp::ColorFormat::RGB);
    EXPECT_EQ(rgb_converted.channels(), 3);
    EXPECT_EQ(rgb_converted.format(), BetterGimp::ColorFormat::RGB);
}

TEST_F(ImageTest, BitDepthConversion) {
    BetterGimp::Image img_8bit(test_image_rgb);
    
    // Convert to 16-bit
    BetterGimp::Image img_16bit = img_8bit.convertTo16Bit();
    EXPECT_EQ(img_16bit.depth(), CV_16U);
    
    // Convert to 32-bit float
    BetterGimp::Image img_32bit = img_8bit.convertTo32Bit();
    EXPECT_EQ(img_32bit.depth(), CV_32F);
    
    // Values should be properly scaled
    cv::Mat data_8 = img_8bit.data();
    cv::Mat data_16 = img_16bit.data();
    cv::Mat data_32 = img_32bit.data();
    
    uint8_t val_8 = data_8.at<cv::Vec3b>(10, 10)[0];
    uint16_t val_16 = data_16.at<cv::Vec3w>(10, 10)[0];
    float val_32 = data_32.at<cv::Vec3f>(10, 10)[0];
    
    // Check scaling is approximately correct
    EXPECT_NEAR(val_16, val_8 * 257, 1);  // 8->16 bit scaling
    EXPECT_NEAR(val_32, val_8 / 255.0f, 0.01f);  // 8->32 bit scaling
}

TEST_F(ImageTest, RegionOfInterest) {
    BetterGimp::Image img(test_image_rgb);
    
    // Extract ROI
    cv::Rect roi(10, 10, 50, 50);
    BetterGimp::Image roi_img = img.getROI(roi);
    
    EXPECT_EQ(roi_img.width(), 50);
    EXPECT_EQ(roi_img.height(), 50);
    
    // Verify pixel values match
    cv::Mat orig_data = img.data();
    cv::Mat roi_data = roi_img.data();
    
    cv::Vec3b orig_pixel = orig_data.at<cv::Vec3b>(15, 15);
    cv::Vec3b roi_pixel = roi_data.at<cv::Vec3b>(5, 5);  // (15-10, 15-10)
    
    EXPECT_EQ(orig_pixel[0], roi_pixel[0]);
    EXPECT_EQ(orig_pixel[1], roi_pixel[1]);
    EXPECT_EQ(orig_pixel[2], roi_pixel[2]);
}

TEST_F(ImageTest, ImageStatistics) {
    BetterGimp::Image img(test_image_rgb);
    
    auto stats = img.getStatistics();
    
    // Check that statistics are reasonable
    EXPECT_GT(stats.mean[0], 0);
    EXPECT_GT(stats.mean[1], 0);
    EXPECT_GT(stats.mean[2], 0);
    
    EXPECT_GT(stats.stddev[0], 0);
    EXPECT_GT(stats.stddev[1], 0);
    EXPECT_GT(stats.stddev[2], 0);
    
    EXPECT_GE(stats.min[0], 0);
    EXPECT_LE(stats.max[0], 255);
}

TEST_F(ImageTest, PerformanceBaseline) {
    // Performance baseline test
    const int iterations = 1000;
    
    auto start = std::chrono::high_resolution_clock::now();
    
    for (int i = 0; i < iterations; ++i) {
        BetterGimp::Image img(test_image_rgb);
        BetterGimp::Image copy = img;
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    // Should complete 1000 operations in reasonable time (< 100ms)
    EXPECT_LT(duration.count(), 100000);
    
    std::cout << "Image copy performance: " 
              << duration.count() / iterations << " μs per operation" << std::endl;
}
