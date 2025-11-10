import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.template.deleteMany({});
  await prisma.theme.deleteMany({});

  // Create default themes
  const modernTheme = await prisma.theme.create({
    data: {
      name: "Modern Professional",
      description: "Clean and professional design with a modern touch",
      isDefault: true,
      colors: {
        primary: "#3B82F6",
        secondary: "#8B5CF6",
        accent: "#10B981",
        background: "#FFFFFF",
        text: "#1F2937",
        muted: "#6B7280",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
        code: "Fira Code, monospace",
      },
      spacing: {
        slidePadding: "4rem",
        blockSpacing: "1.5rem",
      },
    },
  });

  const darkTheme = await prisma.theme.create({
    data: {
      name: "Dark Mode",
      description: "Sleek dark theme perfect for presentations",
      isDefault: false,
      colors: {
        primary: "#60A5FA",
        secondary: "#A78BFA",
        accent: "#34D399",
        background: "#111827",
        text: "#F9FAFB",
        muted: "#9CA3AF",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
        code: "Fira Code, monospace",
      },
      spacing: {
        slidePadding: "4rem",
        blockSpacing: "1.5rem",
      },
    },
  });

  const minimalTheme = await prisma.theme.create({
    data: {
      name: "Minimal",
      description: "Simple and elegant minimal design",
      isDefault: false,
      colors: {
        primary: "#000000",
        secondary: "#404040",
        accent: "#737373",
        background: "#FAFAFA",
        text: "#171717",
        muted: "#A3A3A3",
      },
      fonts: {
        heading: "Georgia, serif",
        body: "system-ui, sans-serif",
        code: "Courier, monospace",
      },
      spacing: {
        slidePadding: "5rem",
        blockSpacing: "2rem",
      },
    },
  });

  const vibrantTheme = await prisma.theme.create({
    data: {
      name: "Vibrant",
      description: "Bold and colorful design for creative presentations",
      isDefault: false,
      colors: {
        primary: "#EC4899",
        secondary: "#F59E0B",
        accent: "#8B5CF6",
        background: "#FFFFFF",
        text: "#1F2937",
        muted: "#6B7280",
      },
      fonts: {
        heading: "Poppins, sans-serif",
        body: "Inter, sans-serif",
        code: "Fira Code, monospace",
      },
      spacing: {
        slidePadding: "3.5rem",
        blockSpacing: "1.25rem",
      },
    },
  });

  console.log("Created themes:", {
    modernTheme: modernTheme.name,
    darkTheme: darkTheme.name,
    minimalTheme: minimalTheme.name,
    vibrantTheme: vibrantTheme.name,
  });

  // Create templates
  const pitchDeckTemplate = await prisma.template.create({
    data: {
      name: "Startup Pitch Deck",
      description: "Professional template for startup presentations",
      category: "business",
      themeId: modernTheme.id,
      isPublic: true,
      isPremium: false,
      structure: {
        slides: [
          {
            layout: "title",
            blocks: [
              { type: "heading", content: { text: "Your Company Name", level: 1 } },
              { type: "text", content: { text: "Tagline or value proposition" } },
            ],
          },
          {
            layout: "title-content",
            blocks: [
              { type: "heading", content: { text: "The Problem", level: 2 } },
              {
                type: "bullet-list",
                content: {
                  items: [
                    "Pain point 1",
                    "Pain point 2",
                    "Pain point 3",
                  ],
                },
              },
            ],
          },
          {
            layout: "title-content",
            blocks: [
              { type: "heading", content: { text: "Our Solution", level: 2 } },
              { type: "text", content: { text: "How you solve the problem" } },
            ],
          },
        ],
      },
    },
  });

  const educationTemplate = await prisma.template.create({
    data: {
      name: "Educational Presentation",
      description: "Perfect for lectures and teaching",
      category: "education",
      themeId: modernTheme.id,
      isPublic: true,
      isPremium: false,
      structure: {
        slides: [
          {
            layout: "title",
            blocks: [
              { type: "heading", content: { text: "Lesson Title", level: 1 } },
              { type: "text", content: { text: "Subject | Date" } },
            ],
          },
          {
            layout: "title-content",
            blocks: [
              { type: "heading", content: { text: "Learning Objectives", level: 2 } },
              {
                type: "numbered-list",
                content: {
                  items: [
                    "Objective 1",
                    "Objective 2",
                    "Objective 3",
                  ],
                },
              },
            ],
          },
        ],
      },
    },
  });

  const portfolioTemplate = await prisma.template.create({
    data: {
      name: "Creative Portfolio",
      description: "Showcase your work beautifully",
      category: "creative",
      themeId: vibrantTheme.id,
      isPublic: true,
      isPremium: false,
      structure: {
        slides: [
          {
            layout: "title",
            blocks: [
              { type: "heading", content: { text: "Your Name", level: 1 } },
              { type: "text", content: { text: "Your Role | Portfolio 2025" } },
            ],
          },
          {
            layout: "two-column",
            blocks: [
              { type: "heading", content: { text: "About Me", level: 2 } },
              { type: "text", content: { text: "Brief introduction and background" } },
            ],
          },
        ],
      },
    },
  });

  console.log("Created templates:", {
    pitchDeck: pitchDeckTemplate.name,
    education: educationTemplate.name,
    portfolio: portfolioTemplate.name,
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
