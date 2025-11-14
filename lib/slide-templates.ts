import {
  Type,
  Image as ImageIcon,
  Quote,
  Layout,
  FileText,
  Columns2,
  Columns3,
  Presentation
} from "lucide-react";

export interface SlideTemplate {
  id: string;
  name: string;
  icon: any;
  layout: string;
  description: string;
  defaultBlocks: any[];
}

export const slideTemplates: SlideTemplate[] = [
  {
    id: "title",
    name: "Title Slide",
    icon: Type,
    layout: "title",
    description: "Large title with subtitle",
    defaultBlocks: [
      {
        type: "heading",
        content: { text: "Slide Title", level: 1 },
        order: 0,
        style: { fontSize: "4rem", fontWeight: "bold", textAlign: "center" },
      },
      {
        type: "text",
        content: { text: "Subtitle or tagline" },
        order: 1,
        style: { fontSize: "1.5rem", textAlign: "center", color: "#6B7280" },
      },
    ],
  },
  {
    id: "title-subtitle-image",
    name: "Title + Subtitle + Image",
    icon: Presentation,
    layout: "title-subtitle-image",
    description: "Title at top, subtitle, centered image",
    defaultBlocks: [
      {
        type: "heading",
        content: { text: "Slide Title", level: 2 },
        order: 0,
        style: { fontSize: "3rem", fontWeight: "bold", textAlign: "center", marginBottom: "1rem" },
      },
      {
        type: "text",
        content: { text: "Subtitle or description text" },
        order: 1,
        style: { fontSize: "1.25rem", textAlign: "center", color: "#6B7280", marginBottom: "2rem" },
      },
      {
        type: "image",
        content: { url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23D1D5DB'/%3E%3C/svg%3E", alt: "Placeholder" },
        order: 2,
        style: { objectFit: "contain", maxHeight: "60vh", margin: "0 auto" },
      },
    ],
  },
  {
    id: "text-left-image-right",
    name: "Text Left, Image Right",
    icon: Columns2,
    layout: "text-left-image-right",
    description: "Content on left, image on right",
    defaultBlocks: [
      {
        type: "heading",
        content: { text: "Heading", level: 2 },
        order: 0,
        style: { fontSize: "2.5rem", fontWeight: "bold" },
      },
      {
        type: "text",
        content: { text: "Your content here..." },
        order: 1,
        style: { fontSize: "1.25rem", lineHeight: "1.6" },
      },
      {
        type: "image",
        content: { url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23D1D5DB'/%3E%3C/svg%3E", alt: "Placeholder" },
        order: 2,
        style: { position: "absolute", right: 0, top: 0, width: "45%", height: "100%", objectFit: "contain" },
      },
    ],
  },
  {
    id: "text-right-image-left",
    name: "Text Right, Image Left",
    icon: Columns2,
    layout: "text-right-image-left",
    description: "Image on left, content on right",
    defaultBlocks: [
      {
        type: "image",
        content: { url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23D1D5DB'/%3E%3C/svg%3E", alt: "Placeholder" },
        order: 0,
        style: { position: "absolute", left: 0, top: 0, width: "45%", height: "100%", objectFit: "contain" },
      },
      {
        type: "heading",
        content: { text: "Heading", level: 2 },
        order: 1,
        style: { fontSize: "2.5rem", fontWeight: "bold", marginLeft: "50%" },
      },
      {
        type: "text",
        content: { text: "Your content here..." },
        order: 2,
        style: { fontSize: "1.25rem", lineHeight: "1.6", marginLeft: "50%" },
      },
    ],
  },
  {
    id: "cover",
    name: "Cover / Hero",
    icon: ImageIcon,
    layout: "cover",
    description: "Full-screen image with overlay text",
    defaultBlocks: [
      {
        type: "image",
        content: { url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Crect width='1600' height='900' fill='%23D1D5DB'/%3E%3C/svg%3E", alt: "Cover" },
        order: 0,
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" },
      },
      {
        type: "heading",
        content: { text: "Cover Title", level: 1 },
        order: 1,
        style: {
          fontSize: "4rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "#FFFFFF",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 10,
        },
      },
    ],
  },
  {
    id: "quote",
    name: "Quote",
    icon: Quote,
    layout: "quote",
    description: "Large centered quote",
    defaultBlocks: [
      {
        type: "quote",
        content: { text: "An inspiring quote goes here" },
        order: 0,
        style: {
          fontSize: "2.5rem",
          textAlign: "center",
          fontStyle: "italic",
          lineHeight: "1.4",
        },
      },
      {
        type: "text",
        content: { text: "— Author Name" },
        order: 1,
        style: { fontSize: "1.25rem", textAlign: "center", color: "#6B7280", marginTop: "2rem" },
      },
    ],
  },
  {
    id: "image-only",
    name: "Image Only",
    icon: ImageIcon,
    layout: "image-only",
    description: "Full-bleed image",
    defaultBlocks: [
      {
        type: "image",
        content: { url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Crect width='1600' height='900' fill='%23D1D5DB'/%3E%3C/svg%3E", alt: "Image" },
        order: 0,
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" },
      },
    ],
  },
  {
    id: "content",
    name: "Content",
    icon: FileText,
    layout: "content",
    description: "Title with bullet points",
    defaultBlocks: [
      {
        type: "heading",
        content: { text: "Content Title", level: 2 },
        order: 0,
        style: { fontSize: "3rem", fontWeight: "bold" },
      },
      {
        type: "bullet-list",
        content: { items: ["Point 1", "Point 2", "Point 3"] },
        order: 1,
        style: { fontSize: "1.5rem", lineHeight: "1.8" },
      },
    ],
  },
  {
    id: "blank",
    name: "Blank",
    icon: Layout,
    layout: "blank",
    description: "Empty slide",
    defaultBlocks: [],
  },
];
