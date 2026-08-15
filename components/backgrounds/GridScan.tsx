'use client';

import React, { useEffect, useRef } from 'react';

export interface GridScanProps {
  /**
   * Primary scan beam color.
   * @default '#15e113'
   */
  scanColor?: string;
  /**
   * Base grid line color.
   * @default 'rgba(255, 255, 255, 0.05)'
   */
  gridColor?: string;
  /**
   * Grid square size in pixels.
   * @default 40
   */
  gridScale?: number;
  /**
   * Scan sweep speed multiplier.
   * @default 1.0
   */
  scanSpeed?: number;
  /**
   * Length/trail of the scan beam glow in pixels.
   * @default 180
   */
  scanHeight?: number;
  /**
   * Overall opacity of the GridScan component wrapper.
   * @default 0.75
   */
  opacity?: number;
  /**
   * Optional additional CSS classes for container element.
   */
  className?: string;
}

export function GridScan({
  scanColor = '#15e113',
  gridColor = 'rgba(255, 255, 255, 0.05)',
  gridScale = 40,
  scanSpeed = 1.0,
  scanHeight = 180,
  opacity = 0.75,
  className = '',
}: GridScanProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let scanY = -scanHeight;

    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
      let cleaned = hex.replace('#', '');
      if (cleaned.length === 3) {
        cleaned = cleaned
          .split('')
          .map((char) => char + char)
          .join('');
      }
      const num = parseInt(cleaned, 16);
      if (isNaN(num)) return { r: 21, g: 225, b: 19 };
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    };

    const scanRgb = hexToRgb(scanColor);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Advance scan beam position
      const speedPxPerSec = 110 * scanSpeed;
      scanY += speedPxPerSec * delta;
      if (scanY > height + scanHeight) {
        scanY = -scanHeight;
      }

      // 1. Base Grid Lines (Thin, sleek 0.75px line)
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.75;

      for (let x = 0; x <= width; x += gridScale) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += gridScale) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }

      // 2. Scan Beam Trailing Gradient Glow
      const scanTop = scanY - scanHeight;
      const scanBottom = scanY;

      if (scanBottom > 0 && scanTop < height) {
        const scanGradient = ctx.createLinearGradient(0, scanTop, 0, scanBottom);
        scanGradient.addColorStop(0, `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0)`);
        scanGradient.addColorStop(0.7, `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0.05)`);
        scanGradient.addColorStop(0.95, `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0.18)`);
        scanGradient.addColorStop(1, `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0.02)`);

        ctx.fillStyle = scanGradient;
        ctx.fillRect(0, scanTop, width, scanHeight);

        // 3. Illuminated Grid Lines within the Scan Trail
        const startY = Math.max(0, Math.floor(scanTop / gridScale) * gridScale);
        const endY = Math.min(height, Math.ceil(scanBottom / gridScale) * gridScale);

        // Highlight horizontal grid lines under scan beam
        for (let y = startY; y <= endY; y += gridScale) {
          const dist = scanY - y;
          if (dist >= 0 && dist <= scanHeight) {
            const factor = Math.pow(1 - dist / scanHeight, 1.8);
            if (factor > 0.01) {
              ctx.strokeStyle = `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, ${factor * 0.45})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(0, y + 0.5);
              ctx.lineTo(width, y + 0.5);
              ctx.stroke();
            }
          }
        }

        // Highlight vertical grid segments inside scan beam region
        for (let x = 0; x <= width; x += gridScale) {
          const segTop = Math.max(0, scanTop);
          const segBottom = Math.min(height, scanBottom);

          const vertGradient = ctx.createLinearGradient(0, segTop, 0, segBottom);
          vertGradient.addColorStop(0, `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0)`);
          vertGradient.addColorStop(0.9, `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0.3)`);
          vertGradient.addColorStop(1, `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0.5)`);

          ctx.strokeStyle = vertGradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 0.5, segTop);
          ctx.lineTo(x + 0.5, segBottom);
          ctx.stroke();
        }

        // 4. Subtle glowing crosshair markers at grid intersections
        for (let x = 0; x <= width; x += gridScale) {
          for (let y = startY; y <= endY; y += gridScale) {
            const dist = scanY - y;
            if (dist >= 0 && dist <= scanHeight) {
              const factor = Math.pow(1 - dist / scanHeight, 2);
              if (factor > 0.15) {
                const alpha = factor * 0.75;
                ctx.fillStyle = `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, ${alpha})`;

                // Subtle 2px crosshair intersection marker
                ctx.fillRect(x - 1, y - 1, 3, 3);
              }
            }
          }
        }

        // 5. Leading Laser Scan Line with sharp glow
        ctx.strokeStyle = `rgba(${scanRgb.r}, ${scanRgb.g}, ${scanRgb.b}, 0.95)`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = scanColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, scanY + 0.5);
        ctx.lineTo(width, scanY + 0.5);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow blur
      }

      // 6. Radial Vignette Edge Fade (Seamlessly blend into dark navy background)
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.max(width, height) * 0.75;

      const vignette = ctx.createRadialGradient(
        centerX,
        centerY,
        maxRadius * 0.3,
        centerX,
        centerY,
        maxRadius
      );
      vignette.addColorStop(0, 'rgba(9, 13, 22, 0)');
      vignette.addColorStop(0.7, 'rgba(9, 13, 22, 0.4)');
      vignette.addColorStop(1, 'rgba(9, 13, 22, 0.85)');

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scanColor, gridColor, gridScale, scanSpeed, scanHeight]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

export default GridScan;
