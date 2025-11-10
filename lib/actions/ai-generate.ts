"use server";

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SlideContent {
  title?: string;
  content: string[];
  layout: string;
  blockTypes?: string[];
}

export async function generateSlidesFromText(text: string, presentationId: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.",
      };
    }

    const prompt = `You are a professional presentation designer. Convert the following text into a structured slide presentation.

For each slide, provide:
1. A clear title (if applicable)
2. Key bullet points or content blocks
3. Suggested layout (title, title-content, two-column, etc.)

Format your response as a JSON array of slides. Each slide should have:
{
  "title": "Slide title",
  "content": ["Bullet point 1", "Bullet point 2", ...],
  "layout": "title-content",
  "blockTypes": ["heading", "text", "text", ...]
}

Text to convert:
${text}

Respond ONLY with valid JSON array, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional presentation designer. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return { success: false, error: "No response from AI" };
    }

    // Parse the AI response
    let slides: SlideContent[];
    try {
      slides = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return { success: false, error: "Failed to parse AI response" };
    }

    // Create slides in the database
    const createdSlides = [];
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];

      const slide = await prisma.slide.create({
        data: {
          presentationId,
          layout: slideData.layout || "title-content",
          order: i,
        },
      });

      // Create blocks for this slide
      const blocks = [];

      // Add title block if exists
      if (slideData.title) {
        const titleBlock = await prisma.slideBlock.create({
          data: {
            slideId: slide.id,
            type: "heading",
            content: { text: slideData.title, level: 1 },
            order: 0,
            style: {
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
            },
          },
        });
        blocks.push(titleBlock);
      }

      // Add content blocks
      for (let j = 0; j < slideData.content.length; j++) {
        const contentText = slideData.content[j];
        const blockType = slideData.blockTypes?.[j] || "text";

        const block = await prisma.slideBlock.create({
          data: {
            slideId: slide.id,
            type: blockType,
            content: { text: contentText },
            order: (slideData.title ? 1 : 0) + j,
            style: {
              fontSize: blockType === "heading" ? "1.5rem" : "1rem",
              marginBottom: "0.75rem",
            },
          },
        });
        blocks.push(block);
      }

      createdSlides.push({ ...slide, blocks });
    }

    revalidatePath(`/presentations/${presentationId}`);
    return { success: true, data: createdSlides };
  } catch (error: any) {
    console.error("Error generating slides:", error);
    return {
      success: false,
      error: error?.message || "Failed to generate slides",
    };
  }
}

export async function enhanceSlideContent(slideId: string, prompt: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured",
      };
    }

    const slide = await prisma.slide.findUnique({
      where: { id: slideId },
      include: { blocks: { orderBy: { order: "asc" } } },
    });

    if (!slide) {
      return { success: false, error: "Slide not found" };
    }

    const currentContent = slide.blocks
      .map((b) => `${b.type}: ${JSON.stringify(b.content)}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional presentation designer helping to enhance slide content.",
        },
        {
          role: "user",
          content: `Current slide content:\n${currentContent}\n\nUser request: ${prompt}\n\nProvide improved content as a JSON array of blocks with structure: [{ type: string, content: object, style?: object }]`,
        },
      ],
      temperature: 0.7,
    });

    const enhancedContent = completion.choices[0]?.message?.content;
    if (!enhancedContent) {
      return { success: false, error: "No response from AI" };
    }

    return { success: true, data: enhancedContent };
  } catch (error) {
    console.error("Error enhancing content:", error);
    return { success: false, error: "Failed to enhance content" };
  }
}
