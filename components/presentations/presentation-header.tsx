"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Share2, Download, Presentation as PresentationIcon, Pencil, Settings, FileText, Sparkles, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { PresentationInfoModal } from "@/components/presentation-info-modal";

interface PresentationHeaderProps {
  presentation: any;
  isAnnotating?: boolean;
  onAnnotateToggle?: () => void;
  mode?: "edit" | "present";
  showSettings?: boolean;
  onToggleSettings?: () => void;
  onLoadTemplateClick?: () => void;
  onGenerateAIClick?: () => void;
  showLoadTemplate?: boolean;
  showGenerateAI?: boolean;
}

export function PresentationHeader({
  presentation,
  isAnnotating,
  onAnnotateToggle,
  mode = "present",
  showSettings,
  onToggleSettings,
  onLoadTemplateClick,
  onGenerateAIClick,
  showLoadTemplate,
  showGenerateAI
}: PresentationHeaderProps) {
  const router = useRouter();
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#252525] border-b border-gray-200 dark:border-[#333333] shadow-sm">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/presentations")}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="border-l border-gray-300 dark:border-gray-700 pl-4">
            <h1 className="font-semibold text-base">{presentation.title}</h1>
            <p className="text-xs text-muted-foreground">
              {mode === "edit"
                ? `${presentation.slides?.length || 0} slides`
                : presentation.description || ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* AI Features - Only in edit mode */}
          {mode === "edit" && onLoadTemplateClick && (
            <Button
              variant={showLoadTemplate ? "default" : "outline"}
              size="sm"
              onClick={onLoadTemplateClick}
            >
              <FileText className="h-4 w-4 mr-2" />
              Load Template
            </Button>
          )}

          {mode === "edit" && onGenerateAIClick && (
            <Button
              variant={showGenerateAI ? "default" : "outline"}
              size="sm"
              onClick={onGenerateAIClick}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          )}

          {/* Presentation Context Button */}
          {mode === "edit" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfoModal(true)}
              title="Presentation Context"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}

          {onAnnotateToggle && (
            <Button
              variant={isAnnotating ? "default" : "outline"}
              size="sm"
              onClick={onAnnotateToggle}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Annotate
            </Button>
          )}
          {mode === "edit" && onToggleSettings && (
            <Button
              variant={showSettings ? "default" : "secondary"}
              size="sm"
              className={showSettings ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={onToggleSettings}
            >
              {showSettings ? (
                <>
                  <PresentationIcon className="h-4 w-4 mr-2" />
                  Present
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Presentation Info Modal */}
      <PresentationInfoModal
        presentation={presentation}
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
      />
    </header>
  );
}
