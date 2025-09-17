"""
OctoEdit Python API

This module provides Python bindings for the OctoEdit core engine,
allowing for automation, scripting, and plugin development.
"""

from typing import Optional, List, Tuple, Any, Dict
import numpy as np
from pathlib import Path

__version__ = "1.0.0"
__author__ = "OctoEdit Contributors"

# Try to import the C++ bindings
try:
    from . import _octoedit_core  # C++ bindings module
    _CORE_AVAILABLE = True
except ImportError:
    _CORE_AVAILABLE = False
    import warnings
    warnings.warn("OctoEdit core engine not available. Running in simulation mode.")


class ImageData:
    """
    Represents image data with metadata.
    
    This class provides a Python interface to the C++ ImageData structure,
    with additional convenience methods for Python users.
    """
    
    def __init__(self, width: int = 0, height: int = 0, channels: int = 3, bit_depth: int = 8):
        self.width = width
        self.height = height
        self.channels = channels
        self.bit_depth = bit_depth
        self.pixels = np.zeros((height, width, channels), dtype=np.uint8)
        
        if _CORE_AVAILABLE:
            self._core_data = _octoedit_core.ImageData(width, height, channels, bit_depth)
    
    @classmethod
    def from_numpy(cls, array: np.ndarray) -> 'ImageData':
        """Create ImageData from a numpy array."""
        if array.ndim == 2:
            height, width = array.shape
            channels = 1
        elif array.ndim == 3:
            height, width, channels = array.shape
        else:
            raise ValueError("Array must be 2D or 3D")
        
        image = cls(width, height, channels)
        image.pixels = array.copy()
        return image
    
    def to_numpy(self) -> np.ndarray:
        """Convert to numpy array."""
        return self.pixels.copy()
    
    @property
    def shape(self) -> Tuple[int, int, int]:
        """Get image shape as (height, width, channels)."""
        return (self.height, self.width, self.channels)
    
    @property
    def size(self) -> Tuple[int, int]:
        """Get image size as (width, height)."""
        return (self.width, self.height)
    
    def is_valid(self) -> bool:
        """Check if image data is valid."""
        return self.width > 0 and self.height > 0 and self.pixels.size > 0


class ImageProcessor:
    """
    High-performance image processing engine.
    
    Provides access to the C++ core engine for image processing operations
    with a Python-friendly interface.
    """
    
    def __init__(self):
        if _CORE_AVAILABLE:
            self._processor = _octoedit_core.ImageProcessor()
        self._thread_count = 4
        self._simd_enabled = True
    
    def load_image(self, filepath: str | Path) -> Optional[ImageData]:
        """
        Load an image from file.
        
        Args:
            filepath: Path to the image file
            
        Returns:
            ImageData object or None if loading failed
        """
        filepath = str(filepath)
        
        if _CORE_AVAILABLE:
            try:
                core_data = self._processor.loadImage(filepath)
                if core_data:
                    # Convert C++ ImageData to Python ImageData
                    image = ImageData(core_data.width, core_data.height, 
                                    core_data.channels, core_data.bit_depth)
                    image.pixels = np.array(core_data.pixels).reshape(
                        (core_data.height, core_data.width, core_data.channels)
                    )
                    return image
            except Exception as e:
                print(f"Error loading image: {e}")
                return None
        else:
            # Fallback using PIL/Pillow for simulation
            try:
                from PIL import Image
                pil_image = Image.open(filepath)
                array = np.array(pil_image)
                return ImageData.from_numpy(array)
            except ImportError:
                print("PIL not available for image loading")
                return None
    
    def save_image(self, image: ImageData, filepath: str | Path, quality: int = 95) -> bool:
        """
        Save an image to file.
        
        Args:
            image: ImageData to save
            filepath: Output file path
            quality: JPEG quality (0-100)
            
        Returns:
            True if successful, False otherwise
        """
        filepath = str(filepath)
        
        if _CORE_AVAILABLE and hasattr(image, '_core_data'):
            try:
                return self._processor.saveImage(image._core_data, filepath, quality)
            except Exception as e:
                print(f"Error saving image: {e}")
                return False
        else:
            # Fallback using PIL
            try:
                from PIL import Image
                if image.channels == 1:
                    pil_image = Image.fromarray(image.pixels.squeeze(), 'L')
                elif image.channels == 3:
                    pil_image = Image.fromarray(image.pixels, 'RGB')
                elif image.channels == 4:
                    pil_image = Image.fromarray(image.pixels, 'RGBA')
                else:
                    raise ValueError(f"Unsupported channel count: {image.channels}")
                
                pil_image.save(filepath, quality=quality)
                return True
            except Exception as e:
                print(f"Error saving image: {e}")
                return False
    
    def resize(self, image: ImageData, new_width: int, new_height: int) -> Optional[ImageData]:
        """Resize image to new dimensions."""
        if _CORE_AVAILABLE:
            try:
                result = self._processor.resize(image._core_data, new_width, new_height)
                return self._convert_from_core(result)
            except Exception as e:
                print(f"Error resizing image: {e}")
                return None
        else:
            # Simple numpy-based resize (bilinear interpolation)
            try:
                from scipy import ndimage
                scale_y = new_height / image.height
                scale_x = new_width / image.width
                resized = ndimage.zoom(image.pixels, (scale_y, scale_x, 1), order=1)
                return ImageData.from_numpy(resized)
            except ImportError:
                print("SciPy not available for resize operation")
                return None
    
    def gaussian_blur(self, image: ImageData, sigma: float) -> Optional[ImageData]:
        """Apply Gaussian blur filter."""
        if _CORE_AVAILABLE:
            try:
                result = self._processor.gaussianBlur(image._core_data, sigma)
                return self._convert_from_core(result)
            except Exception as e:
                print(f"Error applying Gaussian blur: {e}")
                return None
        else:
            # Fallback using scipy
            try:
                from scipy import ndimage
                blurred = ndimage.gaussian_filter(image.pixels, sigma=(sigma, sigma, 0))
                return ImageData.from_numpy(blurred)
            except ImportError:
                print("SciPy not available for blur operation")
                return None
    
    def adjust_brightness(self, image: ImageData, factor: float) -> Optional[ImageData]:
        """Adjust image brightness."""
        result_pixels = np.clip(image.pixels * factor, 0, 255).astype(np.uint8)
        return ImageData.from_numpy(result_pixels)
    
    def adjust_contrast(self, image: ImageData, factor: float) -> Optional[ImageData]:
        """Adjust image contrast."""
        mean = np.mean(image.pixels)
        result_pixels = np.clip((image.pixels - mean) * factor + mean, 0, 255).astype(np.uint8)
        return ImageData.from_numpy(result_pixels)
    
    def set_thread_count(self, count: int):
        """Set number of threads for processing."""
        self._thread_count = count
        if _CORE_AVAILABLE:
            self._processor.setThreadCount(count)
    
    def enable_simd(self, enable: bool):
        """Enable or disable SIMD optimizations."""
        self._simd_enabled = enable
        if _CORE_AVAILABLE:
            self._processor.enableSIMD(enable)
    
    def _convert_from_core(self, core_data) -> Optional[ImageData]:
        """Convert C++ ImageData to Python ImageData."""
        if not core_data:
            return None
        
        image = ImageData(core_data.width, core_data.height, 
                         core_data.channels, core_data.bit_depth)
        image.pixels = np.array(core_data.pixels).reshape(
            (core_data.height, core_data.width, core_data.channels)
        )
        image._core_data = core_data
        return image


class PluginAPI:
    """
    Plugin API for extending OctoEdit functionality.
    
    This class provides a high-level interface for plugin developers
    to access OctoEdit's core functionality.
    """
    
    def __init__(self):
        self.image = ImageProcessor()
        self.io = IOManager()
    
    def register_filter(self, name: str, func: callable):
        """Register a custom filter function."""
        # Implementation for registering custom filters
        pass
    
    def register_tool(self, name: str, tool_class: type):
        """Register a custom tool class."""
        # Implementation for registering custom tools
        pass


class IOManager:
    """Handles file I/O operations."""
    
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']
    
    def load_image(self, filepath: str | Path) -> Optional[ImageData]:
        """Load image using the image processor."""
        processor = ImageProcessor()
        return processor.load_image(filepath)
    
    def save_image(self, image: ImageData, filepath: str | Path, **kwargs) -> bool:
        """Save image using the image processor."""
        processor = ImageProcessor()
        quality = kwargs.get('quality', 95)
        return processor.save_image(image, filepath, quality)
    
    def batch_process(self, input_dir: str | Path, output_dir: str | Path, 
                     process_func: callable) -> List[bool]:
        """Process multiple images in batch."""
        input_path = Path(input_dir)
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        results = []
        for file_path in input_path.glob('*'):
            if file_path.suffix.lower() in self.supported_formats:
                image = self.load_image(file_path)
                if image:
                    processed = process_func(image)
                    if processed:
                        output_file = output_path / file_path.name
                        success = self.save_image(processed, output_file)
                        results.append(success)
                    else:
                        results.append(False)
                else:
                    results.append(False)
        
        return results


# Global API instance for convenience
api = PluginAPI()

# Export main classes and functions
__all__ = [
    'ImageData',
    'ImageProcessor', 
    'PluginAPI',
    'IOManager',
    'api'
]