"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, FileText, Lightbulb, X } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateFromScript, generateFromTopic } from "@/lib/actions/ai-generation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GenerateAIPanelProps {
  presentationId: string;
  aiContext?: {
    topic?: string;
    audience?: string;
    tone?: string;
    keyMessage?: string;
  };
  onClose: () => void;
}

export function GenerateAIPanel({
  presentationId,
  aiContext,
  onClose,
}: GenerateAIPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"script" | "topic">("script");
  const [generating, setGenerating] = useState(false);

  // Script mode state
  const [script, setScript] = useState("");
  const [scriptMaxSlides, setScriptMaxSlides] = useState("5");

  // Topic mode state
  const [topic, setTopic] = useState(aiContext?.topic || "");
  const [keyPoints, setKeyPoints] = useState("");
  const [style, setStyle] = useState("educational");
  const [topicMaxSlides, setTopicMaxSlides] = useState("5");

  const handleGenerateFromScript = async () => {
    setGenerating(true);
    toast.loading("Generating slides from script...");

    const result = await generateFromScript(
      presentationId,
      script,
      parseInt(scriptMaxSlides),
      {}
    );

    if (result.success) {
      toast.dismiss();
      toast.success(`Generated ${result.data.slidesGenerated} slides!`);
      router.refresh();
      setScript(""); // Clear form
    } else {
      toast.dismiss();
      toast.error(result.error || "Failed to generate slides");
    }

    setGenerating(false);
  };

  const handleGenerateFromTopic = async () => {
    setGenerating(true);
    toast.loading("Generating slides from topic...");

    const result = await generateFromTopic(
      presentationId,
      topic,
      keyPoints,
      style,
      parseInt(topicMaxSlides),
      {}
    );

    if (result.success) {
      toast.dismiss();
      toast.success(`Generated ${result.data.slidesGenerated} slides!`);
      router.refresh();
      // Keep topic but clear key points
      setKeyPoints("");
    } else {
      toast.dismiss();
      toast.error(result.error || "Failed to generate slides");
    }

    setGenerating(false);
  };

  return (
    <div className="w-80 bg-white dark:bg-[#252525] border-l border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333333]">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Generate with AI
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              From script or topic
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

        {/* Mode Tabs */}
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "script" | "topic")}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="script" className="gap-2">
              <FileText className="h-4 w-4" />
              From Script
            </TabsTrigger>
            <TabsTrigger value="topic" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              From Topic
            </TabsTrigger>
          </TabsList>

          {/* From Script Tab */}
          <TabsContent
            value="script"
            className="flex-1 overflow-hidden p-0 m-0 mt-2"
          >
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="script">Paste Your Script *</Label>
                  <Textarea
                    id="script"
                    placeholder="Paste your script, speech, or content here. AI will break it into logical slides..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    AI will analyze your script and create slides that follow
                    your content closely.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scriptMaxSlides">Maximum Slides</Label>
                  <Select
                    value={scriptMaxSlides}
                    onValueChange={setScriptMaxSlides}
                  >
                    <SelectTrigger id="scriptMaxSlides">
                      <SelectValue placeholder="Select max slides" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 slides</SelectItem>
                      <SelectItem value="5">5 slides</SelectItem>
                      <SelectItem value="10">10 slides</SelectItem>
                      <SelectItem value="12">12 slides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {aiContext?.topic && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <h4 className="text-sm font-medium mb-1">
                      Using Presentation Context:
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Topic: {aiContext.topic}
                      {aiContext.audience &&
                        ` • Audience: ${aiContext.audience}`}
                      {aiContext.tone && ` • Tone: ${aiContext.tone}`}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGenerateFromScript}
                  disabled={!script || generating}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generating ? "Generating..." : "Generate Slides"}
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* From Topic Tab */}
          <TabsContent
            value="topic"
            className="flex-1 overflow-hidden p-0 m-0 mt-2"
          >
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Main Topic / Subject *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Introduction to Machine Learning"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyPoints">
                    Key Points / Ideas (Optional)
                  </Label>
                  <Textarea
                    id="keyPoints"
                    placeholder="• Point 1&#10;• Point 2&#10;• Point 3&#10;&#10;Add any important points you want to cover..."
                    value={keyPoints}
                    onChange={(e) => setKeyPoints(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: List specific points or ideas to include.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Presentation Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">
                        Educational / Academic
                      </SelectItem>
                      <SelectItem value="sales">
                        Sales / Persuasive
                      </SelectItem>
                      <SelectItem value="storytelling">
                        Storytelling / Narrative
                      </SelectItem>
                      <SelectItem value="technical">
                        Technical / Detailed
                      </SelectItem>
                      <SelectItem value="inspirational">
                        Inspirational / Motivational
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topicMaxSlides">Maximum Slides</Label>
                  <Select
                    value={topicMaxSlides}
                    onValueChange={setTopicMaxSlides}
                  >
                    <SelectTrigger id="topicMaxSlides">
                      <SelectValue placeholder="Select max slides" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 slides</SelectItem>
                      <SelectItem value="5">5 slides</SelectItem>
                      <SelectItem value="10">10 slides</SelectItem>
                      <SelectItem value="12">12 slides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {aiContext?.audience && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <h4 className="text-sm font-medium mb-1">
                      Using Presentation Context:
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {aiContext.audience && `Audience: ${aiContext.audience}`}
                      {aiContext.keyMessage &&
                        ` • Goal: ${aiContext.keyMessage}`}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGenerateFromTopic}
                  disabled={!topic || generating}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generating ? "Generating..." : "Generate Slides"}
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
