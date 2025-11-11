"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Share2, Download, Presentation as PresentationIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

interface PresentationHeaderProps {
  presentation: any;
}

export function PresentationHeader({ presentation }: PresentationHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222] shadow-sm">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/presentations")}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Presentations
          </Button>
          <div className="border-l border-gray-300 dark:border-gray-700 pl-4">
            <h1 className="font-semibold text-base">{presentation.title}</h1>
            {presentation.description && (
              <p className="text-xs text-muted-foreground">
                {presentation.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/presentations/${presentation.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
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
    </header>
  );
}
