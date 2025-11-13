import { redirect } from "next/navigation";

export default async function PresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Always redirect to edit mode
  redirect(`/presentations/${id}/edit`);
}
