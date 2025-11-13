"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns, Presentation } from "./presentations-columns";

interface PresentationsTableProps {
  presentations: Presentation[];
}

export function PresentationsTable({ presentations }: PresentationsTableProps) {
  const router = useRouter();

  const handleRowClick = (presentation: Presentation) => {
    router.push(`/presentations/${presentation.id}/edit`);
  };

  return (
    <DataTable
      columns={columns}
      data={presentations}
      searchKey="title"
      searchPlaceholder="Search presentations..."
      onRowClick={handleRowClick}
    />
  );
}
