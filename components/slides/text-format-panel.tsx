"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold, Italic, Underline, Type, Palette, Highlighter, X, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface TextFormatPanelProps {
  block: any;
  onStyleChange: (style: any) => void;
  onContentChange?: (content: any) => void;
  onSelectionFormat?: (command: string, value?: string) => void;
  onClose?: () => void;
}

export function TextFormatPanel({ block, onStyleChange, onContentChange, onSelectionFormat, onClose }: TextFormatPanelProps) {
  const currentStyle = block.style || {};
  const currentContent = block.content || {};

  const [color, setColor] = useState(currentStyle.color || "#000000");
  const [fontSize, setFontSize] = useState(currentStyle.fontSize || "1rem");
  const [fontFamily, setFontFamily] = useState(currentStyle.fontFamily || "inherit");
  const [backgroundColor, setBackgroundColor] = useState(currentStyle.backgroundColor || "transparent");
  const [textContent, setTextContent] = useState(currentContent.text || "");

  // Update state when block changes
  useEffect(() => {
    setColor(currentStyle.color || "#000000");
    setFontSize(currentStyle.fontSize || "1rem");
    setFontFamily(currentStyle.fontFamily || "inherit");
    setBackgroundColor(currentStyle.backgroundColor || "transparent");
    setTextContent(currentContent.text || "");
  }, [currentStyle, currentContent]);

  // Apply formatting to selected text
  const applySelectionFormat = (command: string, value?: string) => {
    if (onSelectionFormat) {
      onSelectionFormat(command, value);
    } else {
      // Fallback to document.execCommand
      document.execCommand(command, false, value);
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    applySelectionFormat("foreColor", newColor);
    onStyleChange({ color: newColor });
  };

  const handleBackgroundColorChange = (newColor: string) => {
    setBackgroundColor(newColor);
    applySelectionFormat("hiliteColor", newColor);
    onStyleChange({ backgroundColor: newColor });
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    onStyleChange({ fontSize: size });
  };

  const toggleBold = () => {
    applySelectionFormat("bold");
  };

  const toggleItalic = () => {
    applySelectionFormat("italic");
  };

  const toggleUnderline = () => {
    applySelectionFormat("underline");
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    applySelectionFormat("fontName", family);
    onStyleChange({ fontFamily: family });
  };

  const handleContentChange = (newText: string) => {
    setTextContent(newText);
  };

  // Debounced save when text content changes
  useEffect(() => {
    if (textContent === currentContent.text) return;

    const timeoutId = setTimeout(() => {
      if (onContentChange) {
        onContentChange({
          ...currentContent,
          text: textContent,
        });
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [textContent]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full"
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text Editor
          </h3>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 m-4">
          <TabsTrigger value="content">
            <FileText className="h-3 w-3 mr-1" />
            Content
          </TabsTrigger>
          <TabsTrigger value="formatting">
            <Type className="h-3 w-3 mr-1" />
            Formatting
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Edit Text Content
                </Label>
                <Textarea
                  value={textContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter your text here..."
                  className="min-h-[300px] resize-none font-sans"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Changes are saved automatically
                </p>
              </div>

              {/* Heading Level (only for heading blocks) */}
              {block.type === "heading" && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Heading Level
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((level) => (
                      <Button
                        key={level}
                        variant={currentContent.level === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (onContentChange) {
                            onContentChange({
                              ...currentContent,
                              level,
                            });
                          }
                        }}
                      >
                        H{level}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Formatting Tab */}
        <TabsContent value="formatting" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-6 mt-4">
          {/* Text Style Buttons */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Style (works on selected text)
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBold}
                className="flex-1"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleItalic}
                className="flex-1"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleUnderline}
                className="flex-1"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              <Palette className="h-3 w-3 inline mr-1" />
              Text Color (for selected text)
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* Background/Highlight Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              <Highlighter className="h-3 w-3 inline mr-1" />
              Highlight Color (for selected text)
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                placeholder="transparent"
                className="flex-1"
              />
            </div>
          </div>

          {/* Font Size */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Font Size
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {["1rem", "1.25rem", "1.5rem", "2rem", "2.5rem", "3rem", "4rem", "5rem"].map(
                (size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFontSizeChange(size)}
                    className="text-xs"
                  >
                    {size}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Font Family
            </Label>
            <div className="space-y-2">
              {[
                { name: "Default", value: "inherit" },
                { name: "Inter", value: "Inter, sans-serif" },
                { name: "Georgia", value: "Georgia, serif" },
                { name: "Courier", value: "Courier, monospace" },
                { name: "Poppins", value: "Poppins, sans-serif" },
              ].map((font) => (
                <Button
                  key={font.value}
                  variant={fontFamily === font.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFontFamilyChange(font.value)}
                  className="w-full justify-start"
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Alignment
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Left", value: "left" },
                { name: "Center", value: "center" },
                { name: "Right", value: "right" },
              ].map((align) => (
                <Button
                  key={align.value}
                  variant={
                    currentStyle.textAlign === align.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onStyleChange({ textAlign: align.value })}
                >
                  {align.name}
                </Button>
              ))}
            </div>
          </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
