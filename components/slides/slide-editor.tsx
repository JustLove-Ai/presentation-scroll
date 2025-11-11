"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ArrowLeft, Trash2, GripVertical, Settings, LayoutTemplate } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSlide, deleteSlide, updateSlide } from "@/lib/actions/slides";
import { createBlock, updateBlock, deleteBlock } from "@/lib/actions/blocks";
import { slideTemplates } from "@/lib/slide-templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditableSlideRenderer } from "./editable-slide-renderer";
import { TextFormatPanel } from "./text-format-panel";
import { ImageEditPanel } from "./image-edit-panel";
import { BlocksVisibilityPanel } from "./blocks-visibility-panel";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

interface SlideEditorProps {
  presentation: any;
}

export function SlideEditor({ presentation }: SlideEditorProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(
    presentation.slides[0]?.id || null
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);

  const handleAddSlide = async (afterIndex?: number) => {
    setIsAdding(true);
    const result = await createSlide({
      presentationId: presentation.id,
      layout: "blank",
      order: afterIndex !== undefined ? afterIndex + 1 : presentation.slides.length,
    });

    if (result.success && result.data) {
      setSelectedSlideId(result.data.id);
      router.refresh();
    }
    setIsAdding(false);
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      await deleteSlide(slideId);
      router.refresh();
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!selectedSlideId) return;

    const template = slideTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Get the selected slide to access its blocks
    const slide = presentation.slides.find((s: any) => s.id === selectedSlideId);

    // Delete all existing blocks first
    if (slide && slide.blocks) {
      for (const block of slide.blocks) {
        await deleteBlock(block.id);
      }
    }

    // Update slide layout
    await updateSlide(selectedSlideId, {
      layout: template.layout,
    });

    // Create blocks from template
    for (const blockData of template.defaultBlocks) {
      await createBlock({
        slideId: selectedSlideId,
        type: blockData.type,
        content: blockData.content,
        style: blockData.style,
        order: blockData.order,
      });
    }

    router.refresh();
  };

  const selectedSlide = presentation.slides.find((s: any) => s.id === selectedSlideId);
  const selectedBlock = selectedSlide?.blocks.find((b: any) => b.id === selectedBlockId);

  const handleBlockStyleChange = async (blockId: string, style: any) => {
    await updateBlock(blockId, { style });
    router.refresh();
  };

  const handleBlockContentChange = async (blockId: string, content: any) => {
    // Save to server
    await updateBlock(blockId, { content });
    // Refresh to update the view
    router.refresh();
  };

  const handleBlockVisibilityChange = async (blockId: string, visible: boolean) => {
    const newStyle = { display: visible ? undefined : "none" };
    await updateBlock(blockId, { style: newStyle });
    router.refresh();
  };

  // Determine panel type based on selected block
  const getPanelType = () => {
    if (!selectedBlock) return "templates";
    if (selectedBlock.type === "image") return "image";
    return "text";
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-[#0f0f0f]">
      {/* Header */}
      <header className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222] px-6 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/presentations")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="font-semibold">{presentation.title}</h1>
            <p className="text-xs text-muted-foreground">
              {presentation.slides.length} slides
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant={showSettings ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showSettings ? "Hide" : "Show"} Panel
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => router.push(`/presentations/${presentation.id}`)}
          >
            Present
          </Button>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slides Area */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6">
              {presentation.slides.map((slide: any, index: number) => (
                <div key={slide.id}>
                  <div
                    className={`relative group cursor-pointer ${
                      selectedSlideId === slide.id ? "ring-2 ring-neutral-900 dark:ring-neutral-100 ring-offset-4 dark:ring-offset-[#0f0f0f] rounded-lg" : ""
                    }`}
                    onClick={() => setSelectedSlideId(slide.id)}
                  >
                    {/* Slide Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">Slide {index + 1}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {slide.layout || "blank"}
                        </span>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(slide.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Slide Preview */}
                    <EditableSlideRenderer
                      slide={slide}
                      theme={presentation.theme}
                      isEditing={true}
                      onBlockSelect={(blockId) => {
                        setSelectedSlideId(slide.id);
                        setSelectedBlockId(blockId);
                      }}
                    />
                  </div>

                  {/* Add Slide Buttons */}
                  <div className="flex justify-center py-4">
                    <Button
                      onClick={() => handleAddSlide(index)}
                      disabled={isAdding}
                      size="icon"
                      variant="outline"
                      className="rounded-full w-10 h-10 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}

              {presentation.slides.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">No slides yet</p>
                  <Button onClick={() => handleAddSlide()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Slide
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Context-Aware Panels */}
        {showSettings && (
          <div className="w-80 bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#222222] flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Text Format Panel */}
              {selectedBlock && ["text", "heading", "quote"].includes(selectedBlock.type) && (
                <TextFormatPanel
                  key="text-panel"
                  block={selectedBlock}
                  onContentChange={(content) => handleBlockContentChange(selectedBlock.id, content)}
                  onStyleChange={(style) => handleBlockStyleChange(selectedBlock.id, style)}
                  onClose={() => setSelectedBlockId(null)}
                />
              )}

              {/* Image Edit Panel */}
              {selectedBlock && selectedBlock.type === "image" && (
                <ImageEditPanel
                  key="image-panel"
                  block={selectedBlock}
                  onContentChange={(content) => handleBlockContentChange(selectedBlock.id, content)}
                  onStyleChange={(style) => handleBlockStyleChange(selectedBlock.id, style)}
                  onClose={() => setSelectedBlockId(null)}
                />
              )}

              {/* Combined Panel (Default) - when no block is selected */}
              {!selectedBlock && selectedSlide && (
                <motion.div
                  key="combined-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <Tabs defaultValue="templates" className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 m-4">
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="blocks">Blocks</TabsTrigger>
                    </TabsList>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="flex-1 overflow-hidden m-0">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold flex items-center gap-2">
                          <LayoutTemplate className="h-4 w-4" />
                          Slide Templates
                        </h3>
                      </div>
                      <ScrollArea className="flex-1 px-4 pb-4">
                        <div className="space-y-3 mt-4">
                          <p className="text-xs font-medium text-muted-foreground mb-3">
                            Choose a layout
                          </p>
                          {slideTemplates.map((template) => {
                            const Icon = template.icon;
                            return (
                              <button
                                key={template.id}
                                onClick={() => handleApplyTemplate(template.id)}
                                className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-md bg-gray-100 group-hover:bg-blue-100">
                                    <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{template.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {template.description}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Blocks Visibility Tab */}
                    <TabsContent value="blocks" className="flex-1 overflow-hidden m-0">
                      <BlocksVisibilityPanel
                        blocks={selectedSlide.blocks || []}
                        onVisibilityChange={handleBlockVisibilityChange}
                      />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
