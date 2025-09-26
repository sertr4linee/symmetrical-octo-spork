#include "bettergimp/image/image_importer.hpp"
#include "bettergimp/image/image.hpp"
#include <opencv2/imgcodecs.hpp>
#include <opencv2/imgproc.hpp>
#include <filesystem>
#include <algorithm>
#include <fstream>

namespace bettergimp {

ImportResult ImageImporter::importImage(const std::string& filename, Image& output, const ImportOptions& options) {
    ImportResult result;
    
    if (!std::filesystem::exists(filename)) {
        result.errorMessage = "File does not exist: " + filename;
        return result;
    }
    
    try {
        // Détecter le format
        result.detectedFormat = (options.format == ImportFormat::AUTO_DETECT) ? 
                               detectFileFormat(filename) : options.format;
        
        // Charger l'image
        cv::Mat loaded;
        if (options.preserveAlpha) {
            loaded = cv::imread(filename, cv::IMREAD_UNCHANGED);
        } else {
            loaded = cv::imread(filename, cv::IMREAD_COLOR);
        }
        
        if (loaded.empty()) {
            result.errorMessage = "Failed to load image: " + filename;
            return result;
        }
        
        // Enregistrer les informations originales
        result.originalWidth = loaded.cols;
        result.originalHeight = loaded.rows;
        result.channels = loaded.channels();
        
        // Convertir en RGB si demandé
        if (options.convertToRGB && loaded.channels() >= 3) {
            cv::Mat converted;
            if (loaded.channels() == 4) {
                cv::cvtColor(loaded, converted, cv::COLOR_BGRA2RGB);
            } else if (loaded.channels() == 3) {
                cv::cvtColor(loaded, converted, cv::COLOR_BGR2RGB);
            }
            loaded = converted;
        }
        
        // Créer l'image de sortie
        output = Image(loaded);
        
        // Redimensionner si nécessaire
        if (options.maxWidth > 0 || options.maxHeight > 0) {
            if (!resizeIfNeeded(output, options)) {
                result.errorMessage = "Failed to resize image";
                return result;
            }
        }
        
        result.success = true;
        return result;
        
    } catch (const cv::Exception& e) {
        result.errorMessage = "OpenCV error: " + std::string(e.what());
        return result;
    } catch (const std::exception& e) {
        result.errorMessage = "Error: " + std::string(e.what());
        return result;
    }
}

std::vector<ImportResult> ImageImporter::importImages(const std::vector<std::string>& filenames, 
                                                     std::vector<std::unique_ptr<Image>>& outputs,
                                                     const ImportOptions& options) {
    std::vector<ImportResult> results;
    outputs.clear();
    outputs.reserve(filenames.size());
    
    for (const auto& filename : filenames) {
        auto image = std::make_unique<Image>();
        ImportResult result = importImage(filename, *image, options);
        
        if (result.success) {
            outputs.push_back(std::move(image));
        } else {
            outputs.push_back(nullptr);
        }
        
        results.push_back(result);
    }
    
    return results;
}

bool ImageImporter::isSupportedImageFile(const std::string& filename) {
    auto extensions = getSupportedExtensions();
    std::string ext = std::filesystem::path(filename).extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    
    return std::find(extensions.begin(), extensions.end(), ext) != extensions.end();
}

ImportResult ImageImporter::getImageInfo(const std::string& filename) {
    ImportResult result;
    
    if (!std::filesystem::exists(filename)) {
        result.errorMessage = "File does not exist: " + filename;
        return result;
    }
    
    try {
        cv::Mat header = cv::imread(filename, cv::IMREAD_UNCHANGED);
        if (header.empty()) {
            result.errorMessage = "Cannot read image header: " + filename;
            return result;
        }
        
        result.success = true;
        result.originalWidth = header.cols;
        result.originalHeight = header.rows;
        result.channels = header.channels();
        result.detectedFormat = detectFileFormat(filename);
        
        return result;
        
    } catch (const cv::Exception& e) {
        result.errorMessage = "OpenCV error: " + std::string(e.what());
        return result;
    }
}

std::vector<std::string> ImageImporter::getSupportedExtensions() {
    return {
        ".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp", ".gif"
    };
}

ImportFormat ImageImporter::detectFileFormat(const std::string& filename) {
    // Essayer d'abord par l'extension
    ImportFormat format = detectFormatFromExtension(filename);
    if (format != ImportFormat::AUTO_DETECT) {
        return format;
    }
    
    // Puis par l'en-tête du fichier
    return detectFormatFromHeader(filename);
}

bool ImageImporter::resizeIfNeeded(Image& image, const ImportOptions& options) {
    if (options.maxWidth <= 0 && options.maxHeight <= 0) {
        return true;
    }
    
    int currentWidth = image.width();
    int currentHeight = image.height();
    
    // Calculer les nouvelles dimensions
    int newWidth = currentWidth;
    int newHeight = currentHeight;
    
    if (options.maintainAspectRatio) {
        double aspectRatio = static_cast<double>(currentWidth) / currentHeight;
        
        if (options.maxWidth > 0 && currentWidth > options.maxWidth) {
            newWidth = options.maxWidth;
            newHeight = static_cast<int>(newWidth / aspectRatio);
        }
        
        if (options.maxHeight > 0 && newHeight > options.maxHeight) {
            newHeight = options.maxHeight;
            newWidth = static_cast<int>(newHeight * aspectRatio);
        }
    } else {
        if (options.maxWidth > 0) {
            newWidth = std::min(currentWidth, options.maxWidth);
        }
        if (options.maxHeight > 0) {
            newHeight = std::min(currentHeight, options.maxHeight);
        }
    }
    
    // Redimensionner si nécessaire
    if (newWidth != currentWidth || newHeight != currentHeight) {
        try {
            cv::Mat resized;
            cv::resize(image.data(), resized, cv::Size(newWidth, newHeight), 0, 0, cv::INTER_AREA);
            image = Image(resized);
            return true;
        } catch (const cv::Exception&) {
            return false;
        }
    }
    
    return true;
}

ImportFormat ImageImporter::detectFormatFromExtension(const std::string& filename) {
    std::string ext = std::filesystem::path(filename).extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    
    if (ext == ".png") return ImportFormat::PNG;
    if (ext == ".jpg" || ext == ".jpeg") return ImportFormat::JPEG;
    if (ext == ".bmp") return ImportFormat::BMP;
    if (ext == ".tiff" || ext == ".tif") return ImportFormat::TIFF;
    if (ext == ".webp") return ImportFormat::WEBP;
    if (ext == ".gif") return ImportFormat::GIF;
    
    return ImportFormat::AUTO_DETECT;
}

ImportFormat ImageImporter::detectFormatFromHeader(const std::string& filename) {
    std::ifstream file(filename, std::ios::binary);
    if (!file.is_open()) {
        return ImportFormat::AUTO_DETECT;
    }
    
    // Lire les premiers octets pour détecter le format
    char header[16];
    file.read(header, 16);
    file.close();
    
    // PNG: commence par 0x89504E47
    if (header[0] == static_cast<char>(0x89) && 
        header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) {
        return ImportFormat::PNG;
    }
    
    // JPEG: commence par 0xFFD8
    if (header[0] == static_cast<char>(0xFF) && header[1] == static_cast<char>(0xD8)) {
        return ImportFormat::JPEG;
    }
    
    // BMP: commence par "BM"
    if (header[0] == 'B' && header[1] == 'M') {
        return ImportFormat::BMP;
    }
    
    // TIFF: commence par "II" ou "MM"
    if ((header[0] == 'I' && header[1] == 'I') || 
        (header[0] == 'M' && header[1] == 'M')) {
        return ImportFormat::TIFF;
    }
    
    // WEBP: commence par "RIFF" puis "WEBP"
    if (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' &&
        header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
        return ImportFormat::WEBP;
    }
    
    // GIF: commence par "GIF87a" ou "GIF89a"
    if (header[0] == 'G' && header[1] == 'I' && header[2] == 'F') {
        return ImportFormat::GIF;
    }
    
    return ImportFormat::AUTO_DETECT;
}

}