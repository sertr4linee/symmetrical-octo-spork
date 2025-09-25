#pragma once

#include <opencv2/opencv.hpp>
#include <tbb/tbb.h>
#include <Eigen/Dense>

namespace bettergimp {
    class Image;
    class ImageProcessor;
    class FilterBase;
}

#include "bettergimp/image/image.hpp"
#include "bettergimp/image/image_processor.hpp"

namespace bettergimp {

const char* getVersion();

bool initialize(int num_threads = 0);

void cleanup();

bool isSimdAvailable();

}
