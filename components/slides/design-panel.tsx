"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { designThemes, DesignTheme } from "@/lib/design-themes";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface DesignPanelProps {
  onApplyToSlide: (theme: DesignTheme) => void;
  onApplyToAll: (theme: DesignTheme) => void;
  currentSlideThemeId?: string;
}

export function DesignPanel({
  onApplyToSlide,
  onApplyToAll,
  currentSlideThemeId,
}: DesignPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Design Themes
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          One-click professional designs
        </p>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-3 mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Choose a design theme
          </p>
          {designThemes.map((theme) => {
            const Icon = theme.icon;
            const isActive = currentSlideThemeId === theme.id;

            return (
              <div
                key={theme.id}
                className={`rounded-lg border-2 transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
              >
                {/* Theme Preview */}
                <div
                  className="h-20 rounded-t-md relative overflow-hidden"
                  style={{
                    background:
                      theme.background.type === "gradient"
                        ? theme.background.value
                        : theme.background.value,
                  }}
                >
                  {/* Accent Bar Preview */}
                  {theme.accentBar && (
                    <div
                      style={{
                        position: "absolute",
                        [theme.accentBar.position]: 0,
                        [theme.accentBar.position === "left" ||
                        theme.accentBar.position === "right"
                          ? "height"
                          : "width"]: "100%",
                        [theme.accentBar.position === "left" ||
                        theme.accentBar.position === "right"
                          ? "width"
                          : "height"]: theme.accentBar.width,
                        background: theme.accentBar.color,
                      }}
                    />
                  )}

                  {/* Sample Text */}
                  <div className="p-3 relative">
                    <div
                      className="text-sm font-bold mb-1"
                      style={{
                        color: theme.headingColor || theme.textColor,
                        borderLeft: theme.titleStyle?.leftBar
                          ? `3px solid ${theme.accentColor}`
                          : undefined,
                        paddingLeft: theme.titleStyle?.leftBar ? "8px" : undefined,
                        borderBottom: theme.titleStyle?.underline
                          ? `2px solid ${theme.accentColor}`
                          : undefined,
                        display: "inline-block",
                      }}
                    >
                      Title
                    </div>
                    <div className="text-xs" style={{ color: theme.textColor }}>
                      Sample text
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Theme Info & Actions */}
                <div className="p-3">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="p-1.5 rounded bg-gray-100 dark:bg-gray-800">
                      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{theme.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => onApplyToSlide(theme)}
                    >
                      This Slide
                    </Button>
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      className="flex-1 text-xs"
                      onClick={() => onApplyToAll(theme)}
                    >
                      All Slides
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
