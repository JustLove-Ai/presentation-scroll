import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, quality = "high", size = "1024x1024" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate quality parameter
    const validQualities = ["low", "medium", "high"];
    const selectedQuality = validQualities.includes(quality) ? quality : "high";

    // Validate size parameter
    const validSizes = ["1024x1024", "1536x1024", "1024x1536"];
    const selectedSize = validSizes.includes(size) ? size : "1024x1024";

    // Call OpenAI gpt-image-1 API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1, // gpt-image-1 only supports generating 1 image at a time
        size: selectedSize,
        quality: selectedQuality,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[OpenAI API Error]:", error);
      return NextResponse.json(
        { error: error.error?.message || "Failed to generate image" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[OpenAI Response]:", JSON.stringify(data, null, 2));

    // Extract image data from response (could be URL or b64_json)
    const imageData = data.data?.[0];

    if (!imageData) {
      console.error("[No image data in response]:", data);
      return NextResponse.json(
        { error: "No image data returned from API" },
        { status: 500 }
      );
    }

    // Handle both URL and b64_json formats
    let imageUrl: string;

    if (imageData.url) {
      // Response contains a URL
      imageUrl = imageData.url;
    } else if (imageData.b64_json) {
      // Response contains base64 encoded image - save to /public/images
      try {
        // Create unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `ai-${timestamp}-${random}.png`;

        // Ensure /public/images directory exists
        const publicImagesDir = join(process.cwd(), "public", "images");
        if (!existsSync(publicImagesDir)) {
          await mkdir(publicImagesDir, { recursive: true });
        }

        // Convert base64 to buffer and save file
        const buffer = Buffer.from(imageData.b64_json, "base64");
        const filepath = join(publicImagesDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL path
        imageUrl = `/images/${filename}`;
      } catch (saveError) {
        console.error("[Error saving image file]:", saveError);
        return NextResponse.json(
          { error: "Failed to save generated image" },
          { status: 500 }
        );
      }
    } else {
      console.error("[No URL or b64_json in response]:", imageData);
      return NextResponse.json(
        { error: "Invalid image format returned from API" },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      image: userImage,
    });
  } catch (error: any) {
    console.error("[Image Generation Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
