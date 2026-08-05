"use client";

import * as React from "react";
import { useController, type Control } from "react-hook-form";
import { CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";

import { ProductCover } from "@/components/store/product-cover";
import { Button } from "@/components/ui/button";
import { strings } from "@/constants/strings";
import { MAX_PRODUCT_IMAGES, type ProductValues } from "@/lib/schemas/product";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

/**
 * The images field of the product form. Files can be picked through the button
 * or dropped anywhere on the field.
 *
 * Uploads run as soon as files arrive and *append* their URLs to the
 * `imageUrls` form value — they don't touch the product row. Nothing is
 * persisted until the creator saves, so backing out of a half-edited product
 * leaves the catalog alone.
 *
 * Built on `useUploadThing` rather than UploadThing's prebuilt `UploadDropzone`
 * so the control is made of this project's own primitives and tokens, and so
 * the thumbnail strip, cover badge and per-product cap stay part of the same
 * component — see the note in `lib/uploadthing.ts`.
 */
export function ProductImageField({
  control,
  productName,
  seed,
}: {
  control: Control<ProductValues>;
  /** Used for the previews' alt text. */
  productName: string;
  /** Picks the placeholder gradient while there are no images. */
  seed: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  // dragenter/dragleave fire for every child element the pointer crosses, so a
  // plain boolean flickers as the cursor moves over a thumbnail. Counting
  // enters against leaves is what makes the highlight stable.
  const dragDepth = React.useRef(0);

  // The field is driven rather than registered: its value comes from upload
  // callbacks, never from a keystroke.
  const { field } = useController({ control, name: "imageUrls" });
  // `useController` types the value as string[], but a stale draft could still
  // hand back undefined — default it so the render never indexes into nothing.
  const images = field.value ?? [];

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (files) => {
      // `serverData` is what the route's onUploadComplete returned, so these
      // are `ufsUrl`s rather than the deprecated `file.url`.
      const uploaded = files.map((file) => file.serverData.imageUrl);

      // Read through `field.value` rather than the `images` captured above:
      // this callback outlives the render that created it.
      field.onChange(
        [...(field.value ?? []), ...uploaded].slice(0, MAX_PRODUCT_IMAGES),
      );
      setError(null);
    },
    onUploadError: (uploadError) => {
      // UploadThingError messages thrown in the router's middleware arrive
      // here intact (e.g. the signed-out case), so prefer them.
      setError(uploadError.message || strings.products.imageError);
    },
  });

  const remaining = MAX_PRODUCT_IMAGES - images.length;
  const canAccept = remaining > 0 && !isUploading;

  /** The one path into an upload, shared by the file picker and the drop. */
  function upload(files: File[]) {
    // Drops carry anything the OS allows, so the type filter is not decoration.
    const accepted = files.filter((file) => file.type.startsWith("image/"));

    if (accepted.length === 0) {
      setError(strings.products.imageDropRejected);
      return;
    }

    setError(null);
    // Trimmed to what still fits, so the cap is enforced before spending an
    // upload rather than by rejecting the form afterwards.
    void startUpload(accepted.slice(0, remaining));
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

  function onRemove(index: number) {
    // Only detaches the image from the product. The uploaded file is left on
    // UploadThing — reaping orphans needs UTApi and isn't wired up yet.
    field.onChange(images.filter((_, at) => at !== index));
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
    event.dataTransfer.dropEffect = canAccept ? "copy" : "none";
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

    if (remaining <= 0) {
      setError(
        strings.products.imageDropFull.replace(
          "{count}",
          String(MAX_PRODUCT_IMAGES),
        ),
      );
      return;
    }

    upload(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{strings.products.images}</span>

      {/* The whole field is the drop target, not just the add tile — dropping
          onto the thumbnails is the obvious gesture once images exist. */}
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "-m-2 flex flex-wrap items-start gap-3 rounded-3xl p-2 transition-colors",
          "ring ring-transparent",
          isDraggingOver &&
            (canAccept
              ? "bg-primary/5 ring-primary/40"
              : "bg-destructive/5 ring-destructive/30"),
        )}
      >
        {images.map((imageUrl, index) => (
          <div key={imageUrl} className="relative">
            <ProductCover
              seed={seed}
              imageUrl={imageUrl}
              alt={strings.products.imageAlt
                .replace("{index}", String(index + 1))
                .replace(
                  "{name}",
                  productName || strings.products.namePlaceholder,
                )}
              sizes="112px"
              className="size-28 rounded-2xl ring ring-foreground/5"
            />

            {/* The first image is the cover everywhere else in the app, so
                say so rather than leaving the ordering implicit. */}
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded-xl bg-background/85 px-1.5 py-0.5 text-[10px] font-medium">
                {strings.products.imageCover}
              </span>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={strings.products.imageRemoveAria.replace(
                "{index}",
                String(index + 1),
              )}
              className="absolute -top-1.5 -right-1.5 rounded-full bg-background text-muted-foreground ring ring-foreground/10 hover:bg-background hover:text-destructive"
              onClick={() => onRemove(index)}
            >
              <XIcon />
            </Button>
          </div>
        ))}

        {/* No placeholder gradient here: it would read as an uploaded image.
            The storefront falls back to one, and the hint below says so. */}
        {remaining > 0 && (
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className={cn(
              "size-28 flex-col gap-1 rounded-2xl border border-dashed px-2 text-xs",
              "text-muted-foreground hover:text-foreground",
              // The button is inside the drop target, so it has to look like
              // part of it rather than a competing surface.
              isDraggingOver && canAccept && "border-primary/50 text-primary",
            )}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <CircleNotchIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}
            {isUploading
              ? strings.products.imageUploading
              : isDraggingOver && canAccept
                ? strings.products.imageDrop
                : strings.products.imageUpload}
          </Button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {/* Drag-and-drop is discoverable only by trying it, so the hint
              names it — and still points at the button, which is the path
              that works from the keyboard. */}
          {remaining > 0 && `${strings.products.imageDropHint} `}
          {images.length === 0
            ? strings.products.imageEmptyHint
            : strings.products.imageHint.replace(
                "{count}",
                String(MAX_PRODUCT_IMAGES),
              )}
        </p>
      )}

      {/* The real control. Hidden rather than styled, because a file input
          can't be restyled to match the Button primitive. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onPick}
      />
    </div>
  );
}
