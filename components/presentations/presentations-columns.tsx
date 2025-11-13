"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Copy, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePresentation, duplicatePresentation } from "@/lib/actions/presentations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export type Presentation = {
  id: string;
  title: string;
  description: string | null;
  slides: any[];
  theme: any | null;
  createdAt: Date;
  updatedAt: Date;
};

function ActionsCell({ presentation }: { presentation: Presentation }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const result = await deletePresentation(presentation.id);
    if (result.success) {
      toast.success(`"${presentation.title}" deleted successfully`);
      router.refresh();
    } else {
      toast.error("Failed to delete presentation");
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    const result = await duplicatePresentation(presentation.id);
    if (result.success) {
      toast.success("Presentation duplicated successfully");
      router.refresh();
    } else {
      toast.error("Failed to duplicate presentation");
    }
    setIsDuplicating(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/presentations/${presentation.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
            <Copy className="mr-2 h-4 w-4" />
            {isDuplicating ? "Duplicating..." : "Duplicate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Presentation"
        description={`Are you sure you want to delete "${presentation.title}"? This will permanently delete all slides and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}

export const columns: ColumnDef<Presentation>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium">{title}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="max-w-md truncate text-muted-foreground">
          {description || "No description"}
        </div>
      );
    },
  },
  {
    accessorKey: "slides",
    header: "Slides",
    cell: ({ row }) => {
      const slides = row.getValue("slides") as any[];
      return <div>{slides?.length || 0} slides</div>;
    },
  },
  {
    accessorKey: "theme",
    header: "Theme",
    cell: ({ row }) => {
      const theme = row.getValue("theme") as any;
      return (
        <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary inline-block">
          {theme?.name || "Default"}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell presentation={row.original} />,
  },
];
