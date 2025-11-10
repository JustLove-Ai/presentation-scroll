"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBlock(data: {
  slideId: string;
  type: string;
  content: any;
  style?: any;
  order?: number;
}) {
  try {
    // Get the last block order
    const lastBlock = await prisma.slideBlock.findFirst({
      where: { slideId: data.slideId },
      orderBy: { order: "desc" },
    });

    const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

    const block = await prisma.slideBlock.create({
      data: {
        slideId: data.slideId,
        type: data.type,
        content: data.content,
        style: data.style,
        order,
      },
    });

    const slide = await prisma.slide.findUnique({
      where: { id: data.slideId },
    });

    if (slide) {
      revalidatePath(`/presentations/${slide.presentationId}`);
    }

    return { success: true, data: block };
  } catch (error) {
    console.error("Error creating block:", error);
    return { success: false, error: "Failed to create block" };
  }
}

export async function updateBlock(
  id: string,
  data: {
    type?: string;
    content?: any;
    style?: any;
    order?: number;
  }
) {
  try {
    const block = await prisma.slideBlock.update({
      where: { id },
      data,
    });

    const slide = await prisma.slide.findUnique({
      where: { id: block.slideId },
    });

    if (slide) {
      revalidatePath(`/presentations/${slide.presentationId}`);
    }

    return { success: true, data: block };
  } catch (error) {
    console.error("Error updating block:", error);
    return { success: false, error: "Failed to update block" };
  }
}

export async function deleteBlock(id: string) {
  try {
    const block = await prisma.slideBlock.findUnique({
      where: { id },
      include: { slide: true },
    });

    if (!block) {
      return { success: false, error: "Block not found" };
    }

    await prisma.slideBlock.delete({
      where: { id },
    });

    revalidatePath(`/presentations/${block.slide.presentationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting block:", error);
    return { success: false, error: "Failed to delete block" };
  }
}

export async function reorderBlocks(blocks: { id: string; order: number }[]) {
  try {
    await Promise.all(
      blocks.map((block) =>
        prisma.slideBlock.update({
          where: { id: block.id },
          data: { order: block.order },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Error reordering blocks:", error);
    return { success: false, error: "Failed to reorder blocks" };
  }
}
