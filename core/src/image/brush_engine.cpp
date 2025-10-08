#include "bettergimp/image/brush_engine.hpp"
#include <cmath>
#include <random>
#include <algorithm>

namespace bettergimp {

BrushEngine::BrushEngine() {}

cv::Mat BrushEngine::generateBrushMask(const BrushSettings& settings) {
    switch (settings.type) {
        case BrushType::ROUND:
        case BrushType::SOFT_ROUND:
            return createRoundBrush(settings.size, settings.hardness);
        case BrushType::HARD_ROUND:
            return createRoundBrush(settings.size, 1.0);
        case BrushType::CALLIGRAPHY:
            return createCalligraphyBrush(settings.size, settings.calligraphy_angle, 
                                         settings.calligraphy_width);
        case BrushType::FLAT:
            return createFlatBrush(settings.size, settings.angle);
        case BrushType::SPRAY:
            return createSprayBrush(settings.size, settings.spray_density, 
                                   settings.spray_jitter);
        case BrushType::STAMP:
            if (!settings.stamp_texture.empty()) {
                cv::Mat resized;
                cv::resize(settings.stamp_texture, resized, 
                          cv::Size(settings.size, settings.size));
                return resized;
            }
            return createRoundBrush(settings.size, settings.hardness);
        case BrushType::PENCIL:
            return createPencilBrush(settings.size);
        case BrushType::MARKER:
            return createMarkerBrush(settings.size, settings.hardness);
        case BrushType::WATERCOLOR:
            return createWatercolorBrush(settings.size);
        default:
            return createRoundBrush(settings.size, settings.hardness);
    }
}

cv::Mat BrushEngine::createRoundBrush(int size, double hardness) {
    cv::Mat brush = cv::Mat::zeros(size, size, CV_8UC1);
    cv::Point center(size / 2, size / 2);
    double radius = size / 2.0;
    
    for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) {
            double dist = cv::norm(cv::Point(x, y) - center);
            double normalized_dist = dist / radius;
            
            double alpha = 0.0;
            if (normalized_dist <= 1.0) {
                if (hardness >= 1.0) {
                    alpha = 1.0;
                } else {
                    double falloff = (1.0 - normalized_dist) / (1.0 - hardness * 0.9);
                    alpha = std::min(1.0, std::max(0.0, falloff));
                }
            }
            
            brush.at<uchar>(y, x) = static_cast<uchar>(alpha * 255);
        }
    }
    
    return brush;
}

cv::Mat BrushEngine::createCalligraphyBrush(int size, double angle, double width_ratio) {
    cv::Mat brush = cv::Mat::zeros(size, size, CV_8UC1);
    cv::Point center(size / 2, size / 2);
    
    double angle_rad = angle * CV_PI / 180.0;
    double cos_a = std::cos(angle_rad);
    double sin_a = std::sin(angle_rad);
    
    double major_axis = size / 2.0;
    double minor_axis = major_axis * width_ratio;
    
    for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) {
            double dx = x - center.x;
            double dy = y - center.y;
            
            double rotated_x = dx * cos_a - dy * sin_a;
            double rotated_y = dx * sin_a + dy * cos_a;
            
            double normalized_dist = (rotated_x * rotated_x) / (major_axis * major_axis) +
                                    (rotated_y * rotated_y) / (minor_axis * minor_axis);
            
            double alpha = (normalized_dist <= 1.0) ? 1.0 : 0.0;
            
            if (normalized_dist > 0.7 && normalized_dist <= 1.0) {
                alpha = (1.0 - normalized_dist) / 0.3;
            }
            
            brush.at<uchar>(y, x) = static_cast<uchar>(alpha * 255);
        }
    }
    
    return brush;
}

cv::Mat BrushEngine::createSprayBrush(int size, int density, double jitter) {
    cv::Mat brush = cv::Mat::zeros(size, size, CV_8UC1);
    cv::Point center(size / 2, size / 2);
    double radius = size / 2.0;
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> angle_dist(0.0, 2.0 * CV_PI);
    std::uniform_real_distribution<> radius_dist(0.0, 1.0);
    std::uniform_real_distribution<> alpha_dist(0.3, 1.0);
    
    for (int i = 0; i < density; i++) {
        double angle = angle_dist(gen);
        double r = std::sqrt(radius_dist(gen)) * radius * (1.0 - jitter * 0.5);
        
        int x = center.x + static_cast<int>(r * std::cos(angle));
        int y = center.y + static_cast<int>(r * std::sin(angle));
        
        if (x >= 0 && x < size && y >= 0 && y < size) {
            double alpha = alpha_dist(gen);
            int particle_size = 1 + static_cast<int>(jitter * 3);
            
            for (int dy = -particle_size; dy <= particle_size; dy++) {
                for (int dx = -particle_size; dx <= particle_size; dx++) {
                    int px = x + dx;
                    int py = y + dy;
                    if (px >= 0 && px < size && py >= 0 && py < size) {
                        double particle_dist = std::sqrt(dx*dx + dy*dy) / particle_size;
                        if (particle_dist <= 1.0) {
                            uchar current = brush.at<uchar>(py, px);
                            uchar new_val = static_cast<uchar>(alpha * 255 * (1.0 - particle_dist));
                            brush.at<uchar>(py, px) = std::max(current, new_val);
                        }
                    }
                }
            }
        }
    }
    
    return brush;
}

cv::Mat BrushEngine::createFlatBrush(int size, double angle) {
    cv::Mat brush = cv::Mat::zeros(size, size, CV_8UC1);
    
    double angle_rad = angle * CV_PI / 180.0;
    double width = size * 0.3;
    double length = size * 0.9;
    
    cv::Point center(size / 2, size / 2);
    cv::RotatedRect rect(cv::Point2f(center.x, center.y), 
                         cv::Size2f(width, length), angle);
    
    cv::Point2f vertices[4];
    rect.points(vertices);
    
    std::vector<cv::Point> points;
    for (int i = 0; i < 4; i++) {
        points.push_back(cv::Point(vertices[i].x, vertices[i].y));
    }
    
    cv::fillConvexPoly(brush, points, cv::Scalar(255));
    
    cv::GaussianBlur(brush, brush, cv::Size(3, 3), 0.5);
    
    return brush;
}

cv::Mat BrushEngine::createPencilBrush(int size) {
    cv::Mat brush = createRoundBrush(size, 1.0);
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> noise_dist(200, 255);
    
    for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) {
            if (brush.at<uchar>(y, x) > 0) {
                uchar noise = static_cast<uchar>(noise_dist(gen));
                brush.at<uchar>(y, x) = std::min(brush.at<uchar>(y, x), noise);
            }
        }
    }
    
    return brush;
}

cv::Mat BrushEngine::createMarkerBrush(int size, double hardness) {
    cv::Mat brush = createRoundBrush(size, hardness);
    
    cv::Mat center_boost = cv::Mat::zeros(size, size, CV_8UC1);
    cv::Point center(size / 2, size / 2);
    cv::circle(center_boost, center, size / 4, cv::Scalar(128), -1);
    cv::GaussianBlur(center_boost, center_boost, cv::Size(0, 0), size / 8.0);
    
    cv::add(brush, center_boost, brush);
    
    return brush;
}

cv::Mat BrushEngine::createWatercolorBrush(int size) {
    cv::Mat brush = createRoundBrush(size, 0.3);
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<> dist(0.0, size / 10.0);
    
    for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) {
            if (brush.at<uchar>(y, x) > 0) {
                double offset = dist(gen);
                uchar value = brush.at<uchar>(y, x);
                value = static_cast<uchar>(value * (0.7 + 0.3 * std::abs(offset) / (size / 10.0)));
                brush.at<uchar>(y, x) = value;
            }
        }
    }
    
    cv::GaussianBlur(brush, brush, cv::Size(5, 5), 1.5);
    
    return brush;
}

void BrushEngine::interpolateStroke(const cv::Point& start, const cv::Point& end,
                                   std::vector<cv::Point>& points, double spacing) {
    points.clear();
    
    double dx = end.x - start.x;
    double dy = end.y - start.y;
    double distance = std::sqrt(dx * dx + dy * dy);
    
    if (distance < 1.0) {
        points.push_back(start);
        return;
    }
    
    int num_points = static_cast<int>(distance * spacing) + 1;
    
    for (int i = 0; i <= num_points; i++) {
        double t = static_cast<double>(i) / num_points;
        int x = static_cast<int>(start.x + t * dx);
        int y = static_cast<int>(start.y + t * dy);
        points.push_back(cv::Point(x, y));
    }
}

void BrushEngine::applyBrushDab(cv::Mat& canvas, const cv::Point& position,
                               const cv::Scalar& color, const BrushSettings& settings,
                               double pressure) {
    int actual_size = settings.pressure_size ? 
                     calculatePressureSize(settings.size, pressure) : settings.size;
    double actual_opacity = settings.pressure_opacity ?
                           calculatePressureOpacity(settings.opacity, pressure) : settings.opacity;
    
    BrushSettings adjusted_settings = settings;
    adjusted_settings.size = actual_size;
    adjusted_settings.opacity = actual_opacity;
    
    cv::Mat brush_mask = generateBrushMask(adjusted_settings);
    
    int half_size = actual_size / 2;
    int start_x = std::max(0, position.x - half_size);
    int start_y = std::max(0, position.y - half_size);
    int end_x = std::min(canvas.cols, position.x + half_size);
    int end_y = std::min(canvas.rows, position.y + half_size);
    
    if (start_x >= canvas.cols || start_y >= canvas.rows || end_x <= 0 || end_y <= 0) {
        return;
    }
    
    for (int y = start_y; y < end_y; y++) {
        for (int x = start_x; x < end_x; x++) {
            int brush_x = x - (position.x - half_size);
            int brush_y = y - (position.y - half_size);
            
            if (brush_x >= 0 && brush_x < brush_mask.cols &&
                brush_y >= 0 && brush_y < brush_mask.rows) {
                
                double alpha = (brush_mask.at<uchar>(brush_y, brush_x) / 255.0) * actual_opacity;
                
                if (canvas.channels() == 4) {
                    cv::Vec4b& pixel = canvas.at<cv::Vec4b>(y, x);
                    pixel[0] = cv::saturate_cast<uchar>(pixel[0] * (1 - alpha) + color[0] * alpha);
                    pixel[1] = cv::saturate_cast<uchar>(pixel[1] * (1 - alpha) + color[1] * alpha);
                    pixel[2] = cv::saturate_cast<uchar>(pixel[2] * (1 - alpha) + color[2] * alpha);
                    pixel[3] = 255;
                } else if (canvas.channels() == 3) {
                    cv::Vec3b& pixel = canvas.at<cv::Vec3b>(y, x);
                    pixel[0] = cv::saturate_cast<uchar>(pixel[0] * (1 - alpha) + color[0] * alpha);
                    pixel[1] = cv::saturate_cast<uchar>(pixel[1] * (1 - alpha) + color[1] * alpha);
                    pixel[2] = cv::saturate_cast<uchar>(pixel[2] * (1 - alpha) + color[2] * alpha);
                }
            }
        }
    }
}

void BrushEngine::applyBrushStroke(cv::Mat& canvas, const cv::Point& start, const cv::Point& end,
                                  const cv::Scalar& color, const BrushSettings& settings,
                                  double pressure) {
    std::vector<cv::Point> points;
    interpolateStroke(start, end, points, settings.spacing);
    
    for (const auto& point : points) {
        applyBrushDab(canvas, point, color, settings, pressure);
    }
}

double BrushEngine::calculatePressureOpacity(double base_opacity, double pressure) {
    return base_opacity * (0.3 + 0.7 * pressure);
}

int BrushEngine::calculatePressureSize(int base_size, double pressure) {
    return static_cast<int>(base_size * (0.5 + 0.5 * pressure));
}

void BrushEngine::applyBlendMode(cv::Mat& canvas, const cv::Mat& brush_layer,
                                BrushBlendMode mode) {
    // Implement blend modes
    // For now, this is a placeholder
}

} // namespace bettergimp
