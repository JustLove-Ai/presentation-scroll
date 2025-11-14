"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Generate image using OpenAI gpt-image-1 model
export async function generateAIImage(prompt: string, quality: "low" | "medium" | "high" | "auto" = "medium") {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "1024x1024", // gpt-image-1 supports 1024x1024, 1024x1792, 1792x1024
        quality: quality, // "low", "medium", "high", or "auto"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate image");
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned from API");
    }

    // Save to user's image library
    const userImage = await prisma.userImage.create({
      data: {
        url: imageUrl,
        prompt: prompt,
        source: "ai",
        model: "gpt-image-1",
        alt: prompt,
      },
    });

    revalidatePath("/presentations");
    return { success: true, image: userImage };
  } catch (error: any) {
    console.error("[AI Image Generation Error]:", error);
    return { success: false, error: error.message || "Failed to generate image" };
  }
}

// Upload image to library
export async function uploadImageToLibrary(url: string, alt?: string) {
  try {
    const userImage = await prisma.userImage.create({
      data: {
        url,
        source: "upload",
        alt: alt || "Uploaded image",
      },
    });

    revalidatePath("/presentations");
    return { success: true, image: userImage };
  } catch (error: any) {
    console.error("[Image Upload Error]:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}

// Get user's image library (most recent first)
export async function getUserImages(limit: number = 20) {
  try {
    const images = await prisma.userImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return { success: true, images };
  } catch (error: any) {
    console.error("[Get Images Error]:", error);
    return { success: false, error: error.message || "Failed to fetch images", images: [] };
  }
}

// Delete image from library
export async function deleteUserImage(imageId: string) {
  try {
    await prisma.userImage.delete({
      where: { id: imageId },
    });

    revalidatePath("/presentations");
    return { success: true };
  } catch (error: any) {
    console.error("[Delete Image Error]:", error);
    return { success: false, error: error.message || "Failed to delete image" };
  }
}
