#pragma once

#include <string>
#include <vector>
#include <memory>

namespace bettergimp {

class Image;

enum class ExportFormat {
    PNG,
    JPEG,
    BMP,
    TIFF,
    WEBP
};

struct ExportOptions {
    ExportFormat format = ExportFormat::PNG;
    int quality = 90;
    bool lossless = true;
    int compression = 1;
};

class ImageExporter {
public:
    ImageExporter() = default;
    ~ImageExporter() = default;

    static bool exportImage(const Image& image, const std::string& filename, const ExportOptions& options = {});
    
    static bool exportImages(const std::vector<std::pair<const Image*, std::string>>& imageFiles, const ExportOptions& options = {});
    
    static std::string getExtension(ExportFormat format);
    
    static ExportFormat detectFormat(const std::string& filename);
    
    static bool isFormatSupported(ExportFormat format);
    
    static std::vector<ExportFormat> getSupportedFormats();

private:
    static bool exportPNG(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportJPEG(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportBMP(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportTIFF(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportWEBP(const Image& image, const std::string& filename, const ExportOptions& options);
};

}
