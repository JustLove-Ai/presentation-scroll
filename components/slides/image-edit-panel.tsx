"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Upload, Sparkles, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";

interface ImageEditPanelProps {
  block: any;
  onContentChange: (content: any) => void;
  onStyleChange: (style: any) => void;
  onClose?: () => void;
}

export function ImageEditPanel({
  block,
  onContentChange,
  onStyleChange,
  onClose,
}: ImageEditPanelProps) {
  const [altText, setAltText] = useState(block.content.alt || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create FormData to upload the file
      const formData = new FormData();
      formData.append("file", file);

      // For now, convert to base64 for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onContentChange({
          url: base64String,
          alt: altText || file.name,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to actual storage (S3, Cloudinary, etc.)
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const { url } = await response.json();
      // onContentChange({ url, alt: altText || file.name });
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      // TODO: Call actual AI image generation API (DALL-E, Midjourney, etc.)
      // For now, use Unsplash API as placeholder
      const response = await fetch(
        `https://source.unsplash.com/800x600/?${encodeURIComponent(aiPrompt)}`
      );

      onContentChange({
        url: response.url,
        alt: aiPrompt,
      });
      setAltText(aiPrompt);
      setAiPrompt("");
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const unsplashImages = [
    {
      name: "Business Team",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
    },
    {
      name: "Office Work",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    },
    {
      name: "Tech",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
    },
    {
      name: "Nature",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    },
    {
      name: "City",
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200",
    },
    {
      name: "Abstract",
      url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200",
    },
  ];

  const handleSelectImage = (url: string) => {
    onContentChange({
      url,
      alt: altText || "Stock image",
    });
  };

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
            <ImageIcon className="h-4 w-4" />
            Image Settings
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

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              <Upload className="h-3 w-3 inline mr-1" />
              Upload Image
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              className="w-full"
              variant="outline"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supports JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* AI Image Generation */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              <Sparkles className="h-3 w-3 inline mr-1" />
              AI Generate Image
            </Label>
            <div className="space-y-2">
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="min-h-[80px] resize-none"
              />
              <Button
                onClick={handleAIGenerate}
                size="sm"
                className="w-full"
                disabled={isGenerating || !aiPrompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Uses AI to create unique images from your description
              </p>
            </div>
          </div>

          {/* Alt Text */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Alt Text
            </Label>
            <Input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Description..."
            />
          </div>

          {/* Stock Images */}
          <div>
            <Label className="text-xs text-muted-foreground mb-3 block">
              Stock Images
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {unsplashImages.map((img) => (
                <button
                  key={img.url}
                  onClick={() => handleSelectImage(img.url)}
                  className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors group"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{img.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Object Fit */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Image Fit
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Cover", value: "cover" },
                { name: "Contain", value: "contain" },
                { name: "Fill", value: "fill" },
                { name: "None", value: "none" },
              ].map((fit) => (
                <Button
                  key={fit.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleChange({ objectFit: fit.value })}
                >
                  {fit.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Upload Note */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Upload Coming Soon</p>
                <p className="text-xs text-blue-700 mt-1">
                  For now, use image URLs or select from stock photos
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
