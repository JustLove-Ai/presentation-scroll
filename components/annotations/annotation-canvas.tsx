"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { AnnotationTool } from "./annotation-toolbar";

export interface AnnotationStroke {
  tool: AnnotationTool;
  color: string;
  points: { x: number; y: number }[];
  width?: number;
  height?: number;
}

interface AnnotationCanvasProps {
  activeTool: AnnotationTool;
  color: string;
  strokes: AnnotationStroke[];
  onStrokesChange: (strokes: AnnotationStroke[]) => void;
  isActive: boolean;
}

export function AnnotationCanvas({
  activeTool,
  color,
  strokes,
  onStrokesChange,
  isActive,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<AnnotationStroke | null>(null);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke
    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: AnnotationStroke) => {
    if (stroke.points.length === 0) return;

    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.tool === 'highlighter' ? 20 : stroke.tool === 'eraser' ? 30 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.3;
    } else {
      ctx.globalAlpha = 1;
    }

    if (stroke.tool === 'pen' || stroke.tool === 'highlighter' || stroke.tool === 'eraser') {
      // Free-hand drawing
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === 'rectangle') {
      // Rectangle
      if (stroke.points.length >= 2) {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.strokeRect(start.x, start.y, width, height);
      }
    } else if (stroke.tool === 'circle') {
      // Circle/Ellipse
      if (stroke.points.length >= 2) {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        const centerX = start.x + (end.x - start.x) / 2;
        const centerY = start.y + (end.y - start.y) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    } else if (stroke.tool === 'arrow') {
      // Arrow
      if (stroke.points.length >= 2) {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];

        // Draw line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle - arrowAngle),
          end.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle + arrowAngle),
          end.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match parent
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }

    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;

    setIsDrawing(true);
    const point = getCanvasPoint(e);

    setCurrentStroke({
      tool: activeTool,
      color: activeTool === 'eraser' ? '#FFFFFF' : color,
      points: [point],
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;

    const point = getCanvasPoint(e);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      // Add point to free-hand drawing
      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, point],
      });
    } else {
      // For shapes, just update the end point
      setCurrentStroke({
        ...currentStroke,
        points: [currentStroke.points[0], point],
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);

    // Add stroke to history
    if (activeTool === 'eraser') {
      // Eraser: remove strokes that intersect with eraser path
      const newStrokes = strokes.filter(stroke => {
        return !strokesIntersect(stroke, currentStroke);
      });
      onStrokesChange(newStrokes);
    } else {
      onStrokesChange([...strokes, currentStroke]);
    }

    setCurrentStroke(null);
  };

  const strokesIntersect = (stroke1: AnnotationStroke, stroke2: AnnotationStroke): boolean => {
    // Simple intersection detection - check if any points are close
    for (const p1 of stroke1.points) {
      for (const p2 of stroke2.points) {
        const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        if (distance < 30) return true; // Eraser radius
      }
    }
    return false;
  };

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ touchAction: 'none' }}
    />
  );
}
