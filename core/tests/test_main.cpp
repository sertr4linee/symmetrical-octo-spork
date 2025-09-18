#include <gtest/gtest.h>
#include <opencv2/opencv.hpp>

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    
    // Initialize OpenCV (useful for debugging)
    cv::utils::logging::setLogLevel(cv::utils::logging::LOG_LEVEL_WARNING);
    
    std::cout << "Running Better GIMP Core Tests..." << std::endl;
    std::cout << "OpenCV Version: " << CV_VERSION << std::endl;
    
    return RUN_ALL_TESTS();
}
