#include "bettergimp/image/image_exporter.hpp"
#include "bettergimp/image/image.hpp"
#include <opencv2/imgcodecs.hpp>
#include <filesystem>
#include <algorithm>

namespace bettergimp {

bool ImageExporter::exportImage(const Image& image, const std::string& filename, const ExportOptions& options) {
    if (image.empty()) {
        return false;
    }

    // Déterminer le format depuis les options ou l'extension
    ExportFormat format = options.format;
    if (format == ExportFormat::PNG && filename.find('.') != std::string::npos) {
        format = detectFormat(filename);
    }

    switch (format) {
        case ExportFormat::PNG:
            return exportPNG(image, filename, options);
        case ExportFormat::JPEG:
            return exportJPEG(image, filename, options);
        case ExportFormat::BMP:
            return exportBMP(image, filename, options);
        case ExportFormat::TIFF:
            return exportTIFF(image, filename, options);
        case ExportFormat::WEBP:
            return exportWEBP(image, filename, options);
        default:
            return false;
    }
}

bool ImageExporter::exportImages(const std::vector<std::pair<const Image*, std::string>>& imageFiles, const ExportOptions& options) {
    bool success = true;
    for (const auto& [image, filename] : imageFiles) {
        if (image && !exportImage(*image, filename, options)) {
            success = false;
        }
    }
    return success;
}

std::string ImageExporter::getExtension(ExportFormat format) {
    switch (format) {
        case ExportFormat::PNG: return ".png";
        case ExportFormat::JPEG: return ".jpg";
        case ExportFormat::BMP: return ".bmp";
        case ExportFormat::TIFF: return ".tiff";
        case ExportFormat::WEBP: return ".webp";
        default: return ".png";
    }
}

ExportFormat ImageExporter::detectFormat(const std::string& filename) {
    std::string ext = std::filesystem::path(filename).extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    
    if (ext == ".png") return ExportFormat::PNG;
    if (ext == ".jpg" || ext == ".jpeg") return ExportFormat::JPEG;
    if (ext == ".bmp") return ExportFormat::BMP;
    if (ext == ".tiff" || ext == ".tif") return ExportFormat::TIFF;
    if (ext == ".webp") return ExportFormat::WEBP;
    
    return ExportFormat::PNG; // Défaut
}

bool ImageExporter::isFormatSupported(ExportFormat format) {
    auto supported = getSupportedFormats();
    return std::find(supported.begin(), supported.end(), format) != supported.end();
}

std::vector<ExportFormat> ImageExporter::getSupportedFormats() {
    return {
        ExportFormat::PNG,
        ExportFormat::JPEG,
        ExportFormat::BMP,
        ExportFormat::TIFF,
        ExportFormat::WEBP
    };
}

bool ImageExporter::exportPNG(const Image& image, const std::string& filename, const ExportOptions& options) {
    std::vector<int> compression_params;
    compression_params.push_back(cv::IMWRITE_PNG_COMPRESSION);
    compression_params.push_back(std::clamp(options.compression, 0, 9));
    
    try {
        return cv::imwrite(filename, image.data(), compression_params);
    } catch (const cv::Exception&) {
        return false;
    }
}

bool ImageExporter::exportJPEG(const Image& image, const std::string& filename, const ExportOptions& options) {
    std::vector<int> compression_params;
    compression_params.push_back(cv::IMWRITE_JPEG_QUALITY);
    compression_params.push_back(std::clamp(options.quality, 0, 100));
    
    // Convertir en BGR si nécessaire (JPEG ne supporte pas l'alpha)
    cv::Mat output = image.data();
    if (image.channels() == 4) {
        cv::cvtColor(image.data(), output, cv::COLOR_BGRA2BGR);
    } else if (image.channels() == 3 && image.data().type() == CV_8UC3) {
        // S'assurer que c'est en BGR pour OpenCV
        output = image.data();
    }
    
    try {
        return cv::imwrite(filename, output, compression_params);
    } catch (const cv::Exception&) {
        return false;
    }
}

bool ImageExporter::exportBMP(const Image& image, const std::string& filename, const ExportOptions& options) {
    try {
        return cv::imwrite(filename, image.data());
    } catch (const cv::Exception&) {
        return false;
    }
}

bool ImageExporter::exportTIFF(const Image& image, const std::string& filename, const ExportOptions& options) {
    try {
        return cv::imwrite(filename, image.data());
    } catch (const cv::Exception&) {
        return false;
    }
}

bool ImageExporter::exportWEBP(const Image& image, const std::string& filename, const ExportOptions& options) {
    std::vector<int> compression_params;
    
    if (options.lossless) {
        compression_params.push_back(cv::IMWRITE_WEBP_QUALITY);
        compression_params.push_back(101); // 101 = lossless
    } else {
        compression_params.push_back(cv::IMWRITE_WEBP_QUALITY);
        compression_params.push_back(std::clamp(options.quality, 0, 100));
    }
    
    try {
        return cv::imwrite(filename, image.data(), compression_params);
    } catch (const cv::Exception&) {
        return false;
    }
}

}