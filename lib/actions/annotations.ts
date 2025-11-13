"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveAnnotations(slideId: string, annotations: any[]) {
  try {
    console.log('[saveAnnotations] Starting save:', { slideId, annotationCount: annotations.length });

    const slide = await prisma.slide.update({
      where: { id: slideId },
      data: { annotations },
    });

    console.log('[saveAnnotations] Database updated successfully:', {
      slideId,
      savedAnnotationCount: Array.isArray(slide.annotations) ? slide.annotations.length : 0
    });

    const presentation = await prisma.presentation.findUnique({
      where: { id: slide.presentationId },
    });

    if (presentation) {
      revalidatePath(`/presentations/${presentation.id}`);
      revalidatePath(`/presentations/${presentation.id}/edit`);
      console.log('[saveAnnotations] Revalidated paths for presentation:', presentation.id);
    }

    return { success: true, data: slide };
  } catch (error) {
    console.error("[saveAnnotations] Error saving annotations:", error);
    return { success: false, error: "Failed to save annotations" };
  }
}

export async function getAnnotations(slideId: string) {
  try {
    const slide = await prisma.slide.findUnique({
      where: { id: slideId },
      select: { annotations: true },
    });

    return { success: true, data: slide?.annotations || [] };
  } catch (error) {
    console.error("Error getting annotations:", error);
    return { success: false, error: "Failed to get annotations" };
  }
}
