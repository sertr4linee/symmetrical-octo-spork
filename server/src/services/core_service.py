"""
Service d'interface avec le core C++ pour le traitement d'images
Utilise les bindings Python générés par pybind11
"""

import numpy as np
from typing import Optional, Tuple, Dict, Any
import cv2
import logging

logger = logging.getLogger(__name__)

class CoreImageService:
    """Service pour interfacer avec le core C++ Better GIMP"""
    
    def __init__(self):
        self._core_available = False
        self._core_module = None
        self._initialize_core()
    
    def _initialize_core(self):
        """Initialise le module C++ si disponible"""
        try:
            # Tentative d'import du module C++ compilé
            # import bettergimp_core  # Module généré par pybind11
            # self._core_module = bettergimp_core
            # 
            # # Initialiser le core avec le nombre de threads détectés
            # import os
            # num_threads = os.cpu_count() or 4
            # success = self._core_module.initialize(num_threads)
            # 
            # if success:
            #     self._core_available = True
            #     version = self._core_module.getVersion()
            #     logger.info(f"Better GIMP Core initialized successfully - Version: {version}")
            # else:
            #     logger.warning("Failed to initialize Better GIMP Core")
            
            # Pour l'instant, utiliser OpenCV directement
            logger.info("Using OpenCV fallback for image processing")
            self._core_available = False
            
        except ImportError:
            logger.warning("Better GIMP Core C++ module not available, using OpenCV fallback")
            self._core_available = False
        except Exception as e:
            logger.error(f"Error initializing Better GIMP Core: {e}")
            self._core_available = False

    def is_core_available(self) -> bool:
        """Vérifie si le core C++ est disponible"""
        return self._core_available
    
    def get_core_info(self) -> Dict[str, Any]:
        """Retourne les informations sur le core"""
        if self._core_available and self._core_module:
            return {
                "available": True,
                "version": self._core_module.getVersion(),
                "simd_available": self._core_module.isSimdAvailable(),
                "backend": "C++ Core"
            }
        else:
            return {
                "available": False,
                "version": cv2.__version__,
                "simd_available": False,
                "backend": "OpenCV Python"
            }
    
    def apply_gaussian_blur(self, image_array: np.ndarray, sigma: float = 1.0) -> np.ndarray:
        """
        Applique un flou gaussien à l'image
        
        Args:
            image_array: Array numpy de l'image (H, W, C)
            sigma: Écart-type du noyau gaussien
            
        Returns:
            Array numpy de l'image filtrée
        """
        try:
            if self._core_available and self._core_module:
                # Utiliser le core C++ pour un traitement optimisé SIMD
                # return self._core_module.apply_gaussian_blur(image_array, sigma)
                pass
            
            # Fallback OpenCV
            kernel_size = int(6 * sigma + 1)
            if kernel_size % 2 == 0:
                kernel_size += 1
            
            result = cv2.GaussianBlur(image_array, (kernel_size, kernel_size), sigma)
            logger.info(f"Applied Gaussian blur (sigma={sigma}) using OpenCV")
            return result
            
        except Exception as e:
            logger.error(f"Error applying Gaussian blur: {e}")
            raise
    
    def apply_sharpen_filter(self, image_array: np.ndarray, strength: float = 1.0) -> np.ndarray:
        """
        Applique un filtre de netteté (unsharp mask)
        
        Args:
            image_array: Array numpy de l'image
            strength: Force du filtre (0.0 à 2.0)
            
        Returns:
            Array numpy de l'image filtrée
        """
        try:
            if self._core_available and self._core_module:
                # return self._core_module.apply_sharpen_filter(image_array, strength)
                pass
            
            # Fallback OpenCV - Unsharp Mask
            # Créer un masque flou
            blurred = cv2.GaussianBlur(image_array, (0, 0), 1.0)
            
            # Calculer le masque de netteté
            sharpened = cv2.addWeighted(image_array, 1.0 + strength, blurred, -strength, 0)
            
            # Clamp les valeurs
            result = np.clip(sharpened, 0, 255).astype(np.uint8)
            logger.info(f"Applied sharpen filter (strength={strength}) using OpenCV")
            return result
            
        except Exception as e:
            logger.error(f"Error applying sharpen filter: {e}")
            raise
    
    def adjust_brightness_contrast(
        self, 
        image_array: np.ndarray, 
        brightness: float = 0.0, 
        contrast: float = 1.0
    ) -> np.ndarray:
        """
        Ajuste la luminosité et le contraste
        
        Args:
            image_array: Array numpy de l'image
            brightness: Ajustement luminosité (-100 à 100)
            contrast: Facteur de contraste (0.0 à 2.0)
            
        Returns:
            Array numpy de l'image ajustée
        """
        try:
            if self._core_available and self._core_module:
                # return self._core_module.adjust_brightness_contrast(image_array, brightness, contrast)
                pass
            
            # Fallback OpenCV
            # Normaliser brightness de [-100, 100] vers [-100, 100]
            alpha = contrast  # Contraste
            beta = brightness  # Luminosité
            
            # Appliquer la transformation: new_pixel = alpha * old_pixel + beta
            result = cv2.convertScaleAbs(image_array, alpha=alpha, beta=beta)
            logger.info(f"Applied brightness/contrast (b={brightness}, c={contrast}) using OpenCV")
            return result
            
        except Exception as e:
            logger.error(f"Error adjusting brightness/contrast: {e}")
            raise
    
    def resize_image(
        self, 
        image_array: np.ndarray, 
        width: int, 
        height: int, 
        interpolation: str = 'lanczos'
    ) -> np.ndarray:
        """
        Redimensionne une image avec différents algorithmes d'interpolation
        
        Args:
            image_array: Array numpy de l'image
            width, height: Nouvelles dimensions
            interpolation: 'nearest', 'linear', 'cubic', 'lanczos'
            
        Returns:
            Array numpy de l'image redimensionnée
        """
        try:
            if self._core_available and self._core_module:
                # return self._core_module.resize_image(image_array, width, height, interpolation)
                pass
            
            # Fallback OpenCV
            interpolation_map = {
                'nearest': cv2.INTER_NEAREST,
                'linear': cv2.INTER_LINEAR,
                'cubic': cv2.INTER_CUBIC,
                'lanczos': cv2.INTER_LANCZOS4
            }
            
            cv_interpolation = interpolation_map.get(interpolation, cv2.INTER_LANCZOS4)
            result = cv2.resize(image_array, (width, height), interpolation=cv_interpolation)
            logger.info(f"Resized image to {width}x{height} using {interpolation} (OpenCV)")
            return result
            
        except Exception as e:
            logger.error(f"Error resizing image: {e}")
            raise
    
    def rotate_image(self, image_array: np.ndarray, angle: float) -> np.ndarray:
        """
        Fait tourner une image
        
        Args:
            image_array: Array numpy de l'image
            angle: Angle en degrés (positif = sens horaire)
            
        Returns:
            Array numpy de l'image tournée
        """
        try:
            if self._core_available and self._core_module:
                # return self._core_module.rotate_image(image_array, angle)
                pass
            
            # Fallback OpenCV
            height, width = image_array.shape[:2]
            center = (width // 2, height // 2)
            
            # Matrice de rotation
            rotation_matrix = cv2.getRotationMatrix2D(center, -angle, 1.0)
            
            # Calculer la nouvelle taille pour éviter la coupure
            cos_val = abs(rotation_matrix[0, 0])
            sin_val = abs(rotation_matrix[0, 1])
            new_width = int(height * sin_val + width * cos_val)
            new_height = int(height * cos_val + width * sin_val)
            
            # Ajuster la matrice pour centrer l'image
            rotation_matrix[0, 2] += (new_width / 2) - center[0]
            rotation_matrix[1, 2] += (new_height / 2) - center[1]
            
            result = cv2.warpAffine(image_array, rotation_matrix, (new_width, new_height))
            logger.info(f"Rotated image by {angle}° using OpenCV")
            return result
            
        except Exception as e:
            logger.error(f"Error rotating image: {e}")
            raise

# Instance globale du service
core_service = CoreImageService()