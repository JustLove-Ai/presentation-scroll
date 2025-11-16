import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slideTemplates } from "@/lib/slide-templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { presentationId, mode, context } = body;

    if (!presentationId) {
      return NextResponse.json(
        { error: "Presentation ID is required" },
        { status: 400 }
      );
    }

    // Get current slides count for ordering
    const existingSlides = await prisma.slide.findMany({
      where: { presentationId },
      orderBy: { order: "desc" },
      take: 1,
    });

    let currentOrder = existingSlides[0]?.order ?? -1;

    let slidesGenerated = 0;

    switch (mode) {
      case "script": {
        const { script, maxSlides } = body;

        if (!script) {
          return NextResponse.json(
            { error: "Script is required" },
            { status: 400 }
          );
        }

        // Call OpenAI to break script into slides
        const slides = await generateSlidesFromScript(
          script,
          maxSlides,
          context
        );

        // Create slides in database
        for (const slideData of slides) {
          currentOrder++;
          await createSlideFromAI(presentationId, slideData, currentOrder);
          slidesGenerated++;
        }

        break;
      }

      case "topic": {
        const { topic, keyPoints, style, maxSlides } = body;

        if (!topic) {
          return NextResponse.json(
            { error: "Topic is required" },
            { status: 400 }
          );
        }

        // Call OpenAI to generate slides from topic
        const slides = await generateSlidesFromTopic(
          topic,
          keyPoints,
          style,
          maxSlides,
          context
        );

        // Create slides in database
        for (const slideData of slides) {
          currentOrder++;
          await createSlideFromAI(presentationId, slideData, currentOrder);
          slidesGenerated++;
        }

        break;
      }

      case "section":
      case "template-all": {
        // TODO: Implement template-based generation
        return NextResponse.json(
          { error: "Template generation not yet implemented" },
          { status: 501 }
        );
      }

      default:
        return NextResponse.json(
          { error: "Invalid mode" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      slidesGenerated,
    });
  } catch (error: any) {
    console.error("Error in AI generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate slides" },
      { status: 500 }
    );
  }
}

/**
 * Generate slides from a script using OpenAI
 */
async function generateSlidesFromScript(
  script: string,
  maxSlides: number,
  context: any
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const systemPrompt = `You are an expert presentation designer. Break down the provided script into ${maxSlides} logical slides.

For each slide, determine:
1. The most appropriate slide template (title, content, text-left-image-right, text-right-image-left, quote, etc.)
2. The content for each block (heading, text, bullet points, etc.)
3. Whether an image would be helpful and generate a description

Context:
${context.topic ? `Topic: ${context.topic}` : ""}
${context.audience ? `Audience: ${context.audience}` : ""}
${context.tone ? `Tone: ${context.tone}` : ""}
${context.keyMessage ? `Key Message: ${context.keyMessage}` : ""}

Return a JSON array of slides with this structure:
[
  {
    "layout": "title" | "content" | "text-left-image-right" | etc.,
    "blocks": [
      {
        "type": "heading" | "text" | "bullet-list" | "quote",
        "content": { "text": "..." } or { "items": [...] },
        "style": {}
      }
    ]
  }
]

IMPORTANT: Stay very close to the script. Don't add information that isn't there. Just organize it into slides.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: script },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  return content.slides || [];
}

/**
 * Generate slides from a topic using OpenAI
 */
async function generateSlidesFromTopic(
  topic: string,
  keyPoints: string,
  style: string,
  maxSlides: number,
  context: any
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const systemPrompt = `You are an expert presentation designer. Create a ${maxSlides}-slide presentation about: ${topic}

Style: ${style}
${keyPoints ? `Key points to cover:\n${keyPoints}` : ""}

Context:
${context.audience ? `Audience: ${context.audience}` : ""}
${context.tone ? `Tone: ${context.tone}` : ""}
${context.keyMessage ? `Goal: ${context.keyMessage}` : ""}

Create an engaging presentation with:
1. A title slide
2. Clear, logical flow
3. Varied slide layouts for visual interest
4. Concise, impactful content

For each slide, determine:
1. The most appropriate slide template (title, content, text-left-image-right, text-right-image-left, title-subtitle-image, quote, etc.)
2. The content for each block (heading, text, bullet points, etc.)
3. Appropriate styling

Return a JSON array of slides with this structure:
{
  "slides": [
    {
      "layout": "title" | "content" | "text-left-image-right" | etc.,
      "blocks": [
        {
          "type": "heading" | "text" | "bullet-list" | "quote",
          "content": { "text": "...", "level": 1 } or { "items": [...] },
          "style": { "fontSize": "2rem", "textAlign": "center" }
        }
      ]
    }
  ]
}

Make it professional and engaging!`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create the presentation.` },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  return content.slides || [];
}

/**
 * Create a slide from AI-generated data
 */
async function createSlideFromAI(
  presentationId: string,
  slideData: any,
  order: number
) {
  // Create the slide
  const slide = await prisma.slide.create({
    data: {
      presentationId,
      order,
      layout: slideData.layout || "blank",
    },
  });

  // Create blocks
  if (slideData.blocks && Array.isArray(slideData.blocks)) {
    for (let i = 0; i < slideData.blocks.length; i++) {
      const blockData = slideData.blocks[i];

      await prisma.slideBlock.create({
        data: {
          slideId: slide.id,
          type: blockData.type || "text",
          content: blockData.content || { text: "" },
          order: i,
          style: blockData.style || {},
        },
      });
    }
  }

  return slide;
}
