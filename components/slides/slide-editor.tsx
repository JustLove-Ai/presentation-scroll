"use client";

import { useState, useEffect, useRef } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { DesignPanel } from "./design-panel";
import { DesignTheme } from "@/lib/design-themes";

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
  const [deleteSlideId, setDeleteSlideId] = useState<string | null>(null);

  // Local content cache - preserves user content across template changes
  const blockContentCache = useRef<Map<string, Map<string, any>>>(new Map());

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
  // Use a ref to track the last saved state to prevent race conditions
  const lastSavedAnnotations = useRef<Record<string, number>>({});

  useEffect(() => {
    console.log('[SlideEditor] useEffect - syncing with new presentation data');
    setPresentation(initialPresentation);

    // Sync annotations from database, but preserve local state if it's newer
    const updated: Record<string, AnnotationStroke[]> = {};
    initialPresentation.slides.forEach((slide: any) => {
      const dbAnnotations = slide.annotations || [];
      const currentAnnotations = slideAnnotations[slide.id] || [];

      // Only update if database has more annotations OR if we just saved
      // This prevents overwriting unsaved local changes
      const shouldUpdate =
        dbAnnotations.length >= currentAnnotations.length ||
        lastSavedAnnotations.current[slide.id] === currentAnnotations.length;

      updated[slide.id] = shouldUpdate ? dbAnnotations : currentAnnotations;

      console.log('[SlideEditor] useEffect - syncing slide:', {
        slideId: slide.id,
        dbCount: dbAnnotations.length,
        currentCount: currentAnnotations.length,
        usingDb: shouldUpdate
      });
    });
    setSlideAnnotations(updated);
    console.log('[SlideEditor] useEffect - sync complete, total slides:', Object.keys(updated).length);
  }, [initialPresentation]);

  // Get slides from current presentation state
  const slides = presentation.slides;

  // Refresh when user closes the editing panel to sync server state
  const previousBlockId = useRef<string | null>(selectedBlockId);
  useEffect(() => {
    // If we had a block selected and now we don't (panel closed), refresh
    if (previousBlockId.current && !selectedBlockId) {
      router.refresh();
    }
    previousBlockId.current = selectedBlockId;
  }, [selectedBlockId, router]);

  // Auto-save annotations before component unmounts (navigation away, page close, etc.)
  useEffect(() => {
    return () => {
      // Cleanup function - save any unsaved annotations
      if (isAnnotating && selectedSlideId) {
        const currentStrokes = slideAnnotations[selectedSlideId] || [];
        if (currentStrokes.length > 0) {
          console.log('[SlideEditor] Component unmounting - saving annotations');
          // Note: This is async but we can't await in cleanup
          // The save will attempt but might not complete if page closes immediately
          saveAnnotations(selectedSlideId, currentStrokes);
        }
      }
    };
  }, [isAnnotating, selectedSlideId, slideAnnotations]);

  // Save annotations on page refresh/close
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (isAnnotating && selectedSlideId) {
        const currentStrokes = slideAnnotations[selectedSlideId] || [];
        if (currentStrokes.length > 0) {
          console.log('[SlideEditor] Page unloading - saving annotations');
          // Try to save (may not complete if browser force-closes)
          await saveAnnotations(selectedSlideId, currentStrokes);
          // Show warning to give save time to complete
          e.preventDefault();
          e.returnValue = '';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAnnotating, selectedSlideId, slideAnnotations]);

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
    setDeleteSlideId(slideId);
  };

  const confirmDeleteSlide = async () => {
    if (!deleteSlideId) return;

    const result = await deleteSlide(deleteSlideId);
    if (result.success) {
      toast.success("Slide deleted successfully");
      router.refresh();
    } else {
      toast.error("Failed to delete slide");
    }
    setDeleteSlideId(null);
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!selectedSlideId) return;

    const template = slideTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Get the selected slide to access its blocks
    const slide = slides.find((s: any) => s.id === selectedSlideId);
    if (!slide) return;

    // Check if already on this template - don't recreate blocks
    if (slide.layout === template.layout) {
      toast.info("Already using this template");
      return;
    }

    // Get or create content cache for this slide
    if (!blockContentCache.current.has(selectedSlideId)) {
      blockContentCache.current.set(selectedSlideId, new Map());
    }
    const slideCache = blockContentCache.current.get(selectedSlideId)!;

    // Save current content to cache BEFORE deleting blocks
    if (slide.blocks && slide.blocks.length > 0) {
      slide.blocks.forEach((block: any) => {
        // Cache content by type, keep most recent
        slideCache.set(block.type, block.content);
      });

      // Delete all existing blocks and wait for completion
      await Promise.all(slide.blocks.map((block: any) => deleteBlock(block.id)));
    }

    // Update slide layout
    await updateSlide(selectedSlideId, {
      layout: template.layout,
    });

    // Create blocks from template, using cached content when available
    for (const blockData of template.defaultBlocks) {
      // Check cache first - if user has edited content of this type, use it
      const cachedContent = slideCache.get(blockData.type);
      const contentToUse = cachedContent || blockData.content;

      await createBlock({
        slideId: selectedSlideId,
        type: blockData.type,
        content: contentToUse,
        style: blockData.style,
        order: blockData.order,
      });
    }

    toast.success("Template applied with your content preserved");
    router.refresh();
  };

  const selectedSlide = slides.find((s: any) => s.id === selectedSlideId);
  const selectedBlock = selectedSlide?.blocks.find((b: any) => b.id === selectedBlockId);

  const handleBlockStyleChange = async (blockId: string, style: any) => {
    await updateBlock(blockId, { style });
    router.refresh();
  };

  const handleBlockContentChange = async (blockId: string, content: any) => {
    // Update content cache so template switches preserve edits
    if (selectedSlideId) {
      if (!blockContentCache.current.has(selectedSlideId)) {
        blockContentCache.current.set(selectedSlideId, new Map());
      }
      const slideCache = blockContentCache.current.get(selectedSlideId)!;

      // Find block type to cache content properly
      const block = slides
        .find((s: any) => s.id === selectedSlideId)
        ?.blocks.find((b: any) => b.id === blockId);

      if (block) {
        slideCache.set(block.type, content);
      }
    }

    // Save to server (triggered on blur from TextFormatPanel)
    await updateBlock(blockId, { content });
    // Don't refresh immediately - let local state handle updates for smooth typing
    // Refresh will happen when user closes the panel or navigates away
  };

  const handleBlockVisibilityChange = async (blockId: string, visible: boolean) => {
    const newStyle = { display: visible ? undefined : "none" };
    await updateBlock(blockId, { style: newStyle });
    router.refresh();
  };

  // Apply design theme to current slide
  const handleApplyDesignToSlide = async (theme: DesignTheme) => {
    if (!selectedSlideId) return;

    const slide = slides.find((s: any) => s.id === selectedSlideId);
    if (!slide) return;

    console.log('[Design] Applying theme:', theme.name, 'Background:', theme.background);

    // Collect all update promises
    const updates: Promise<any>[] = [];

    // Update slide background
    updates.push(
      updateSlide(selectedSlideId, {
        background: theme.background,
      })
    );

    // Update all blocks with theme colors and styles
    if (slide.blocks && slide.blocks.length > 0) {
      for (const block of slide.blocks) {
        const updatedStyle = {
          ...block.style,
          color: block.type === "heading" ? theme.headingColor || theme.textColor : theme.textColor,
        };

        // Apply title styling to headings
        if (block.type === "heading" && theme.titleStyle) {
          if (theme.titleStyle.underline) {
            updatedStyle.borderBottom = `3px solid ${theme.accentColor}`;
            updatedStyle.paddingBottom = "0.5rem";
            updatedStyle.display = "inline-block";
          }
          if (theme.titleStyle.leftBar) {
            updatedStyle.borderLeft = `4px solid ${theme.accentColor}`;
            updatedStyle.paddingLeft = "1rem";
          }
          if (theme.titleStyle.background) {
            updatedStyle.background = theme.titleStyle.background;
            updatedStyle.padding = "1rem";
            updatedStyle.borderRadius = "8px";
          }
        }

        // Apply image borders
        if (block.type === "image" && theme.imageBorder) {
          updatedStyle.border = `${theme.imageBorder.width} solid ${theme.imageBorder.color}`;
          updatedStyle.borderRadius = theme.imageBorder.radius || "0px";
        }

        updates.push(updateBlock(block.id, { style: updatedStyle }));
      }
    }

    // Wait for all updates to complete
    await Promise.all(updates);

    console.log('[Design] All updates complete, refreshing...');
    router.refresh();
  };

  // Apply design theme to all slides
  const handleApplyDesignToAll = async (theme: DesignTheme) => {
    if (!slides || slides.length === 0) return;

    console.log('[Design] Applying theme to all slides:', theme.name);

    // Collect all update promises
    const updates: Promise<any>[] = [];

    for (const slide of slides) {
      // Update slide background
      updates.push(
        updateSlide(slide.id, {
          background: theme.background,
        })
      );

      // Update all blocks in this slide
      if (slide.blocks && slide.blocks.length > 0) {
        for (const block of slide.blocks) {
          const updatedStyle = {
            ...block.style,
            color: block.type === "heading" ? theme.headingColor || theme.textColor : theme.textColor,
          };

          // Apply title styling to headings
          if (block.type === "heading" && theme.titleStyle) {
            if (theme.titleStyle.underline) {
              updatedStyle.borderBottom = `3px solid ${theme.accentColor}`;
              updatedStyle.paddingBottom = "0.5rem";
              updatedStyle.display = "inline-block";
            }
            if (theme.titleStyle.leftBar) {
              updatedStyle.borderLeft = `4px solid ${theme.accentColor}`;
              updatedStyle.paddingLeft = "1rem";
            }
            if (theme.titleStyle.background) {
              updatedStyle.background = theme.titleStyle.background;
              updatedStyle.padding = "1rem";
              updatedStyle.borderRadius = "8px";
            }
          }

          // Apply image borders
          if (block.type === "image" && theme.imageBorder) {
            updatedStyle.border = `${theme.imageBorder.width} solid ${theme.imageBorder.color}`;
            updatedStyle.borderRadius = theme.imageBorder.radius || "0px";
          }

          updates.push(updateBlock(block.id, { style: updatedStyle }));
        }
      }
    }

    // Wait for all updates to complete
    await Promise.all(updates);

    console.log('[Design] All slides updated, refreshing...');
    toast.success(`Applied "${theme.name}" to all slides`);
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

    // Track that we're saving this many annotations for this slide
    lastSavedAnnotations.current[slideId] = strokes.length;

    // Annotations are already visible via shared state
    // Save to database and WAIT for it to complete
    try {
      const result = await saveAnnotations(slideId, strokes);
      console.log('[SlideEditor] Save result:', result);

      if (result.success) {
        console.log('[SlideEditor] ✓ Annotations saved successfully to database');
        toast.success("Annotations saved");
        // Refresh to reload data from server so annotations persist after navigation
        router.refresh();
      } else {
        console.error('[SlideEditor] ✗ Save failed:', result.error);
        toast.error("Failed to save annotations");
        // Clear the saved tracking since save failed
        delete lastSavedAnnotations.current[slideId];
      }
    } catch (error) {
      console.error('[SlideEditor] ✗ Save threw error:', error);
      toast.error("Failed to save annotations");
      // Clear the saved tracking since save failed
      delete lastSavedAnnotations.current[slideId];
    }
  };

  // Handle toggling annotation mode from header - SAVE when turning OFF
  const handleAnnotateToggle = async () => {
    if (isAnnotating && selectedSlideId) {
      // Turning OFF annotation mode - save current annotations first
      console.log('[SlideEditor] Toggling annotation mode OFF - saving first');
      const currentStrokes = slideAnnotations[selectedSlideId] || [];
      await handleAnnotationsSave(selectedSlideId, currentStrokes);
    }
    // Toggle the annotation mode
    setIsAnnotating(!isAnnotating);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-[#1e1e1e]">
      {/* Header */}
      <PresentationHeader
        presentation={presentation}
        mode="edit"
        isAnnotating={isAnnotating}
        onAnnotateToggle={handleAnnotateToggle}
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
                      {/* Only hide annotations when actively drawing on THIS specific slide */}
                      {!(isAnnotating && selectedSlideId === slide.id) &&
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
                    <TabsList className="grid w-full grid-cols-3 m-4">
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="design">Design</TabsTrigger>
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

                    {/* Design Tab */}
                    <TabsContent value="design" className="flex-1 overflow-hidden m-0">
                      <DesignPanel
                        onApplyToSlide={(theme) => handleApplyDesignToSlide(theme)}
                        onApplyToAll={(theme) => handleApplyDesignToAll(theme)}
                      />
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

      {/* Delete Slide Confirmation Dialog */}
      <ConfirmDialog
        open={deleteSlideId !== null}
        onOpenChange={(open) => !open && setDeleteSlideId(null)}
        onConfirm={confirmDeleteSlide}
        title="Delete Slide"
        description="Are you sure you want to delete this slide? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
