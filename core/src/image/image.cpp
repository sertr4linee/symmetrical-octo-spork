#include "bettergimp/image/image.hpp"
#include <opencv2/imgcodecs.hpp>
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

} // namespace bettergimp
