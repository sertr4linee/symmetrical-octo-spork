#pragma once

#include <opencv2/opencv.hpp>
#include <memory>
#include <string>

namespace bettergimp {

/**
 * @brief Core image class for Better GIMP
 * 
 * This class provides a high-level interface for image manipulation,
 * wrapping OpenCV's cv::Mat with additional functionality.
 */
class Image {
public:
    /**
     * @brief Default constructor - creates empty image
     */
    Image();
    
    /**
     * @brief Constructor from OpenCV Mat
     * @param mat OpenCV matrix
     */
    explicit Image(const cv::Mat& mat);
    
    /**
     * @brief Constructor with dimensions and type
     * @param width Image width
     * @param height Image height 
     * @param type OpenCV matrix type (e.g., CV_8UC3)
     */
    Image(int width, int height, int type);
    
    /**
     * @brief Copy constructor
     */
    Image(const Image& other);
    
    /**
     * @brief Move constructor
     */
    Image(Image&& other) noexcept;
    
    /**
     * @brief Copy assignment operator
     */
    Image& operator=(const Image& other);
    
    /**
     * @brief Move assignment operator
     */
    Image& operator=(Image&& other) noexcept;
    
    /**
     * @brief Destructor
     */
    ~Image() = default;
    
    // Basic properties
    int width() const;
    int height() const;
    int channels() const;
    int type() const;
    bool empty() const;
    size_t dataSize() const;
    
    // Data access
    cv::Mat& data();
    const cv::Mat& data() const;
    
    // Basic operations
    Image clone() const;
    void copyTo(Image& dst) const;
    
    // File I/O
    bool load(const std::string& filename);
    bool save(const std::string& filename) const;
    
    // Format conversion
    void convertTo(int type, double alpha = 1.0, double beta = 0.0);
    
private:
    cv::Mat data_;
};

} // namespace bettergimp
