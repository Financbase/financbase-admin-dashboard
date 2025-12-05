/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface MicrophoneWaveformProps {
  active?: boolean;
  processing?: boolean;
  height?: number;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  fadeEdges?: boolean;
  sensitivity?: number;
  onError?: (error: Error) => void;
  className?: string;
}

export function MicrophoneWaveform({
  active = false,
  processing = false,
  height = 120,
  barWidth = 3,
  barGap = 2,
  barRadius = 2,
  fadeEdges = true,
  sensitivity = 1.5,
  onError,
  className,
}: MicrophoneWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bars = 50;
    const totalWidth = bars * (barWidth + barGap) - barGap;

    canvas.width = totalWidth;
    canvas.height = height;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = active ? "#3b82f6" : "#e5e7eb";

      for (let i = 0; i < bars; i++) {
        const amplitude = active
          ? Math.random() * (height * 0.8) * sensitivity
          : height * 0.1;

        const x = i * (barWidth + barGap);
        const barHeight = Math.max(4, amplitude);

        if (fadeEdges) {
          const fade = Math.min(
            1,
            Math.min(i / 5, (bars - i) / 5)
          );
          ctx.globalAlpha = fade;
        } else {
          ctx.globalAlpha = 1;
        }

        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      }

      ctx.globalAlpha = 1;

      if (active || processing) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (active || processing) {
      draw();
    } else {
      draw(); // Draw once when inactive
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, processing, height, barWidth, barGap, barRadius, sensitivity, fadeEdges]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full rounded-lg", className)}
      style={{ height }}
    />
  );
}
