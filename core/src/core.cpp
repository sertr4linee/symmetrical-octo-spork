#include "bettergimp/core.hpp"
#include <tbb/global_control.h>
#include <iostream>
#include <thread>
#include <memory>

namespace bettergimp {

namespace {
    bool g_initialized = false;
    std::unique_ptr<tbb::global_control> g_thread_control;
}

const char* getVersion() {
    return "0.1.0";
}

bool initialize(int num_threads) {
    if (g_initialized) {
        return true;
    }
    
    try {
        if (num_threads <= 0) {
            num_threads = std::thread::hardware_concurrency();
            if (num_threads <= 0) {
                num_threads = 4;
            }
        }
        
        g_thread_control = std::make_unique<tbb::global_control>(
            tbb::global_control::max_allowed_parallelism, 
            num_threads
        );
        
        cv::setUseOptimized(true);
        cv::setNumThreads(num_threads);
        
        std::cout << "Better GIMP Core " << getVersion() << " initialized with " 
                  << num_threads << " threads" << std::endl;
        
        g_initialized = true;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Failed to initialize Better GIMP Core: " << e.what() << std::endl;
        return false;
    }
}

void cleanup() {
    if (g_initialized) {
        g_thread_control.reset();
        g_initialized = false;
        std::cout << "Better GIMP Core cleanup completed" << std::endl;
    }
}

bool isSimdAvailable() {
#ifdef ENABLE_SIMD
    return cv::checkHardwareSupport(CV_CPU_AVX2) || cv::checkHardwareSupport(CV_CPU_SSE4_1);
#else
    return false;
#endif
}

}
