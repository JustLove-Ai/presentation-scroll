"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { scriptTemplates } from "@/lib/script-templates";
import { slideTemplates } from "@/lib/slide-templates";

/**
 * Load a script template with placeholder text and instructions
 */
export async function loadScriptTemplate(presentationId: string, templateId: string) {
  try {
    // Find the script template
    const template = scriptTemplates.find((t) => t.id === templateId);
    if (!template) {
      return { success: false, error: "Template not found" };
    }

    // Get current slides count to determine order
    const existingSlides = await prisma.slide.findMany({
      where: { presentationId },
      orderBy: { order: "desc" },
      take: 1,
    });

    let currentOrder = existingSlides[0]?.order ?? -1;

    // Track slide index for the entire template (not section-specific)
    let templateSlideIndex = 0;

    // Create slides for each section
    for (const section of template.sections) {
      for (const slideConfig of section.slides) {
        currentOrder++;

        // Find the corresponding slide template
        const slideTemplate = slideTemplates.find(
          (t) => t.id === slideConfig.slideTemplate
        );

        if (!slideTemplate) continue;

        // Create the slide with template metadata
        const slide = await prisma.slide.create({
          data: {
            presentationId,
            order: currentOrder,
            layout: slideTemplate.layout,
            notes: slideConfig.instruction, // Store instruction in notes for reference
            templateId: templateId, // Track which template this slide came from
            templateSlideIndex: templateSlideIndex, // Track position in template for guidance
            aiPrompt: slideConfig.aiPrompt, // Store AI prompt for this slide
          },
        });

        templateSlideIndex++;

        // Create blocks with placeholder text
        for (let i = 0; i < slideTemplate.defaultBlocks.length; i++) {
          const defaultBlock = slideTemplate.defaultBlocks[i];

          // Get placeholder text from template or use default
          let content = defaultBlock.content;
          if (slideConfig.placeholderText && slideConfig.placeholderText[defaultBlock.type]) {
            // Use custom placeholder
            if (defaultBlock.type === "heading") {
              content = {
                text: slideConfig.placeholderText.heading || slideConfig.purpose,
                level: defaultBlock.content.level || 2,
              };
            } else if (defaultBlock.type === "text") {
              content = {
                text: slideConfig.placeholderText.text || slideConfig.instruction,
              };
            } else if (defaultBlock.type === "bullet-list") {
              const items = slideConfig.placeholderText["bullet-list"]?.split("\n") || [
                "Point 1",
                "Point 2",
                "Point 3",
              ];
              content = { items };
            } else if (defaultBlock.type === "quote") {
              content = {
                text: slideConfig.placeholderText.quote || slideConfig.instruction,
              };
            } else {
              content = defaultBlock.content;
            }
          }

          await prisma.slideBlock.create({
            data: {
              slideId: slide.id,
              type: defaultBlock.type,
              content,
              order: i,
              style: defaultBlock.style || {},
            },
          });
        }
      }
    }

    revalidatePath(`/presentations/${presentationId}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Error loading script template:", error);
    return { success: false, error: "Failed to load template" };
  }
}

/**
 * Generate a single section of a script template using AI
 */
export async function generateTemplateSection(
  presentationId: string,
  templateId: string,
  sectionIndex: number,
  context: any
) {
  try {
    const template = scriptTemplates.find((t) => t.id === templateId);
    if (!template || !template.sections[sectionIndex]) {
      return { success: false, error: "Template or section not found" };
    }

    const section = template.sections[sectionIndex];

    // Get presentation context
    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      select: { aiContext: true },
    });

    const aiContext = { ...presentation?.aiContext, ...context };

    // Call AI generation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/generate-slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presentationId,
        mode: "section",
        template: template.id,
        section: section,
        context: aiContext,
      }),
    });

    if (!response.ok) {
      throw new Error("AI generation failed");
    }

    const data = await response.json();

    revalidatePath(`/presentations/${presentationId}/edit`);

    return { success: true, data };
  } catch (error) {
    console.error("Error generating section:", error);
    return { success: false, error: "Failed to generate section" };
  }
}

/**
 * Generate all slides for a loaded template
 */
export async function generateAllTemplateSlides(
  presentationId: string,
  context: any
) {
  try {
    // Get all slides in presentation
    const slides = await prisma.slide.findMany({
      where: { presentationId },
      include: { blocks: true },
      orderBy: { order: "asc" },
    });

    // Get presentation context
    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      select: { aiContext: true },
    });

    const aiContext = { ...presentation?.aiContext, ...context };

    // Call AI generation API for all slides
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/generate-slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presentationId,
        mode: "template-all",
        slides,
        context: aiContext,
      }),
    });

    if (!response.ok) {
      throw new Error("AI generation failed");
    }

    const data = await response.json();

    revalidatePath(`/presentations/${presentationId}/edit`);

    return { success: true, data };
  } catch (error) {
    console.error("Error generating template slides:", error);
    return { success: false, error: "Failed to generate slides" };
  }
}
