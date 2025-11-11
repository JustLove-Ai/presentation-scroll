"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { createPresentation } from "@/lib/actions/presentations";
import { createSlide } from "@/lib/actions/slides";
import { generateSlidesFromText } from "@/lib/actions/ai-generate";

export default function NewPresentationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "manual";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiText, setAiText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateManual = async () => {
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Create presentation
      const result = await createPresentation({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (!result.success || !result.data) {
        setError(result.error || "Failed to create presentation");
        return;
      }

      // Create a blank first slide
      await createSlide({
        presentationId: result.data.id,
        layout: "title",
      });

      // Navigate to the editor
      router.push(`/presentations/${result.data.id}/edit`);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateWithAI = async () => {
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!aiText.trim()) {
      setError("Please enter some text to generate slides from");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Create presentation
      const result = await createPresentation({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (!result.success || !result.data) {
        setError(result.error || "Failed to create presentation");
        return;
      }

      // Generate slides using AI
      const aiResult = await generateSlidesFromText(
        aiText,
        result.data.id
      );

      if (!aiResult.success) {
        setError(aiResult.error || "Failed to generate slides");
        return;
      }

      // Navigate to the presentation
      router.push(`/presentations/${result.data.id}`);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/presentations")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Presentations
        </Button>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {mode === "ai" ? "Create with AI" : "Create Presentation"}
            </CardTitle>
            <CardDescription>
              {mode === "ai"
                ? "Provide your content and let AI generate professional slides"
                : "Start with a blank presentation"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Presentation Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Q4 Business Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isCreating}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your presentation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                rows={2}
              />
            </div>

            {/* AI Mode: Text Input */}
            {mode === "ai" && (
              <div className="space-y-2">
                <Label htmlFor="ai-text">Content to Convert *</Label>
                <Textarea
                  id="ai-text"
                  placeholder="Paste your content here... AI will analyze it and create slides with proper structure, headings, and bullet points."
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  disabled={isCreating}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Include headings, sections, and key points for best results
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/presentations")}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={mode === "ai" ? handleCreateWithAI : handleCreateManual}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === "ai" ? "Generating..." : "Creating..."}
                  </>
                ) : (
                  mode === "ai" ? "Generate Slides" : "Create Presentation"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
