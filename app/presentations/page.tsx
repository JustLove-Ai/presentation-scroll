import { getPresentations } from "@/lib/actions/presentations";
import { Presentation } from "lucide-react";
import { CreatePresentationDialog } from "@/components/presentations/create-presentation-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { PresentationsTable } from "@/components/presentations/presentations-table";

export default async function PresentationsPage() {
  const result = await getPresentations();
  const presentations = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#1e1e1e]">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Presentations
            </h1>
            <p className="text-muted-foreground">
              Create and manage your beautiful slide decks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <CreatePresentationDialog />
          </div>
        </div>

        {/* Presentations Table */}
        {presentations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Presentation className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No presentations yet</h2>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first presentation
            </p>
            <CreatePresentationDialog />
          </div>
        ) : (
          <PresentationsTable presentations={presentations} />
        )}
      </div>
    </div>
  );
}
