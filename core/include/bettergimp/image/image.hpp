#pragma once

#include <opencv2/opencv.hpp>
#include <memory>
#include <string>

namespace bettergimp {

class Image {
public:
    Image();
    explicit Image(const cv::Mat& mat);
    Image(int width, int height, int type);
    Image(const Image& other);
    Image(Image&& other) noexcept;
    Image& operator=(const Image& other);
    Image& operator=(Image&& other) noexcept;
    ~Image() = default;
    
    // basic properties
    int width() const;
    int height() const;
    int channels() const;
    int type() const;
    bool empty() const;
    size_t dataSize() const;
    
    // data access
    cv::Mat& data();
    const cv::Mat& data() const;
    
    // bacis operations
    Image clone() const;
    void copyTo(Image& dst) const;
    
    // file I/O
    bool load(const std::string& filename);
    bool save(const std::string& filename) const;
    
    // format conversion
    void convertTo(int type, double alpha = 1.0, double beta = 0.0);
    
    // color space conversions
    Image convertColorSpace(int code) const;
    Image toRGB() const;
    Image toBGR() const;
    Image toGray() const;
    Image toHSV() const;
    Image toLAB() const;
    
    // bit operations
    Image to8Bit() const;
    Image to16Bit() const;
    Image to32Bit() const;
    int bitDepth() const;
    
private:
    cv::Mat data_;
};

}
