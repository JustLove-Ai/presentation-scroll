"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Pencil,
  Square,
  Circle,
  ArrowRight,
  Highlighter,
  Eraser,
  Undo,
  Redo,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";

export type AnnotationTool = 'pen' | 'rectangle' | 'circle' | 'arrow' | 'highlighter' | 'eraser';

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onClose: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#EC4899', // Pink
];

export function AnnotationToolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  onUndo,
  onRedo,
  onClear,
  onClose,
  canUndo,
  canRedo,
}: AnnotationToolbarProps) {
  const [customColor, setCustomColor] = useState(color);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onColorChange(newColor);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl shadow-2xl p-3 flex items-center gap-2">
      {/* Drawing Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={activeTool === 'pen' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('pen')}
          title="Pen"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('rectangle')}
          title="Rectangle"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'circle' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('circle')}
          title="Circle"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'arrow' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('arrow')}
          title="Arrow"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'highlighter' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('highlighter')}
          title="Highlighter"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'eraser' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('eraser')}
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-10 h-10 p-0">
            <div
              className="w-6 h-6 rounded border-2 border-gray-300"
              style={{ backgroundColor: color }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Preset Colors</p>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => onColorChange(presetColor)}
                    className={`w-10 h-10 rounded border-2 transition-all ${
                      color === presetColor
                        ? 'border-primary scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Custom Color</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      onColorChange(e.target.value);
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-8" />

      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Clear and Close */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          title="Clear All"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          title="Close Annotations"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
