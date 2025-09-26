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
    int quality = 90; // Pour JPEG (0-100)
    bool lossless = true; // Pour WEBP
    int compression = 1; // Pour PNG (0-9)
};

class ImageExporter {
public:
    ImageExporter() = default;
    ~ImageExporter() = default;

    // Export d'une image unique
    static bool exportImage(const Image& image, const std::string& filename, const ExportOptions& options = {});
    
    // Export de plusieurs images en batch
    static bool exportImages(const std::vector<std::pair<const Image*, std::string>>& imageFiles, const ExportOptions& options = {});
    
    // Obtenir l'extension de fichier pour un format
    static std::string getExtension(ExportFormat format);
    
    // Détecter le format depuis l'extension
    static ExportFormat detectFormat(const std::string& filename);
    
    // Vérifier si un format est supporté
    static bool isFormatSupported(ExportFormat format);
    
    // Obtenir la liste des formats supportés
    static std::vector<ExportFormat> getSupportedFormats();

private:
    static bool exportPNG(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportJPEG(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportBMP(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportTIFF(const Image& image, const std::string& filename, const ExportOptions& options);
    static bool exportWEBP(const Image& image, const std::string& filename, const ExportOptions& options);
};

}