#pragma once

#include <string>
#include <vector>
#include <memory>

namespace bettergimp {

class Image;

enum class ImportFormat {
    AUTO_DETECT,
    PNG,
    JPEG,
    BMP,
    TIFF,
    WEBP,
    GIF
};

struct ImportOptions {
    ImportFormat format = ImportFormat::AUTO_DETECT;
    bool preserveAlpha = true;
    bool convertToRGB = false;
    int maxWidth = 0;
    int maxHeight = 0;
    bool maintainAspectRatio = true;
};

struct ImportResult {
    bool success = false;
    std::string errorMessage;
    ImportFormat detectedFormat = ImportFormat::AUTO_DETECT;
    int originalWidth = 0;
    int originalHeight = 0;
    int channels = 0;
};

class ImageImporter {
public:
    ImageImporter() = default;
    ~ImageImporter() = default;

    static ImportResult importImage(const std::string& filename, Image& output, const ImportOptions& options = {});
    
    static std::vector<ImportResult> importImages(const std::vector<std::string>& filenames, 
                                                 std::vector<std::unique_ptr<Image>>& outputs,
                                                 const ImportOptions& options = {});
    
    static bool isSupportedImageFile(const std::string& filename);
    
    static ImportResult getImageInfo(const std::string& filename);
    
    static std::vector<std::string> getSupportedExtensions();
    
    static ImportFormat detectFileFormat(const std::string& filename);

private:
    static bool resizeIfNeeded(Image& image, const ImportOptions& options);
    static ImportFormat detectFormatFromExtension(const std::string& filename);
    static ImportFormat detectFormatFromHeader(const std::string& filename);
};

}
