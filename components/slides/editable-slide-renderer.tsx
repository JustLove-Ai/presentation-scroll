"use client";

import { Card } from "@/components/ui/card";
import { EditableBlock } from "./editable-block";

interface EditableSlideRendererProps {
  slide: any;
  theme?: any;
  isEditing?: boolean;
  onBlockSelect?: (blockId: string) => void;
}

export function EditableSlideRenderer({
  slide,
  theme,
  isEditing = true,
  onBlockSelect,
}: EditableSlideRendererProps) {
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

  // Separate blocks by type
  const imageBlocks = slide.blocks?.filter((b: any) => b.type === "image") || [];
  const textBlocks = slide.blocks?.filter((b: any) => b.type !== "image") || [];
  const allBlocks = slide.blocks || [];

  // Render based on layout
  const renderContent = () => {
    switch (layout) {
      case "text-left-image-right":
        return (
          <div className="h-full flex">
            {/* Text - Left */}
            <div className="w-[55%] p-12 flex flex-col justify-center space-y-4">
              {textBlocks.map((block: any) => (
                <EditableBlock
                  key={block.id}
                  block={block}
                  theme={theme}
                  isEditing={isEditing}
                  onSelect={() => onBlockSelect?.(block.id)}
                />
              ))}
            </div>
            {/* Image - Right (Full Height) */}
            <div className="w-[45%] relative h-full">
              {imageBlocks.map((block: any) => (
                <div
                  key={block.id}
                  className="absolute inset-0"
                  onClick={() => onBlockSelect?.(block.id)}
                >
                  <img
                    src={block.content.url}
                    alt={block.content.alt || ""}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "text-right-image-left":
        return (
          <div className="h-full flex">
            {/* Image - Left (Full Height) */}
            <div className="w-[45%] relative h-full">
              {imageBlocks.map((block: any) => (
                <div
                  key={block.id}
                  className="absolute inset-0"
                  onClick={() => onBlockSelect?.(block.id)}
                >
                  <img
                    src={block.content.url}
                    alt={block.content.alt || ""}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>
            {/* Text - Right */}
            <div className="w-[55%] p-12 flex flex-col justify-center space-y-4">
              {textBlocks.map((block: any) => (
                <EditableBlock
                  key={block.id}
                  block={block}
                  theme={theme}
                  isEditing={isEditing}
                  onSelect={() => onBlockSelect?.(block.id)}
                />
              ))}
            </div>
          </div>
        );

      case "cover":
      case "image-only":
        return (
          <div className="h-full relative">
            {allBlocks.map((block: any) => (
              block.type === "image" ? (
                <div
                  key={block.id}
                  className="absolute inset-0"
                  onClick={() => onBlockSelect?.(block.id)}
                >
                  <img
                    src={block.content.url}
                    alt={block.content.alt || ""}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              ) : (
                <div key={block.id} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="pointer-events-auto">
                    <EditableBlock
                      block={block}
                      theme={theme}
                      isEditing={isEditing}
                      onSelect={() => onBlockSelect?.(block.id)}
                    />
                  </div>
                </div>
              )
            ))}
          </div>
        );

      case "title":
        return (
          <div className="h-full flex flex-col items-center justify-center p-16 text-center space-y-6">
            {allBlocks.map((block: any) => (
              <EditableBlock
                key={block.id}
                block={block}
                theme={theme}
                isEditing={isEditing}
                onSelect={() => onBlockSelect?.(block.id)}
              />
            ))}
          </div>
        );

      case "quote":
        return (
          <div className="h-full flex flex-col items-center justify-center p-20 space-y-6">
            {allBlocks.map((block: any) => (
              <EditableBlock
                key={block.id}
                block={block}
                theme={theme}
                isEditing={isEditing}
                onSelect={() => onBlockSelect?.(block.id)}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className="h-full p-12 overflow-hidden">
            <div className="h-full space-y-6">
              {allBlocks.map((block: any) => (
                <EditableBlock
                  key={block.id}
                  block={block}
                  theme={theme}
                  isEditing={isEditing}
                  onSelect={() => onBlockSelect?.(block.id)}
                />
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
      {slide.blocks && slide.blocks.length > 0 ? (
        renderContent()
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">Empty slide</p>
            <p className="text-gray-300 text-sm">Select a template to get started</p>
          </div>
        </div>
      )}
    </Card>
  );
}
