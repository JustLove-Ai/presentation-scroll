import { getPresentation } from "@/lib/actions/presentations";
import { notFound } from "next/navigation";
import { SlideEditor } from "@/components/slides/slide-editor";

export default async function EditPresentationPage({
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1e1e1e]">
      <SlideEditor presentation={presentation} />
    </div>
  );
}
