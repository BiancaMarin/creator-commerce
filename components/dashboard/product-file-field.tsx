"use client";

import * as React from "react";
import { useController, type Control } from "react-hook-form";
import {
  CircleNotchIcon,
  FileArrowUpIcon,
  PaperclipIcon,
  XIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { strings } from "@/constants/strings";
import {
  MAX_PRODUCT_FILE_BYTES,
  type ProductInput,
} from "@/lib/schemas/product";
import { useUploadThing } from "@/lib/uploadthing";
import { cn, formatFileSize } from "@/lib/utils";

/**
 * The product file field — the digital product itself, not its artwork. Picked
 * through the button or dropped anywhere on the field.
 *
 * Deliberately *not* a variant of `ProductImageField`. That one collects a
 * gallery: many files, appended, ordered, each removable. This one holds
 * exactly one thing, so picking a second file replaces the first rather than
 * adding to it, and the whole control is a single row instead of a strip of
 * thumbnails. Sharing a component would mean branching on "is it the gallery?"
 * in nearly every function.
 *
 * What they do share is the rule that matters: the upload writes a *form
 * value*, never a row. Nothing reaches the product until the creator saves, so
 * abandoning a half-edited product leaves the catalog — and the previously
 * attached file — alone.
 */
export function ProductFileField({
  control,
  onUploaded,
  onUploadingChange,
}: {
  // `ProductInput`, not `ProductValues`: while the form is open the field is
  // allowed to hold nothing, which is the whole reason the two types differ.
  control: Control<ProductInput>;
  /**
   * Called after a finished upload is in the form value. The product form uses
   * it to draft a description from the new file.
   */
  onUploaded?: () => void;
  /**
   * Told when an upload starts and ends, so the form can hold Save until the
   * value it's waiting for has actually arrived.
   */
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  // dragenter/dragleave fire for every child the pointer crosses, so a plain
  // boolean flickers. Counting enters against leaves is what steadies it.
  const dragDepth = React.useRef(0);

  // Driven rather than registered: the value arrives from an upload callback,
  // never from a keystroke.
  const { field, fieldState } = useController({ control, name: "file" });
  const file = field.value ?? null;

  const { startUpload, isUploading } = useUploadThing("productFile", {
    onClientUploadComplete: (uploads) => {
      // `serverData` is what the route's onUploadComplete returned. It is typed
      // non-nullable but isn't at runtime: that callback only runs once
      // UploadThing calls back into this server, which it can't do when the app
      // is served by `next start` on localhost. Reading through it would throw
      // inside this handler, and useUploadThing would report the generic
      // "report this to UploadThing" message instead of what actually broke.
      const uploaded = uploads[0]?.serverData;

      if (!uploaded) {
        setError(strings.products.fileNoCallback);
        return;
      }

      setError(null);
      field.onChange(uploaded);
      onUploaded?.();
    },
    onUploadError: (uploadError) => {
      // Messages thrown from the route's middleware — the signed-out case and
      // the server-side size check — arrive here intact, so prefer them.
      setError(uploadError.message || strings.products.fileError);
    },
  });

  /** The one path into an upload, shared by the file picker and the drop. */
  function upload(picked: File[]) {
    // A drop can carry a whole selection; the product is one download, so this
    // is a rejection rather than a silent "we took the first one".
    if (picked.length > 1) {
      setError(strings.products.fileDropMultiple);
      return;
    }

    const [candidate] = picked;

    if (!candidate) {
      return;
    }

    // Checked here as well as in the route's middleware: this is the copy that
    // saves a creator from watching 400 MB upload before it's refused.
    if (candidate.size > MAX_PRODUCT_FILE_BYTES) {
      setError(strings.products.fileTooLarge);
      return;
    }

    setError(null);
    onUploadingChange?.(true);
    void startUpload([candidate]).finally(() => onUploadingChange?.(false));
  }

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);

    // Clearing the input matters: without it, picking the same file again
    // after a remove fires no change event and the upload never starts.
    event.target.value = "";

    if (picked.length > 0) {
      upload(picked);
    }
  }

  function onRemove() {
    // Only detaches the file from the product — the upload stays on
    // UploadThing, like a removed image, until `npm run cleanup:orphans` reaps
    // it. Saving now fails validation, which is the point: a product
    // without a file isn't one.
    field.onChange(null);
    setError(null);
  }

  /** True only for drags that actually carry files, not text or a link. */
  function isFileDrag(event: React.DragEvent) {
    return event.dataTransfer.types.includes("Files");
  }

  function onDragEnter(event: React.DragEvent) {
    if (!isFileDrag(event)) {
      return;
    }

    dragDepth.current += 1;
    setIsDraggingOver(true);
  }

  function onDragOver(event: React.DragEvent) {
    if (!isFileDrag(event)) {
      return;
    }

    // Without preventDefault the browser refuses the drop and navigates to the
    // file instead — this is what makes the element a drop target at all.
    event.preventDefault();
    event.dataTransfer.dropEffect = isUploading ? "none" : "copy";
  }

  function onDragLeave(event: React.DragEvent) {
    if (!isFileDrag(event)) {
      return;
    }

    dragDepth.current -= 1;

    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDraggingOver(false);
    }
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDraggingOver(false);

    if (isUploading) {
      return;
    }

    upload(Array.from(event.dataTransfer.files));
  }

  // The upload's own error wins over the schema's: "over 100 MB" says more than
  // "upload the file buyers will download", and the second is only true because
  // the first happened.
  const message = error ?? fieldState.error?.message ?? null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{strings.products.file}</span>

      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex items-center gap-3 rounded-3xl border border-dashed p-3 transition-colors",
          "ring ring-transparent",
          isDraggingOver && !isUploading && "bg-primary/5 border-primary/50 ring-primary/40",
          message && !isDraggingOver && "border-destructive/50",
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground",
            isDraggingOver && !isUploading && "bg-primary/10 text-primary",
          )}
        >
          {isUploading ? (
            <CircleNotchIcon className="size-5 animate-spin" />
          ) : file ? (
            <PaperclipIcon className="size-5" />
          ) : (
            <FileArrowUpIcon className="size-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          {file ? (
            <>
              {/* A filename can be long and has no spaces to wrap on, so it
                  truncates rather than pushing the buttons off the card. */}
              <p className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isUploading
                ? strings.products.fileUploading
                : isDraggingOver
                  ? strings.products.fileDrop
                  : strings.products.fileDropHint}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {/* Picking a second file replaces the first — the label says so
                rather than leaving the creator to find out. */}
            {file ? strings.products.fileReplace : strings.products.fileUpload}
          </Button>

          {file && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={strings.products.fileRemoveAria.replace(
                "{name}",
                file.name,
              )}
              className="rounded-full text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <XIcon />
            </Button>
          )}
        </div>
      </div>

      {message ? (
        <p className="text-xs text-destructive">{message}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {strings.products.fileHint}
        </p>
      )}

      {/* The real control. Hidden rather than styled, because a file input
          can't be restyled to match the Button primitive. */}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onPick}
      />
    </div>
  );
}
