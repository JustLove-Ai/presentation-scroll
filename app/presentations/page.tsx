import { getPresentations } from "@/lib/actions/presentations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Presentation } from "lucide-react";
import Link from "next/link";
import { CreatePresentationDialog } from "@/components/presentations/create-presentation-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function PresentationsPage() {
  const result = await getPresentations();
  const presentations = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
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

        {/* Presentations Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation: any) => (
              <Link
                key={presentation.id}
                href={`/presentations/${presentation.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">
                          {presentation.title}
                        </CardTitle>
                        {presentation.description && (
                          <CardDescription className="line-clamp-2 mt-2">
                            {presentation.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{presentation.slides.length} slides</span>
                      {presentation.theme && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {presentation.theme.name}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Updated {new Date(presentation.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
