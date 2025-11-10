"use client";

import { Card } from "@/components/ui/card";
import { BlockRenderer } from "./block-renderer";

interface SlideRendererProps {
  slide: any;
  theme?: any;
  slideNumber: number;
  totalSlides: number;
}

export function SlideRenderer({
  slide,
  theme,
  slideNumber,
  totalSlides,
}: SlideRendererProps) {
  const themeColors = theme?.colors || {
    primary: "#3B82F6",
    background: "#FFFFFF",
    text: "#1F2937",
  };

  const backgroundStyle = slide.background
    ? slide.background.type === "color"
      ? { backgroundColor: slide.background.value }
      : slide.background.type === "gradient"
      ? { backgroundImage: slide.background.value }
      : {}
    : { backgroundColor: themeColors.background };

  const layout = slide.layout || "blank";

  // Separate blocks by position for split layouts
  const imageBlocks = slide.blocks?.filter((b: any) => b.type === "image") || [];
  const textBlocks = slide.blocks?.filter((b: any) => b.type !== "image") || [];
  const allBlocks = slide.blocks || [];

  // Special rendering for specific layouts
  const renderLayoutContent = () => {
    switch (layout) {
      case "text-left-image-right":
        return (
          <div className="h-full flex">
            {/* Text Content - Left 55% */}
            <div className="w-[55%] p-16 flex flex-col justify-center">
              {textBlocks.map((block: any) => (
                <BlockRenderer key={block.id} block={block} theme={theme} />
              ))}
            </div>
            {/* Image - Right 45% */}
            <div className="w-[45%] relative">
              {imageBlocks[0] && (
                <img
                  src={imageBlocks[0].content.url}
                  alt={imageBlocks[0].content.alt || ""}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        );

      case "text-right-image-left":
        return (
          <div className="h-full flex">
            {/* Image - Left 45% */}
            <div className="w-[45%] relative">
              {imageBlocks[0] && (
                <img
                  src={imageBlocks[0].content.url}
                  alt={imageBlocks[0].content.alt || ""}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
            {/* Text Content - Right 55% */}
            <div className="w-[55%] p-16 flex flex-col justify-center">
              {textBlocks.map((block: any) => (
                <BlockRenderer key={block.id} block={block} theme={theme} />
              ))}
            </div>
          </div>
        );

      case "cover":
      case "image-only":
        return (
          <div className="h-full relative">
            {allBlocks.map((block: any) => (
              <div
                key={block.id}
                className={block.type === "image" ? "" : "absolute inset-0 flex items-center justify-center z-10"}
              >
                <BlockRenderer block={block} theme={theme} />
              </div>
            ))}
          </div>
        );

      case "title":
        return (
          <div className="h-full flex flex-col items-center justify-center p-16 text-center">
            {allBlocks.map((block: any) => (
              <BlockRenderer key={block.id} block={block} theme={theme} />
            ))}
          </div>
        );

      case "quote":
        return (
          <div className="h-full flex flex-col items-center justify-center p-20">
            {allBlocks.map((block: any) => (
              <BlockRenderer key={block.id} block={block} theme={theme} />
            ))}
          </div>
        );

      default:
        // Default content layout
        return (
          <div className="h-full p-16 overflow-hidden">
            <div className="h-full space-y-6">
              {allBlocks.map((block: any) => (
                <BlockRenderer key={block.id} block={block} theme={theme} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Card
      className="w-full aspect-[16/9] shadow-xl rounded-lg relative overflow-hidden border border-gray-200 bg-white hover:shadow-2xl transition-shadow"
      style={{
        ...backgroundStyle,
        color: themeColors.text,
      }}
    >
      {/* Slide Content */}
      {slide.blocks && slide.blocks.length > 0 ? (
        renderLayoutContent()
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">Empty slide</p>
            <p className="text-gray-300 text-sm">Click to apply a template</p>
          </div>
        </div>
      )}
    </Card>
  );
}
