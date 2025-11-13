"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ArrowLeft, Trash2, GripVertical, Settings, LayoutTemplate, Pencil } from "lucide-react";
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
import { AnnotationLayer } from "@/components/annotations/annotation-layer";
import { AnnotationDisplay } from "@/components/annotations/annotation-display";
import { saveAnnotations } from "@/lib/actions/annotations";
import { AnnotationStroke } from "@/components/annotations/annotation-canvas";
import { PresentationHeader } from "@/components/presentations/presentation-header";

interface SlideEditorProps {
  presentation: any;
}

export function SlideEditor({ presentation: initialPresentation }: SlideEditorProps) {
  const router = useRouter();
  const [presentation, setPresentation] = useState(initialPresentation);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(
    initialPresentation.slides[0]?.id || null
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [isAnnotating, setIsAnnotating] = useState(false);

  // SHARED STATE: Current annotation strokes for each slide
  // This is the single source of truth that both AnnotationLayer and AnnotationDisplay read from
  const [slideAnnotations, setSlideAnnotations] = useState<Record<string, AnnotationStroke[]>>(() => {
    const initial: Record<string, AnnotationStroke[]> = {};
    initialPresentation.slides.forEach((slide: any) => {
      initial[slide.id] = slide.annotations || [];
      console.log('[SlideEditor] Initial load - slide annotations:', {
        slideId: slide.id,
        annotationCount: initial[slide.id].length
      });
    });
    console.log('[SlideEditor] Component initialized with annotations for', Object.keys(initial).length, 'slides');
    return initial;
  });

  // Sync presentation state with prop changes (e.g., after router.refresh())
  useEffect(() => {
    console.log('[SlideEditor] useEffect - syncing with new presentation data');
    setPresentation(initialPresentation);
    // Also sync annotations from database
    const updated: Record<string, AnnotationStroke[]> = {};
    initialPresentation.slides.forEach((slide: any) => {
      updated[slide.id] = slide.annotations || [];
      console.log('[SlideEditor] useEffect - syncing slide:', {
        slideId: slide.id,
        annotationCount: updated[slide.id].length
      });
    });
    setSlideAnnotations(updated);
    console.log('[SlideEditor] useEffect - sync complete, total slides:', Object.keys(updated).length);
  }, [initialPresentation]);

  // Get slides from current presentation state
  const slides = presentation.slides;

  const handleAddSlide = async (afterIndex?: number) => {
    setIsAdding(true);
    const result = await createSlide({
      presentationId: presentation.id,
      layout: "blank",
      order: afterIndex !== undefined ? afterIndex + 1 : slides.length,
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
    const slide = slides.find((s: any) => s.id === selectedSlideId);

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

  const selectedSlide = slides.find((s: any) => s.id === selectedSlideId);
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

  // Update annotation strokes in real-time as user draws (SHARED STATE)
  const handleAnnotationsChange = (slideId: string, strokes: AnnotationStroke[]) => {
    console.log('[SlideEditor] Updating annotations in shared state:', { slideId, strokeCount: strokes.length });
    setSlideAnnotations(prev => ({
      ...prev,
      [slideId]: strokes
    }));
  };

  // Save annotations to database when user closes annotation mode
  const handleAnnotationsSave = async (slideId: string, strokes: AnnotationStroke[]) => {
    console.log('[SlideEditor] Saving annotations to database:', { slideId, strokeCount: strokes.length });

    // Annotations are already visible via shared state
    // Save to database and WAIT for it to complete
    try {
      const result = await saveAnnotations(slideId, strokes);
      console.log('[SlideEditor] Save result:', result);

      if (result.success) {
        console.log('[SlideEditor] ✓ Annotations saved successfully to database');
      } else {
        console.error('[SlideEditor] ✗ Save failed:', result.error);
      }
    } catch (error) {
      console.error('[SlideEditor] ✗ Save threw error:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-[#1e1e1e]">
      {/* Header */}
      <PresentationHeader
        presentation={presentation}
        mode="edit"
        isAnnotating={isAnnotating}
        onAnnotateToggle={() => setIsAnnotating(!isAnnotating)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slides Area */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6">
              {slides.map((slide: any, index: number) => (
                <div key={slide.id}>
                  <div
                    className={`relative group cursor-pointer ${
                      selectedSlideId === slide.id ? "ring-2 ring-neutral-900 dark:ring-neutral-100 ring-offset-4 dark:ring-offset-[#1e1e1e] rounded-lg" : ""
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
                    <div className="relative">
                      <EditableSlideRenderer
                        slide={slide}
                        theme={presentation.theme}
                        isEditing={true}
                        onBlockSelect={(blockId) => {
                          setSelectedSlideId(slide.id);
                          setSelectedBlockId(blockId);
                        }}
                      />
                      {/* Always show annotations in display mode - READS FROM SHARED STATE */}
                      {(!isAnnotating || selectedSlideId !== slide.id) &&
                       slideAnnotations[slide.id]?.length > 0 && (
                        <>
                          {console.log(`[SlideEditor] Rendering annotations from SHARED STATE for slide ${slide.id}:`, slideAnnotations[slide.id]?.length, 'strokes')}
                          <AnnotationDisplay strokes={slideAnnotations[slide.id]} />
                        </>
                      )}
                      {/* Show editable annotation layer when annotating this slide - READS/WRITES SHARED STATE */}
                      {isAnnotating && selectedSlideId === slide.id && (
                        <AnnotationLayer
                          isActive={true}
                          onClose={() => setIsAnnotating(false)}
                          initialStrokes={slideAnnotations[slide.id] || []}
                          onSave={(strokes) => handleAnnotationsSave(slide.id, strokes)}
                          onChange={(strokes) => handleAnnotationsChange(slide.id, strokes)}
                        />
                      )}
                    </div>
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

              {slides.length === 0 && (
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
          <div className="w-80 bg-white dark:bg-[#252525] border-l border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden">
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
