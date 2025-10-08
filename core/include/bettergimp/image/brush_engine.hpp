#pragma once

#include <opencv2/opencv.hpp>
#include <vector>
#include <memory>

namespace bettergimp {

enum class BrushType {
    ROUND,           // Brush rond standard
    SOFT_ROUND,      // Brush rond avec bords doux
    HARD_ROUND,      // Brush rond avec bords durs
    CALLIGRAPHY,     // Stylo calligraphique
    FLAT,            // Brush plat
    SPRAY,           // Aérosol/spray
    STAMP,           // Tampon/sceau
    PENCIL,          // Crayon
    MARKER,          // Marqueur
    WATERCOLOR       // Aquarelle
};

enum class BrushBlendMode {
    NORMAL,
    MULTIPLY,
    SCREEN,
    OVERLAY,
    SOFT_LIGHT,
    HARD_LIGHT,
    DARKEN,
    LIGHTEN,
    ADD,
    SUBTRACT
};

struct BrushSettings {
    BrushType type = BrushType::ROUND;
    int size = 10;
    double opacity = 1.0;
    double hardness = 0.5;
    double spacing = 0.25;
    double angle = 0.0;
    double roundness = 1.0;
    bool pressure_opacity = true;
    bool pressure_size = true;
    BrushBlendMode blend_mode = BrushBlendMode::NORMAL;
    
    // Calligraphy specific
    double calligraphy_angle = 45.0;
    double calligraphy_width = 0.3;
    
    // Spray specific
    int spray_density = 50;
    double spray_jitter = 0.5;
    
    // Stamp specific
    cv::Mat stamp_texture;
};

class BrushEngine {
public:
    BrushEngine();
    ~BrushEngine() = default;
    
    // Generate brush mask
    cv::Mat generateBrushMask(const BrushSettings& settings);
    
    // Apply brush stroke
    void applyBrushStroke(cv::Mat& canvas, const cv::Point& start, const cv::Point& end,
                         const cv::Scalar& color, const BrushSettings& settings,
                         double pressure = 1.0);
    
    // Apply single brush dab
    void applyBrushDab(cv::Mat& canvas, const cv::Point& position,
                      const cv::Scalar& color, const BrushSettings& settings,
                      double pressure = 1.0);
    
private:
    cv::Mat createRoundBrush(int size, double hardness);
    cv::Mat createCalligraphyBrush(int size, double angle, double width);
    cv::Mat createSprayBrush(int size, int density, double jitter);
    cv::Mat createFlatBrush(int size, double angle);
    cv::Mat createPencilBrush(int size);
    cv::Mat createMarkerBrush(int size, double hardness);
    cv::Mat createWatercolorBrush(int size);
    
    void interpolateStroke(const cv::Point& start, const cv::Point& end,
                          std::vector<cv::Point>& points, double spacing);
    
    void applyBlendMode(cv::Mat& canvas, const cv::Mat& brush_layer,
                       BrushBlendMode mode);
    
    double calculatePressureOpacity(double base_opacity, double pressure);
    int calculatePressureSize(int base_size, double pressure);
};

} // namespace bettergimp
