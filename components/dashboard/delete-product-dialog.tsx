"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@phosphor-icons/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { strings } from "@/constants/strings";
import { deleteProduct } from "@/lib/actions/products";

export function DeleteProductDialog({
  id,
  name,
  trigger = "icon",
  afterDelete = "refresh",
}: {
  id: number;
  name: string;
  /** "icon" for the catalog row, "button" for the edit form's footer. */
  trigger?: "icon" | "button";
  /**
   * Where to go once the row is gone. A string rather than a callback because
   * the catalog is a Server Component, and functions don't cross that boundary.
   */
  afterDelete?: "refresh" | "list";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onConfirm() {
    setError(null);
    setIsDeleting(true);

    const result = await deleteProduct(id);

    if (!result.ok) {
      // Stay open so the message is attached to what the user just tried.
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    setOpen(false);

    if (afterDelete === "list") {
      router.push("/products");
    }

    router.refresh();
  }

  const triggerButton = (
    <AlertDialogTrigger
      render={
        // type="button": in the edit form this sits inside <form>, where a
        // native button defaults to submit.
        trigger === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
          />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
          />
        )
      }
    >
      <TrashIcon />
      {trigger === "icon" ? (
        <span className="sr-only">
          {strings.products.deleteAria.replace("{name}", name)}
        </span>
      ) : (
        strings.products.delete
      )}
    </AlertDialogTrigger>
  );

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Ignore backdrop/escape while the delete is in flight.
        if (isDeleting) return;
        setError(null);
        setOpen(next);
      }}
    >
      {trigger === "icon" ? (
        // Two triggers on one button: Tooltip.Trigger renders AlertDialog.Trigger,
        // which in turn renders our Button. Base UI composes via `render`, so the
        // hover and the click handler land on the same element.
        <Tooltip>
          <TooltipTrigger render={triggerButton} />
          <TooltipContent>{strings.products.deleteTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        // The footer button already says "Delete" — a tooltip repeating it
        // would be noise.
        triggerButton
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TrashIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>{strings.products.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {strings.products.deleteDescription.replace("{name}", name)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {strings.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting
              ? strings.products.deleting
              : strings.products.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
