"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { designThemes, DesignTheme } from "@/lib/design-themes";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface DesignPanelProps {
  onApplyToSlide: (theme: DesignTheme) => void;
  onApplyToAll: (theme: DesignTheme) => void;
}

export function DesignPanel({
  onApplyToSlide,
  onApplyToAll,
}: DesignPanelProps) {
  const [selectedTheme, setSelectedTheme] = useState<DesignTheme | null>(null);

  const handleThemeClick = (theme: DesignTheme) => {
    setSelectedTheme(theme);
    onApplyToSlide(theme);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Design Themes
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Click to preview, then apply to all
        </p>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-3 mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Choose a design
          </p>

          {/* Apply to All Button */}
          {selectedTheme && (
            <Button
              onClick={() => onApplyToAll(selectedTheme)}
              className="w-full mb-2"
              size="sm"
            >
              Apply "{selectedTheme.name}" to All Slides
            </Button>
          )}

          {designThemes.map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeClick(theme)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gray-100 group-hover:bg-blue-100">
                    <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
