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
    bool convertToRGB = false; // Convertir automatiquement en RGB
    int maxWidth = 0; // 0 = pas de limite
    int maxHeight = 0; // 0 = pas de limite
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

    // Import d'une image
    static ImportResult importImage(const std::string& filename, Image& output, const ImportOptions& options = {});
    
    // Import de plusieurs images
    static std::vector<ImportResult> importImages(const std::vector<std::string>& filenames, 
                                                 std::vector<std::unique_ptr<Image>>& outputs,
                                                 const ImportOptions& options = {});
    
    // Vérifier si un fichier est une image supportée
    static bool isSupportedImageFile(const std::string& filename);
    
    // Obtenir les informations d'une image sans la charger complètement
    static ImportResult getImageInfo(const std::string& filename);
    
    // Obtenir la liste des extensions supportées
    static std::vector<std::string> getSupportedExtensions();
    
    // Détecter le format d'un fichier
    static ImportFormat detectFileFormat(const std::string& filename);

private:
    static bool resizeIfNeeded(Image& image, const ImportOptions& options);
    static ImportFormat detectFormatFromExtension(const std::string& filename);
    static ImportFormat detectFormatFromHeader(const std::string& filename);
};

}