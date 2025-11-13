"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPresentation(data: {
  title: string;
  description?: string;
  themeId?: string;
}) {
  try {
    const presentation = await prisma.presentation.create({
      data: {
        title: data.title,
        description: data.description,
        themeId: data.themeId,
      },
      include: {
        theme: true,
        slides: true,
      },
    });

    revalidatePath("/presentations");
    return { success: true, data: presentation };
  } catch (error) {
    console.error("Error creating presentation:", error);
    return { success: false, error: "Failed to create presentation" };
  }
}

export async function getPresentations() {
  try {
    const presentations = await prisma.presentation.findMany({
      include: {
        theme: true,
        slides: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, data: presentations };
  } catch (error) {
    console.error("Error fetching presentations:", error);
    return { success: false, error: "Failed to fetch presentations" };
  }
}

export async function getPresentation(id: string) {
  try {
    const presentation = await prisma.presentation.findUnique({
      where: { id },
      include: {
        theme: true,
        slides: {
          include: {
            blocks: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!presentation) {
      return { success: false, error: "Presentation not found" };
    }

    // Normalize annotations to always be an array
    const normalizedPresentation = {
      ...presentation,
      slides: presentation.slides.map(slide => {
        const annotations = Array.isArray(slide.annotations) ? slide.annotations : [];
        console.log('[getPresentation] Slide loaded:', {
          slideId: slide.id,
          annotationCount: annotations.length
        });
        return {
          ...slide,
          annotations
        };
      })
    };

    console.log('[getPresentation] Loaded presentation:', {
      presentationId: id,
      totalSlides: normalizedPresentation.slides.length,
      slidesWithAnnotations: normalizedPresentation.slides.filter(s => s.annotations.length > 0).length
    });

    return { success: true, data: normalizedPresentation };
  } catch (error) {
    console.error("Error fetching presentation:", error);
    return { success: false, error: "Failed to fetch presentation" };
  }
}

export async function updatePresentation(
  id: string,
  data: {
    title?: string;
    description?: string;
    themeId?: string;
  }
) {
  try {
    const presentation = await prisma.presentation.update({
      where: { id },
      data,
      include: {
        theme: true,
        slides: true,
      },
    });

    revalidatePath("/presentations");
    revalidatePath(`/presentations/${id}`);
    return { success: true, data: presentation };
  } catch (error) {
    console.error("Error updating presentation:", error);
    return { success: false, error: "Failed to update presentation" };
  }
}

export async function deletePresentation(id: string) {
  try {
    await prisma.presentation.delete({
      where: { id },
    });

    revalidatePath("/presentations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return { success: false, error: "Failed to delete presentation" };
  }
}

export async function duplicatePresentation(id: string) {
  try {
    // Get the original presentation with all its slides and blocks
    const original = await prisma.presentation.findUnique({
      where: { id },
      include: {
        slides: {
          include: {
            blocks: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!original) {
      return { success: false, error: "Presentation not found" };
    }

    // Create the duplicate presentation
    const duplicate = await prisma.presentation.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        themeId: original.themeId,
        slides: {
          create: original.slides.map((slide) => ({
            layout: slide.layout,
            background: slide.background,
            notes: slide.notes,
            annotations: slide.annotations,
            order: slide.order,
            blocks: {
              create: slide.blocks.map((block) => ({
                type: block.type,
                content: block.content,
                style: block.style,
                order: block.order,
              })),
            },
          })),
        },
      },
      include: {
        theme: true,
        slides: {
          include: {
            blocks: true,
          },
        },
      },
    });

    revalidatePath("/presentations");
    return { success: true, data: duplicate };
  } catch (error) {
    console.error("Error duplicating presentation:", error);
    return { success: false, error: "Failed to duplicate presentation" };
  }
}
