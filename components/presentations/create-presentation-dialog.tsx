"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, PenTool, LayoutTemplate } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function CreatePresentationDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"choice" | "ai" | "manual" | "template">("choice");
  const router = useRouter();

  const handleSelectMode = (selectedMode: "ai" | "manual" | "template") => {
    setMode(selectedMode);
    // Route to appropriate creation flow
    if (selectedMode === "ai") {
      router.push("/presentations/new?mode=ai");
    } else if (selectedMode === "manual") {
      router.push("/presentations/new?mode=manual");
    } else {
      router.push("/presentations/new?mode=template");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          New Presentation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Presentation</DialogTitle>
          <DialogDescription>
            Choose how you want to get started
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* AI Generation */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => handleSelectMode("ai")}
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-white dark:text-neutral-900" />
              </div>
              <CardTitle className="text-lg">AI Generation</CardTitle>
              <CardDescription className="text-sm">
                Paste your text and let AI create professional slides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Start with AI
              </Button>
            </CardContent>
          </Card>

          {/* Manual Creation */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => handleSelectMode("manual")}
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center mb-3">
                <PenTool className="h-6 w-6 text-white dark:text-neutral-900" />
              </div>
              <CardTitle className="text-lg">Start from Scratch</CardTitle>
              <CardDescription className="text-sm">
                Build your presentation slide by slide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Create Manually
              </Button>
            </CardContent>
          </Card>

          {/* Template */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => handleSelectMode("template")}
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center mb-3">
                <LayoutTemplate className="h-6 w-6 text-white dark:text-neutral-900" />
              </div>
              <CardTitle className="text-lg">Use Template</CardTitle>
              <CardDescription className="text-sm">
                Choose from professional templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Browse Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
