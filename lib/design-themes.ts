import { Palette, Moon, Sparkles, Zap, Coffee, Award } from "lucide-react";

export interface DesignTheme {
  id: string;
  name: string;
  icon: any;
  description: string;
  background: {
    type: "color" | "gradient";
    value: string;
  };
  textColor: string;
  headingColor?: string;
  accentColor: string;
  // Special styling options
  titleStyle?: {
    underline?: boolean;
    leftBar?: boolean;
    background?: string;
  };
  imageBorder?: {
    width: string;
    color: string;
    radius?: string;
  };
  accentBar?: {
    position: "top" | "bottom" | "left" | "right";
    color: string;
    width: string;
  };
}

export const designThemes: DesignTheme[] = [
  {
    id: "default",
    name: "Default",
    icon: Palette,
    description: "Clean white background",
    background: {
      type: "color",
      value: "#FFFFFF",
    },
    textColor: "#1F2937",
    headingColor: "#111827",
    accentColor: "#3B82F6",
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    icon: Moon,
    description: "Modern dark theme",
    background: {
      type: "color",
      value: "#1a1a1a",
    },
    textColor: "#E5E7EB",
    headingColor: "#F9FAFB",
    accentColor: "#60A5FA",
    titleStyle: {
      leftBar: true,
    },
    accentBar: {
      position: "left",
      color: "#60A5FA",
      width: "8px",
    },
  },
  {
    id: "slate-professional",
    name: "Slate Professional",
    icon: Coffee,
    description: "Sophisticated grey tones",
    background: {
      type: "color",
      value: "#F8FAFC",
    },
    textColor: "#475569",
    headingColor: "#1E293B",
    accentColor: "#0F172A",
    titleStyle: {
      underline: true,
    },
    imageBorder: {
      width: "3px",
      color: "#CBD5E1",
      radius: "8px",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    icon: Sparkles,
    description: "Professional blue gradient",
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    textColor: "#F9FAFB",
    headingColor: "#FFFFFF",
    accentColor: "#FCD34D",
    titleStyle: {
      underline: true,
      background: "rgba(255, 255, 255, 0.1)",
    },
    accentBar: {
      position: "bottom",
      color: "#FCD34D",
      width: "4px",
    },
  },
  {
    id: "minimal-grey",
    name: "Minimal Grey",
    icon: Award,
    description: "Clean and minimalist",
    background: {
      type: "color",
      value: "#E5E7EB",
    },
    textColor: "#374151",
    headingColor: "#111827",
    accentColor: "#EF4444",
    titleStyle: {
      leftBar: true,
    },
    imageBorder: {
      width: "2px",
      color: "#9CA3AF",
      radius: "0px",
    },
    accentBar: {
      position: "left",
      color: "#EF4444",
      width: "6px",
    },
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    icon: Zap,
    description: "Warm gradient background",
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    textColor: "#FFFFFF",
    headingColor: "#FFFFFF",
    accentColor: "#FCD34D",
    titleStyle: {
      underline: true,
      background: "rgba(255, 255, 255, 0.15)",
    },
    imageBorder: {
      width: "4px",
      color: "#FFFFFF",
      radius: "12px",
    },
    accentBar: {
      position: "top",
      color: "#FCD34D",
      width: "5px",
    },
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    icon: Award,
    description: "Professional navy theme",
    background: {
      type: "color",
      value: "#1E3A8A",
    },
    textColor: "#DBEAFE",
    headingColor: "#FFFFFF",
    accentColor: "#60A5FA",
    titleStyle: {
      leftBar: true,
      background: "rgba(96, 165, 250, 0.1)",
    },
    imageBorder: {
      width: "3px",
      color: "#60A5FA",
      radius: "6px",
    },
    accentBar: {
      position: "left",
      color: "#60A5FA",
      width: "8px",
    },
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    icon: Sparkles,
    description: "Fresh mint green theme",
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
    textColor: "#1F2937",
    headingColor: "#111827",
    accentColor: "#10B981",
    titleStyle: {
      underline: true,
    },
    imageBorder: {
      width: "3px",
      color: "#10B981",
      radius: "10px",
    },
  },
];
