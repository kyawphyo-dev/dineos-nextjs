"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

type ConfirmDialogProps = {
  trigger: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  trigger,
  title = "Delete Item",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>

          <AlertDialogAction disabled={loading} onClick={onConfirm}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

{
  /*                                <ConfirmDelete
                                     trigger={
                                        <button className="text-text-hint hover:text-rose p-1">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      }
                                      title="Delete Menu Item"
                                      description="Are you sure you want to delete this menu item? This action cannot be undone."
                                      onConfirm={() => handleRemove(item.id)}
                                    /> */
}
