import { BrushType } from '@/types';

interface BrushCache {
  canvas: HTMLCanvasElement;
  imageData: ImageData;
  timestamp: number;
}

class BrushCacheManager {
  private cache: Map<string, BrushCache> = new Map();
  private maxCacheSize = 50;
  private maxCacheAge = 60000;
  private coloredBrushCache: Map<string, HTMLCanvasElement> = new Map();

  private getCacheKey(type: BrushType, size: number, hardness: number, angle: number): string {
    return `${type}_${Math.round(size)}_${hardness.toFixed(2)}_${Math.round(angle)}`;
  }

  private getColoredCacheKey(type: BrushType, size: number, hardness: number, angle: number, color: string): string {
    return `${this.getCacheKey(type, size, hardness, angle)}_${color}`;
  }

  getColoredBrush(type: BrushType, size: number, color: string, hardness: number = 0.5, angle: number = 0): HTMLCanvasElement {
    const coloredKey = this.getColoredCacheKey(type, size, hardness, angle, color);
    const cached = this.coloredBrushCache.get(coloredKey);
    
    if (cached) {
      return cached;
    }

    const baseBrush = this.getBrush(type, size, hardness, angle);
    const coloredCanvas = document.createElement('canvas');
    coloredCanvas.width = baseBrush.width;
    coloredCanvas.height = baseBrush.height;
    const ctx = coloredCanvas.getContext('2d', { willReadFrequently: true })!;
    
    ctx.drawImage(baseBrush, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, coloredCanvas.width, coloredCanvas.height);
    const data = imageData.data;
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    const rgb = hexToRgb(color);
    
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      data[i] = rgb.r;
      data[i + 1] = rgb.g;
      data[i + 2] = rgb.b;
      data[i + 3] = alpha;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    if (this.coloredBrushCache.size >= this.maxCacheSize * 2) {
      const firstKey = this.coloredBrushCache.keys().next().value;
      if (firstKey) this.coloredBrushCache.delete(firstKey);
    }
    
    this.coloredBrushCache.set(coloredKey, coloredCanvas);
    return coloredCanvas;
  }

  getBrush(type: BrushType, size: number, hardness: number = 0.5, angle: number = 0): HTMLCanvasElement {
    const key = this.getCacheKey(type, size, hardness, angle);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.maxCacheAge) {
      return cached.canvas;
    }

    const brush = this.generateBrush(type, size, hardness, angle);
    
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    const ctx = brush.getContext('2d', { willReadFrequently: true })!;
    const imageData = ctx.getImageData(0, 0, brush.width, brush.height);
    
    this.cache.set(key, {
      canvas: brush,
      imageData,
      timestamp: Date.now()
    });

    return brush;
  }

  private generateBrush(type: BrushType, size: number, hardness: number, angle: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    switch (type) {
      case BrushType.ROUND:
      case BrushType.SOFT_ROUND:
        this.drawRoundBrush(ctx, size, hardness);
        break;
      case BrushType.HARD_ROUND:
        this.drawRoundBrush(ctx, size, 1.0);
        break;
      case BrushType.CALLIGRAPHY:
        this.drawCalligraphyBrush(ctx, size, angle, 0.3);
        break;
      case BrushType.FLAT:
        this.drawFlatBrush(ctx, size, angle);
        break;
      case BrushType.SPRAY:
        this.drawSprayBrush(ctx, size);
        break;
      case BrushType.PENCIL:
        this.drawPencilBrush(ctx, size);
        break;
      case BrushType.MARKER:
        this.drawMarkerBrush(ctx, size, hardness);
        break;
      case BrushType.WATERCOLOR:
        this.drawWatercolorBrush(ctx, size);
        break;
      default:
        this.drawRoundBrush(ctx, size, hardness);
    }

    return canvas;
  }

  private drawRoundBrush(ctx: CanvasRenderingContext2D, size: number, hardness: number) {
    const center = size / 2;
    const radius = size / 2;

    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    
    if (hardness >= 1.0) {
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    } else {
      const hardEdge = hardness * 0.9;
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(hardEdge, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  private drawCalligraphyBrush(ctx: CanvasRenderingContext2D, size: number, angle: number, widthRatio: number) {
    const center = size / 2;
    const majorAxis = size / 2;
    const minorAxis = majorAxis * widthRatio;

    ctx.translate(center, center);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-center, -center);

    ctx.beginPath();
    ctx.ellipse(center, center, majorAxis, minorAxis, 0, 0, 2 * Math.PI);
    
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, majorAxis);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private drawFlatBrush(ctx: CanvasRenderingContext2D, size: number, angle: number) {
    const center = size / 2;
    const width = size * 0.3;
    const length = size * 0.9;

    ctx.translate(center, center);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-center, -center);

    const x = center - width / 2;
    const y = center - length / 2;

    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, length);
  }

  private drawSprayBrush(ctx: CanvasRenderingContext2D, size: number) {
    const center = size / 2;
    const radius = size / 2;
    const density = 50;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * radius * 0.9;
      const x = center + Math.cos(angle) * distance;
      const y = center + Math.sin(angle) * distance;
      const alpha = 0.3 + Math.random() * 0.7;
      const particleSize = 1 + Math.random() * 2;

      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawPencilBrush(ctx: CanvasRenderingContext2D, size: number) {
    this.drawRoundBrush(ctx, size, 1.0);
    
    // Add texture noise
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const noise = 200 + Math.random() * 55;
        data[i + 3] = Math.min(data[i + 3], noise);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  private drawMarkerBrush(ctx: CanvasRenderingContext2D, size: number, hardness: number) {
    this.drawRoundBrush(ctx, size, hardness);
    
    // Add center boost
    const center = size / 2;
    const boostRadius = size / 4;
    
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, boostRadius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  private drawWatercolorBrush(ctx: CanvasRenderingContext2D, size: number) {
    this.drawRoundBrush(ctx, size, 0.3);
    
    // Add watery texture
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const variation = 0.7 + Math.random() * 0.3;
        data[i + 3] = Math.floor(data[i + 3] * variation);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Blur for watercolor effect
    ctx.filter = 'blur(1px)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
  }

  clearCache() {
    this.cache.clear();
  }
}

export const brushCacheManager = new BrushCacheManager();
