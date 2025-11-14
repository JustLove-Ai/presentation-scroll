"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Upload, Sparkles, Loader2, X, Trash2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ImageEditPanelProps {
  block: any;
  onContentChange: (content: any) => void;
  onStyleChange: (style: any) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export function ImageEditPanel({
  block,
  onContentChange,
  onStyleChange,
  onDelete,
  onClose,
}: ImageEditPanelProps) {
  const [altText, setAltText] = useState(block.content.alt || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's image library on mount
  useEffect(() => {
    loadUserImages();
  }, []);

  const loadUserImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch("/api/images?limit=20");
      const result = await response.json();
      if (result.success) {
        setUserImages(result.images);
      }
    } catch (error) {
      console.error("Failed to load images:", error);
    }
    setIsLoadingImages(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert to base64 for immediate display
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Upload to library via API
        const response = await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: base64String,
            alt: file.name,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Update the slide with the uploaded image
          onContentChange({
            url: base64String,
            alt: altText || file.name,
          });

          // Reload library to show new image
          await loadUserImages();
          toast.success("Image uploaded to library");
        } else {
          toast.error(result.error || "Failed to upload image");
        }

        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          quality: "medium",
        }),
      });

      const result = await response.json();

      if (result.success && result.image) {
        // Update the slide with the generated image
        onContentChange({
          url: result.image.url,
          alt: aiPrompt,
        });

        setAltText(aiPrompt);
        setAiPrompt("");

        // Reload library to show new image
        await loadUserImages();
        toast.success("Image generated with AI");
      } else {
        toast.error(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = (url: string, alt?: string) => {
    onContentChange({
      url,
      alt: alt || altText || "Image from library",
    });
  };

  const handleDeleteClick = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the image when deleting
    setImageToDelete(imageId);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      const response = await fetch(`/api/images?id=${imageToDelete}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Image deleted");
        await loadUserImages(); // Reload library
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    } finally {
      setImageToDelete(null);
    }
  };

  const handleDownloadImage = async (url: string, alt: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the image when downloading

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${alt || 'image'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
      toast.success("Image downloaded");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const currentObjectFit = block.style?.objectFit || "contain";

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
              AI Generate Image (GPT-Image-1)
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
                Powered by OpenAI gpt-image-1 model
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

          {/* Your Image Library */}
          <div>
            <Label className="text-xs text-muted-foreground mb-3 block">
              Your Image Library
            </Label>
            {isLoadingImages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {userImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImage(img.url, img.alt)}
                    className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors group cursor-pointer"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || "User image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium text-center px-2">
                        {img.source === "ai" ? "AI Generated" : "Uploaded"}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => handleDownloadImage(img.url, img.alt, e)}
                        className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full text-white"
                        title="Download image"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(img.id, e)}
                        className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white"
                        title="Delete image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No images yet. Upload or generate images to build your library.
                </p>
              </div>
            )}
          </div>

          {/* Image Fit */}
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
                  variant={currentObjectFit === fit.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStyleChange({ objectFit: fit.value })}
                >
                  {fit.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Delete Image Button */}
          {onDelete && (
            <div className="pt-4 border-t">
              <Button
                onClick={onDelete}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Image
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
