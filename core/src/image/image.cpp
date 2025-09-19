#include "bettergimp/image/image.hpp"
#include <opencv2/imgcodecs.hpp>
#include <opencv2/imgproc.hpp>
#include <stdexcept>

namespace bettergimp {

Image::Image() : data_() {}

Image::Image(const cv::Mat& mat) : data_(mat.clone()) {}

Image::Image(int width, int height, int type) 
    : data_(height, width, type) {}

Image::Image(const Image& other) : data_(other.data_.clone()) {}

Image::Image(Image&& other) noexcept : data_(std::move(other.data_)) {}

Image& Image::operator=(const Image& other) {
    if (this != &other) {
        data_ = other.data_.clone();
    }
    return *this;
}

Image& Image::operator=(Image&& other) noexcept {
    if (this != &other) {
        data_ = std::move(other.data_);
    }
    return *this;
}

int Image::width() const {
    return data_.cols;
}

int Image::height() const {
    return data_.rows;
}

int Image::channels() const {
    return data_.channels();
}

int Image::type() const {
    return data_.type();
}

bool Image::empty() const {
    return data_.empty();
}

size_t Image::dataSize() const {
    return data_.total() * data_.elemSize();
}

cv::Mat& Image::data() {
    return data_;
}

const cv::Mat& Image::data() const {
    return data_;
}

Image Image::clone() const {
    return Image(data_.clone());
}

void Image::copyTo(Image& dst) const {
    data_.copyTo(dst.data_);
}

bool Image::load(const std::string& filename) {
    try {
        cv::Mat loaded = cv::imread(filename, cv::IMREAD_UNCHANGED);
        if (loaded.empty()) {
            return false;
        }
        data_ = std::move(loaded);
        return true;
    } catch (const cv::Exception&) {
        return false;
    }
}

bool Image::save(const std::string& filename) const {
    if (data_.empty()) {
        return false;
    }
    
    try {
        return cv::imwrite(filename, data_);
    } catch (const cv::Exception&) {
        return false;
    }
}

void Image::convertTo(int type, double alpha, double beta) {
    data_.convertTo(data_, type, alpha, beta);
}

Image Image::convertColorSpace(int code) const {
    Image result;
    cv::cvtColor(data_, result.data_, code);
    return result;
}

Image Image::toRGB() const {
    if (channels() == 3) {
        return convertColorSpace(cv::COLOR_BGR2RGB);
    } else if (channels() == 1) {
        return convertColorSpace(cv::COLOR_GRAY2RGB);
    }
    return clone(); // Already RGB or unsupported format
}

Image Image::toBGR() const {
    if (channels() == 3) {
        return convertColorSpace(cv::COLOR_RGB2BGR);
    } else if (channels() == 1) {
        return convertColorSpace(cv::COLOR_GRAY2BGR);
    }
    return clone(); // Already BGR or unsupported format
}

Image Image::toGray() const {
    if (channels() == 3) {
        return convertColorSpace(cv::COLOR_BGR2GRAY);
    } else if (channels() == 4) {
        return convertColorSpace(cv::COLOR_BGRA2GRAY);
    }
    return clone(); // Already grayscale
}

Image Image::toHSV() const {
    if (channels() == 3) {
        return convertColorSpace(cv::COLOR_BGR2HSV);
    }
    throw std::runtime_error("HSV conversion requires 3-channel BGR image");
}

Image Image::toLAB() const {
    if (channels() == 3) {
        return convertColorSpace(cv::COLOR_BGR2Lab);
    }
    throw std::runtime_error("LAB conversion requires 3-channel BGR image");
}

Image Image::to8Bit() const {
    Image result;
    if (data_.depth() == CV_8U) {
        return clone();
    }
    
    double scale = 1.0;
    if (data_.depth() == CV_16U) {
        scale = 1.0 / 257.0; // 65535 -> 255
    } else if (data_.depth() == CV_32F) {
        scale = 255.0; // Assuming float is in [0,1] range
    }
    
    data_.convertTo(result.data_, CV_8UC(channels()), scale);
    return result;
}

Image Image::to16Bit() const {
    Image result;
    if (data_.depth() == CV_16U) {
        return clone();
    }
    
    double scale = 1.0;
    if (data_.depth() == CV_8U) {
        scale = 257.0; // 255 -> 65535
    } else if (data_.depth() == CV_32F) {
        scale = 65535.0; // Assuming float is in [0,1] range
    }
    
    data_.convertTo(result.data_, CV_16UC(channels()), scale);
    return result;
}

Image Image::to32Bit() const {
    Image result;
    if (data_.depth() == CV_32F) {
        return clone();
    }
    
    double scale = 1.0;
    if (data_.depth() == CV_8U) {
        scale = 1.0 / 255.0; // 255 -> 1.0
    } else if (data_.depth() == CV_16U) {
        scale = 1.0 / 65535.0; // 65535 -> 1.0
    }
    
    data_.convertTo(result.data_, CV_32FC(channels()), scale);
    return result;
}

int Image::bitDepth() const {
    switch (data_.depth()) {
        case CV_8U:
        case CV_8S:
            return 8;
        case CV_16U:
        case CV_16S:
            return 16;
        case CV_32S:
        case CV_32F:
            return 32;
        case CV_64F:
            return 64;
        default:
            return 0;
    }
}

} // namespace bettergimp
