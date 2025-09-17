#pragma once

#include <memory>
#include <vector>
#include <string>
#include <cstdint>

namespace OctoEdit::Core {

    // Forward declarations
    class Layer;
    class ToolSystem;
    class MemoryManager;

    /**
     * @brief Main image data structure
     * 
     * Represents an image with metadata and pixel data.
     * Supports various color formats and bit depths.
     */
    struct ImageData {
        uint32_t width{0};
        uint32_t height{0};
        uint32_t channels{0};
        uint32_t bit_depth{8};
        std::vector<uint8_t> pixels;
        
        ImageData() = default;
        ImageData(uint32_t w, uint32_t h, uint32_t c, uint32_t depth = 8);
        
        size_t getPixelCount() const { return width * height; }
        size_t getDataSize() const { return pixels.size(); }
        bool isValid() const { return width > 0 && height > 0 && !pixels.empty(); }
    };

    /**
     * @brief Processing parameters for image operations
     */
    struct ProcessingParams {
        std::string operation;
        double strength{1.0};
        std::vector<double> parameters;
        
        ProcessingParams(const std::string& op) : operation(op) {}
    };

    /**
     * @brief High-performance image processing engine
     * 
     * Core class responsible for all image processing operations.
     * Optimized for performance with SIMD and multi-threading support.
     */
    class ImageProcessor {
    public:
        ImageProcessor();
        ~ImageProcessor();

        // Core image operations
        std::unique_ptr<ImageData> loadImage(const std::string& filepath);
        bool saveImage(const ImageData& image, const std::string& filepath, int quality = 95);
        
        // Image processing operations
        std::unique_ptr<ImageData> processImage(
            const ImageData& input,
            const ProcessingParams& params
        );
        
        // Transform operations
        std::unique_ptr<ImageData> resize(const ImageData& input, uint32_t newWidth, uint32_t newHeight);
        std::unique_ptr<ImageData> rotate(const ImageData& input, double angle);
        std::unique_ptr<ImageData> crop(const ImageData& input, uint32_t x, uint32_t y, uint32_t w, uint32_t h);
        
        // Filter operations
        std::unique_ptr<ImageData> gaussianBlur(const ImageData& input, double sigma);
        std::unique_ptr<ImageData> sharpen(const ImageData& input, double strength);
        std::unique_ptr<ImageData> adjustBrightness(const ImageData& input, double factor);
        std::unique_ptr<ImageData> adjustContrast(const ImageData& input, double factor);
        
        // Color operations
        std::unique_ptr<ImageData> convertColorSpace(const ImageData& input, const std::string& targetSpace);
        std::unique_ptr<ImageData> adjustHueSaturation(const ImageData& input, double hue, double saturation);
        
        // Performance and optimization
        void setThreadCount(int count);
        int getThreadCount() const;
        void enableSIMD(bool enable);
        bool isSIMDEnabled() const;

    private:
        class Impl;
        std::unique_ptr<Impl> pImpl;
    };

    /**
     * @brief Layer management and composition
     */
    class LayerEngine {
    public:
        LayerEngine();
        ~LayerEngine();
        
        // Layer operations
        void addLayer(std::unique_ptr<Layer> layer);
        void removeLayer(size_t index);
        void moveLayer(size_t from, size_t to);
        
        // Composition
        std::unique_ptr<ImageData> composeLayers();
        std::unique_ptr<ImageData> renderLayer(size_t index);
        
        // Layer properties
        void setLayerOpacity(size_t index, double opacity);
        void setLayerBlendMode(size_t index, const std::string& blendMode);
        void setLayerVisibility(size_t index, bool visible);
        
        size_t getLayerCount() const;
        
    private:
        class Impl;
        std::unique_ptr<Impl> pImpl;
    };

    /**
     * @brief Tool system for drawing and editing operations
     */
    class ToolSystem {
    public:
        ToolSystem();
        ~ToolSystem();
        
        // Tool operations
        void executeBrushStroke(ImageData& target, const std::vector<std::pair<int, int>>& points, const ProcessingParams& params);
        void executeSelection(const ImageData& source, const std::vector<std::pair<int, int>>& points);
        void executeClone(ImageData& target, int srcX, int srcY, int dstX, int dstY, int radius);
        
        // Tool configuration
        void setBrushSize(double size);
        void setBrushHardness(double hardness);
        void setBrushOpacity(double opacity);
        void setForegroundColor(uint8_t r, uint8_t g, uint8_t b, uint8_t a = 255);
        void setBackgroundColor(uint8_t r, uint8_t g, uint8_t b, uint8_t a = 255);
        
    private:
        class Impl;
        std::unique_ptr<Impl> pImpl;
    };

    /**
     * @brief Memory management for large images
     */
    class MemoryManager {
    public:
        static MemoryManager& getInstance();
        
        // Memory allocation
        void* allocateImageBuffer(size_t size);
        void deallocateImageBuffer(void* buffer);
        
        // Memory optimization
        void optimizeMemoryUsage();
        void setMemoryLimit(size_t limitBytes);
        size_t getMemoryUsage() const;
        size_t getMemoryLimit() const;
        
        // Large image handling
        void enableTileBasedProcessing(bool enable);
        void setTileSize(uint32_t width, uint32_t height);
        
    private:
        MemoryManager() = default;
        class Impl;
        std::unique_ptr<Impl> pImpl;
    };

} // namespace OctoEdit::Core