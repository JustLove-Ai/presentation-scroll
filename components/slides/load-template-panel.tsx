"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, ChevronLeft, CheckCircle2, FileText, Info } from "lucide-react";
import { scriptTemplates, type ScriptTemplate } from "@/lib/script-templates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadScriptTemplate } from "@/lib/actions/script-templates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LoadTemplatePanelProps {
  presentationId: string;
  slides: any[];
  onClose: () => void;
}

export function LoadTemplatePanel({
  presentationId,
  slides,
  onClose,
}: LoadTemplatePanelProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChooseTemplate = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    toast.loading("Loading template slides...");

    const result = await loadScriptTemplate(presentationId, selectedTemplate.id);

    if (result.success) {
      toast.dismiss();
      toast.success(`Loaded ${selectedTemplate.estimatedSlides} slides from ${selectedTemplate.name}`);
      router.refresh();
      onClose();
    } else {
      toast.dismiss();
      toast.error(result.error || "Failed to load template");
    }

    setLoading(false);
  };

  // Template List View
  if (!selectedTemplate) {
    return (
      <div className="w-80 bg-white dark:bg-[#252525] border-l border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333333]">
          <div>
            <h2 className="font-semibold">Script Templates</h2>
            <p className="text-xs text-muted-foreground">
              Proven frameworks
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-3 mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Choose a framework
            </p>
            {scriptTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-[#333333] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100 dark:bg-[#1a1a1a] group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{template.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {template.estimatedSlides}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
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

  // Template Detail View
  const Icon = selectedTemplate.icon;

  // Flatten all slides from sections to get a numbered list
  const allSlides = selectedTemplate.sections.flatMap((section) => section.slides);

  return (
    <div className="w-80 bg-white dark:bg-[#252525] border-l border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333333]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedTemplate(null)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-sm">{selectedTemplate.name}</h2>
            <p className="text-xs text-muted-foreground">
              {selectedTemplate.estimatedSlides} slides
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Choose Template Button - Always at top */}
      <div className="p-4 border-b border-gray-200 dark:border-[#333333]">
        <Button
          onClick={handleChooseTemplate}
          disabled={loading}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Loading..." : "Choose This Template"}
        </Button>
      </div>

      {/* Tabs for Overview and Slides */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="overview">
            <Info className="h-3 w-3 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="slides">
            <FileText className="h-3 w-3 mr-1" />
            Slides ({allSlides.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 overflow-hidden m-0 mt-4">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-4">
              {/* Template Icon & Description */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Best Used For */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Best Used For
                </h3>
                <Card className="p-3">
                  <p className="text-sm">{selectedTemplate.bestUsedFor}</p>
                </Card>
              </div>

              {/* Key Benefits */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Key Benefits
                </h3>
                <Card className="p-3">
                  <ul className="space-y-2">
                    {selectedTemplate.keyBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Slides Tab */}
        <TabsContent value="slides" className="flex-1 overflow-hidden m-0 mt-4">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-2">
              {allSlides.map((slide, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{slide.purpose}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {slide.instruction}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
