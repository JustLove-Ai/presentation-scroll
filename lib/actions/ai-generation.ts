"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Generate slides from a script
 */
export async function generateFromScript(
  presentationId: string,
  script: string,
  maxSlides: number,
  context?: any
) {
  try {
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
        mode: "script",
        script,
        maxSlides,
        context: aiContext,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "AI generation failed");
    }

    const data = await response.json();

    revalidatePath(`/presentations/${presentationId}/edit`);

    return { success: true, data };
  } catch (error: any) {
    console.error("Error generating from script:", error);
    return { success: false, error: error.message || "Failed to generate slides" };
  }
}

/**
 * Generate slides from a topic and key points
 */
export async function generateFromTopic(
  presentationId: string,
  topic: string,
  keyPoints: string,
  style: string,
  maxSlides: number,
  context?: any
) {
  try {
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
        mode: "topic",
        topic,
        keyPoints,
        style,
        maxSlides,
        context: aiContext,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "AI generation failed");
    }

    const data = await response.json();

    revalidatePath(`/presentations/${presentationId}/edit`);

    return { success: true, data };
  } catch (error: any) {
    console.error("Error generating from topic:", error);
    return { success: false, error: error.message || "Failed to generate slides" };
  }
}
