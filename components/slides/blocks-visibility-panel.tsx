"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Type, Image as ImageIcon, Heading, Quote, List } from "lucide-react";
import { motion } from "framer-motion";

interface BlocksVisibilityPanelProps {
  blocks: any[];
  onVisibilityChange: (blockId: string, visible: boolean) => void;
}

export function BlocksVisibilityPanel({ blocks, onVisibilityChange }: BlocksVisibilityPanelProps) {
  const getBlockIcon = (type: string) => {
    switch (type) {
      case "heading":
        return Heading;
      case "text":
        return Type;
      case "image":
        return ImageIcon;
      case "quote":
        return Quote;
      case "bullet-list":
        return List;
      default:
        return Type;
    }
  };

  const getBlockLabel = (block: any) => {
    if (block.type === "image") {
      return block.content.alt || "Image";
    }
    if (block.type === "bullet-list") {
      return "Bullet List";
    }
    return block.content.text?.substring(0, 30) || "Untitled Block";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full"
    >
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Block Visibility
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Show or hide blocks in this slide
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No blocks in this slide
          </p>
        ) : (
          <div className="space-y-3">
            {blocks.map((block, index) => {
              const Icon = getBlockIcon(block.type);
              const isVisible = block.style?.display !== "none";

              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-md bg-gray-100">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getBlockLabel(block)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {block.type} • Block {index + 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isVisible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <Switch
                      checked={isVisible}
                      onCheckedChange={(checked) => onVisibilityChange(block.id, checked)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
}
