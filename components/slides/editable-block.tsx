"use client";

import { useState, useRef, useEffect } from "react";
import { updateBlock } from "@/lib/actions/blocks";
import { motion } from "framer-motion";

interface EditableBlockProps {
  block: any;
  theme?: any;
  isEditing: boolean;
  onSelect?: () => void;
  onContentChange?: (content: any) => void;
  onStyleChange?: (style: any) => void;
}

export function EditableBlock({
  block,
  theme,
  isEditing,
  onSelect,
  onContentChange,
  onStyleChange
}: EditableBlockProps) {
  const [content, setContent] = useState(block.content);
  const [style, setStyle] = useState(block.style || {});
  const contentRef = useRef<HTMLDivElement>(null);

  // Update local state when block prop changes
  useEffect(() => {
    setContent(block.content);
    setStyle(block.style || {});
  }, [block.content, block.style]);

  const handleStyleUpdate = (newStyle: any) => {
    const updatedStyle = { ...style, ...newStyle };

    // Update local state immediately
    setStyle(updatedStyle);

    // Notify parent
    onStyleChange?.(updatedStyle);

    // Update server in background
    updateBlock(block.id, { style: updatedStyle });
  };

  const isHidden = style?.display === "none";
  const defaultStyle = {
    ...style,
    opacity: isHidden ? 0.3 : 1,
  };

  if (isHidden && !isEditing) {
    return null;
  }

  const renderEditableContent = () => {
    switch (block.type) {
      case "heading":
        const level = content.level || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

        return (
          <HeadingTag
            ref={contentRef}
            onClick={onSelect}
            className={`font-bold cursor-pointer hover:bg-blue-50 rounded px-2 transition-colors ${
              level === 1
                ? "text-5xl"
                : level === 2
                ? "text-4xl"
                : level === 3
                ? "text-3xl"
                : "text-2xl"
            }`}
            style={defaultStyle}
          >
            {content.text}
          </HeadingTag>
        );

      case "text":
        return (
          <p
            ref={contentRef}
            onClick={onSelect}
            className="text-xl leading-relaxed cursor-pointer hover:bg-blue-50 rounded px-2 transition-colors"
            style={defaultStyle}
          >
            {content.text}
          </p>
        );

      case "bullet-list":
        return (
          <ul className="list-disc list-inside space-y-3 text-xl" style={defaultStyle}>
            {content.items?.map((item: string, index: number) => (
              <li key={index} className="leading-relaxed" onClick={onSelect}>
                {item}
              </li>
            ))}
          </ul>
        );

      case "quote":
        return (
          <blockquote
            ref={contentRef}
            onClick={onSelect}
            className="border-l-4 border-primary pl-6 italic text-2xl cursor-pointer hover:bg-blue-50 rounded px-2 transition-colors"
            style={defaultStyle}
          >
            {content.text}
          </blockquote>
        );

      case "image":
        const isFullBleed = defaultStyle?.position === "absolute";
        const objectFit = defaultStyle?.objectFit || "contain";
        return (
          <div
            className={isFullBleed ? "relative" : "flex justify-center"}
            style={isFullBleed ? {} : defaultStyle}
            onClick={onSelect}
          >
            <img
              src={content.url}
              alt={content.alt || ""}
              className={
                isFullBleed
                  ? "w-full h-full cursor-pointer"
                  : "max-w-full max-h-96 rounded-lg shadow-lg cursor-pointer"
              }
              style={
                isFullBleed
                  ? { position: "absolute", inset: 0, objectFit, ...defaultStyle }
                  : { objectFit, ...defaultStyle }
              }
            />
          </div>
        );

      default:
        return (
          <div className="text-muted-foreground" style={defaultStyle}>
            {content.text || "Unsupported block type"}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      {renderEditableContent()}
    </motion.div>
  );
}
