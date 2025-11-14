import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET - Fetch user's image library
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const images = await prisma.userImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error: any) {
    console.error("[Get Images Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch images", images: [] },
      { status: 500 }
    );
  }
}

// POST - Upload image to library
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, alt } = body;

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    let imageUrl = url;

    // If it's a base64 data URL, save it to /public/images
    if (url.startsWith("data:image/")) {
      try {
        // Extract base64 data
        const base64Data = url.split(",")[1];
        const mimeType = url.split(";")[0].split(":")[1];
        const extension = mimeType.split("/")[1];

        // Create unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `upload-${timestamp}-${random}.${extension}`;

        // Ensure /public/images directory exists
        const publicImagesDir = join(process.cwd(), "public", "images");
        if (!existsSync(publicImagesDir)) {
          await mkdir(publicImagesDir, { recursive: true });
        }

        // Convert base64 to buffer and save file
        const buffer = Buffer.from(base64Data, "base64");
        const filepath = join(publicImagesDir, filename);
        await writeFile(filepath, buffer);

        // Update URL to public path
        imageUrl = `/images/${filename}`;
      } catch (saveError) {
        console.error("[Error saving uploaded image]:", saveError);
        return NextResponse.json(
          { error: "Failed to save uploaded image" },
          { status: 500 }
        );
      }
    }

    const userImage = await prisma.userImage.create({
      data: {
        url: imageUrl,
        source: "upload",
        alt: alt || "Uploaded image",
      },
    });

    return NextResponse.json({
      success: true,
      image: userImage,
    });
  } catch (error: any) {
    console.error("[Image Upload Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

// DELETE - Remove image from library
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    await prisma.userImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("[Delete Image Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}
