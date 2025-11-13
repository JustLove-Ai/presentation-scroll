"use client";

import { useState, useCallback } from "react";
import { AnnotationToolbar, AnnotationTool } from "./annotation-toolbar";
import { AnnotationCanvas, AnnotationStroke } from "./annotation-canvas";

interface AnnotationLayerProps {
  isActive: boolean;
  onClose: () => void;
  initialStrokes?: AnnotationStroke[];
  onSave?: (strokes: AnnotationStroke[]) => void;
  onChange?: (strokes: AnnotationStroke[]) => void; // Real-time updates to parent
}

export function AnnotationLayer({
  isActive,
  onClose,
  initialStrokes = [],
  onSave,
  onChange,
}: AnnotationLayerProps) {
  const [activeTool, setActiveTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState('#EF4444'); // Red default
  const [strokes, setStrokes] = useState<AnnotationStroke[]>(initialStrokes);
  const [history, setHistory] = useState<AnnotationStroke[][]>([initialStrokes]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleStrokesChange = useCallback((newStrokes: AnnotationStroke[]) => {
    setStrokes(newStrokes);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newStrokes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Notify parent of changes in real-time (SHARED STATE UPDATE)
    if (onChange) {
      onChange(newStrokes);
    }
  }, [history, historyIndex, onChange]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
      // Update parent state immediately
      if (onChange) {
        onChange(history[newIndex]);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
      // Update parent state immediately
      if (onChange) {
        onChange(history[newIndex]);
      }
    }
  };

  const handleClear = () => {
    if (confirm('Clear all annotations?')) {
      handleStrokesChange([]);
    }
  };

  const handleClose = async () => {
    console.log('[AnnotationLayer] handleClose called, strokes count:', strokes.length);
    if (onSave) {
      console.log('[AnnotationLayer] Calling onSave with', strokes.length, 'strokes');
      await onSave(strokes);
      console.log('[AnnotationLayer] onSave completed');
    } else {
      console.log('[AnnotationLayer] WARNING: onSave is not defined!');
    }
    onClose();
  };

  if (!isActive) return null;

  return (
    <>
      {/* Annotation Canvas Overlay */}
      <div className="absolute inset-0 z-40">
        <AnnotationCanvas
          activeTool={activeTool}
          color={color}
          strokes={strokes}
          onStrokesChange={handleStrokesChange}
          isActive={isActive}
        />
      </div>

      {/* Annotation Toolbar */}
      <AnnotationToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        color={color}
        onColorChange={setColor}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onClose={handleClose}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
    </>
  );
}
