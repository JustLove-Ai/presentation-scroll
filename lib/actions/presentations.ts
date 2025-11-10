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

    return { success: true, data: presentation };
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
