import { BrushType } from '@/types';

export interface BrushMask {
  data: ImageData;
  size: number;
}

export class BrushRenderer {
  static createBrushMask(
    type: BrushType,
    size: number,
    hardness: number = 0.5,
    angle: number = 0
  ): BrushMask {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    ctx.clearRect(0, 0, size, size);

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
        this.drawSprayBrush(ctx, size, 50, 0.5);
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

    const imageData = ctx.getImageData(0, 0, size, size);
    return { data: imageData, size };
  }

  private static drawRoundBrush(ctx: CanvasRenderingContext2D, size: number, hardness: number) {
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

  private static drawCalligraphyBrush(
    ctx: CanvasRenderingContext2D,
    size: number,
    angle: number,
    widthRatio: number
  ) {
    const center = size / 2;
    const majorAxis = size / 2;
    const minorAxis = majorAxis * widthRatio;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-center, -center);

    ctx.beginPath();
    ctx.ellipse(center, center, majorAxis, minorAxis, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fill();

    ctx.restore();
  }

  private static drawSprayBrush(
    ctx: CanvasRenderingContext2D,
    size: number,
    density: number,
    jitter: number
  ) {
    const center = size / 2;
    const radius = size / 2;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()) * radius * (1 - jitter * 0.5);
      
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      
      const alpha = 0.3 + Math.random() * 0.7;
      const particleSize = 1 + Math.random() * jitter * 3;

      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fill();
    }
  }

  private static drawFlatBrush(ctx: CanvasRenderingContext2D, size: number, angle: number) {
    const center = size / 2;
    const width = size * 0.3;
    const length = size * 0.9;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((angle * Math.PI) / 180);

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(-width / 2, -length / 2, width, length);

    ctx.restore();
  }

  private static drawPencilBrush(ctx: CanvasRenderingContext2D, size: number) {
    this.drawRoundBrush(ctx, size, 1.0);
    
    // Add noise for pencil texture
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

  private static drawMarkerBrush(ctx: CanvasRenderingContext2D, size: number, hardness: number) {
    this.drawRoundBrush(ctx, size, hardness);
    
    // Add center boost
    const center = size / 2;
    const centerRadius = size / 4;
    
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, centerRadius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  private static drawWatercolorBrush(ctx: CanvasRenderingContext2D, size: number) {
    this.drawRoundBrush(ctx, size, 0.3);
    
    // Add watercolor effect with noise
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const noise = 0.7 + Math.random() * 0.3;
        data[i + 3] = Math.floor(data[i + 3] * noise);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  static applyBrushDab(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    opacity: number,
    mask: BrushMask
  ) {
    ctx.save();
    
    // Parse color
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = mask.size;
    tempCanvas.height = mask.size;
    
    // Apply color to mask
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, mask.size, mask.size);
    
    const colorData = tempCtx.getImageData(0, 0, mask.size, mask.size);
    const maskData = mask.data;
    
    for (let i = 0; i < colorData.data.length; i += 4) {
      colorData.data[i + 3] = maskData.data[i + 3] * opacity;
    }
    
    tempCtx.putImageData(colorData, 0, 0);
    
    // Draw to main canvas
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tempCanvas, x - mask.size / 2, y - mask.size / 2);
    
    ctx.restore();
  }
}
