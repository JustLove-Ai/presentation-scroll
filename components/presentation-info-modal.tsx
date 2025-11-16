"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePresentation } from "@/lib/actions/presentations";
import { useRouter } from "next/navigation";

interface PresentationInfoModalProps {
  presentation: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PresentationInfoModal({
  presentation,
  open,
  onOpenChange,
}: PresentationInfoModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [keyMessage, setKeyMessage] = useState("");

  // Load existing context when modal opens
  useEffect(() => {
    if (open && presentation?.aiContext) {
      const context = presentation.aiContext;
      setTopic(context.topic || "");
      setAudience(context.audience || "");
      setTone(context.tone || "professional");
      setKeyMessage(context.keyMessage || "");
    }
  }, [open, presentation]);

  const handleSave = async () => {
    setLoading(true);

    const aiContext = {
      topic,
      audience,
      tone,
      keyMessage,
    };

    const result = await updatePresentation(presentation.id, { aiContext });

    setLoading(false);

    if (result.success) {
      router.refresh();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Presentation Context</DialogTitle>
          <DialogDescription>
            Set context for AI generation. This information will be used when generating slides.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Subject *</Label>
            <Input
              id="topic"
              placeholder="e.g., Digital Marketing for Startups"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="e.g., Small business owners, Tech entrepreneurs"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone">Tone / Style</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual / Conversational</SelectItem>
                <SelectItem value="educational">Educational / Academic</SelectItem>
                <SelectItem value="persuasive">Persuasive / Sales</SelectItem>
                <SelectItem value="inspirational">Inspirational / Motivational</SelectItem>
                <SelectItem value="technical">Technical / Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Message */}
          <div className="space-y-2">
            <Label htmlFor="keyMessage">Key Message / Goal</Label>
            <Textarea
              id="keyMessage"
              placeholder="e.g., Teach attendees how to build an email list from scratch"
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !topic}>
            {loading ? "Saving..." : "Save Context"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
