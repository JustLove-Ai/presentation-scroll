import { getPresentation } from "@/lib/actions/presentations";
import { notFound, redirect } from "next/navigation";
import { SlideViewer } from "@/components/slides/slide-viewer";
import { PresentationHeader } from "@/components/presentations/presentation-header";

export default async function PresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getPresentation(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const presentation = result.data;

  // If no slides, redirect to edit mode
  if (presentation.slides.length === 0) {
    redirect(`/presentations/${id}/edit`);
  }

  return (
    <div className="min-h-screen bg-white">
      <PresentationHeader presentation={presentation} />
      <SlideViewer presentation={presentation} />
    </div>
  );
}
