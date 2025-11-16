"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSlide(data: {
  presentationId: string;
  layout?: string;
  background?: any;
  order?: number;
}) {
  try {
    // Get the last slide order
    const lastSlide = await prisma.slide.findFirst({
      where: { presentationId: data.presentationId },
      orderBy: { order: "desc" },
    });

    const order = data.order ?? (lastSlide ? lastSlide.order + 1 : 0);

    // If inserting at a specific position, reorder existing slides
    if (data.order !== undefined) {
      // Get all slides that come after the insertion point
      const slidesToReorder = await prisma.slide.findMany({
        where: {
          presentationId: data.presentationId,
          order: { gte: data.order },
        },
        orderBy: { order: "asc" },
      });

      // Increment the order of all subsequent slides
      await Promise.all(
        slidesToReorder.map((slide) =>
          prisma.slide.update({
            where: { id: slide.id },
            data: { order: slide.order + 1 },
          })
        )
      );
    }

    const slide = await prisma.slide.create({
      data: {
        presentationId: data.presentationId,
        layout: data.layout || "blank",
        background: data.background,
        order,
      },
      include: {
        blocks: true,
      },
    });

    revalidatePath(`/presentations/${data.presentationId}`);
    revalidatePath(`/presentations/${data.presentationId}/edit`);
    return { success: true, data: slide };
  } catch (error) {
    console.error("Error creating slide:", error);
    return { success: false, error: "Failed to create slide" };
  }
}

export async function updateSlide(
  id: string,
  data: {
    layout?: string;
    background?: any;
    notes?: string;
    order?: number;
    aiPrompt?: string;
  }
) {
  try {
    const slide = await prisma.slide.update({
      where: { id },
      data,
      include: {
        blocks: true,
      },
    });

    revalidatePath(`/presentations/${slide.presentationId}`);
    return { success: true, data: slide };
  } catch (error) {
    console.error("Error updating slide:", error);
    return { success: false, error: "Failed to update slide" };
  }
}

export async function deleteSlide(id: string) {
  try {
    const slide = await prisma.slide.findUnique({
      where: { id },
    });

    if (!slide) {
      return { success: false, error: "Slide not found" };
    }

    // Delete the slide
    await prisma.slide.delete({
      where: { id },
    });

    // Reorder remaining slides that came after the deleted one
    const slidesToReorder = await prisma.slide.findMany({
      where: {
        presentationId: slide.presentationId,
        order: { gt: slide.order },
      },
      orderBy: { order: "asc" },
    });

    // Decrement the order of all subsequent slides
    await Promise.all(
      slidesToReorder.map((s) =>
        prisma.slide.update({
          where: { id: s.id },
          data: { order: s.order - 1 },
        })
      )
    );

    revalidatePath(`/presentations/${slide.presentationId}`);
    revalidatePath(`/presentations/${slide.presentationId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting slide:", error);
    return { success: false, error: "Failed to delete slide" };
  }
}

export async function reorderSlides(slides: { id: string; order: number }[]) {
  try {
    await Promise.all(
      slides.map((slide) =>
        prisma.slide.update({
          where: { id: slide.id },
          data: { order: slide.order },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Error reordering slides:", error);
    return { success: false, error: "Failed to reorder slides" };
  }
}
