"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { DeleteProductDialog } from "@/components/dashboard/delete-product-dialog";
import { ProductFileField } from "@/components/dashboard/product-file-field";
import { ProductImageField } from "@/components/dashboard/product-image-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { strings } from "@/constants/strings";
import {
  createProduct,
  generateDescription,
  updateProduct,
} from "@/lib/actions/products";
import {
  productSchema,
  type ProductFile,
  type ProductInput,
  type ProductValues,
} from "@/lib/schemas/product";
import { slugify } from "@/lib/utils";

type SavedProduct = {
  id: number;
  slug: string;
  name: string;
  tag: string;
  description: string;
  price: string;
  /** Null for a product created before product files existed. */
  file: ProductFile | null;
  imageUrls: string[];
};

export function ProductForm({
  handle,
  product,
}: {
  handle: string;
  /** Present when editing; omitted when creating. */
  product?: SavedProduct;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [isDrafting, setIsDrafting] = React.useState(false);
  const [draftError, setDraftError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
    // Three type arguments, not one: the form holds `ProductInput` (whose
    // `file` may be null while it's being filled in) and `handleSubmit` hands
    // the actions the parsed `ProductValues`, where it can't be. See the note
    // on `file` in lib/schemas/product.ts.
  } = useForm<ProductInput, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      tag: product?.tag ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      file: product?.file ?? null,
      imageUrls: product?.imageUrls ?? [],
    },
  });

  // The server derives the slug from the name with this same function, so the
  // preview is what the URL will actually be — bar a `-2` if it collides.
  // `useWatch` rather than `watch()`: the latter returns a fresh function each
  // render, which opts the whole component out of React Compiler memoization.
  const name = useWatch({ control, name: "name" });
  const previewSlug = slugify(name ?? "");
  const storeUrl = previewSlug
    ? `/${handle}/${product?.id ?? "…"}/${previewSlug}`
    : null;

  const imageUrls = useWatch({ control, name: "imageUrls" });
  const description = useWatch({ control, name: "description" });
  // Mirrors the refine on productDescriptionRequestSchema: a name worth
  // writing about, or an image to look at.
  const canDraft =
    (name ?? "").trim().length >= 3 || (imageUrls ?? []).length > 0;

  /**
   * Asks the AI Gateway for a description built from the name, type and cover
   * image, and writes it into the field. Nothing is saved — the creator still
   * edits and submits it like text they typed.
   *
   * `onlyIfEmpty` is the automatic run after an upload: it must never replace
   * words the creator wrote, including ones typed while the model was working,
   * so emptiness is checked again when the draft arrives.
   */
  async function draftDescription({ onlyIfEmpty = false } = {}) {
    const [currentName, tag, images] = getValues(["name", "tag", "imageUrls"]);

    setIsDrafting(true);
    setDraftError(null);

    const result = await generateDescription({
      name: currentName ?? "",
      tag: tag ?? "",
      imageUrl: images?.[0] ?? null,
    });

    setIsDrafting(false);

    if (!result.ok) {
      setDraftError(result.error);
      return;
    }

    if (onlyIfEmpty && getValues("description")?.trim()) {
      return;
    }

    setValue("description", result.description, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(false);

    const result = product
      ? await updateProduct(product.id, values)
      : await createProduct(values);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    if (product) {
      // Re-seed with the normalised values the server stored (price "48" comes
      // back as "48.00"), so the form matches the database.
      reset(values);
      setSaved(true);
      router.refresh();
      return;
    }

    router.push(`/products/${result.id}`);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit
              ? strings.products.editTitle
              : strings.products.createTitle}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? strings.products.editSubtitle
              : strings.products.createSubtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {formError && (
            <p
              role="alert"
              className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              {strings.products.name}
            </label>
            <Input
              id="name"
              autoComplete="off"
              placeholder={strings.products.namePlaceholder}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {storeUrl
                ? strings.products.slugPreview.replace("{url}", storeUrl)
                : strings.products.slugPending}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="tag" className="text-sm font-medium">
                {strings.products.tag}
              </label>
              <Input
                id="tag"
                autoComplete="off"
                placeholder={strings.products.tagPlaceholder}
                aria-invalid={!!errors.tag}
                {...register("tag")}
              />
              {errors.tag && (
                <p className="text-xs text-destructive">{errors.tag.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                {strings.products.price}
              </label>
              <Input
                id="price"
                inputMode="decimal"
                placeholder={strings.products.pricePlaceholder}
                aria-invalid={!!errors.price}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                {strings.products.description}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={!canDraft || isDrafting}
                onClick={() => void draftDescription()}
              >
                {isDrafting ? (
                  <CircleNotchIcon className="animate-spin" />
                ) : (
                  <SparkleIcon />
                )}
                {isDrafting
                  ? strings.products.descriptionGenerating
                  : description?.trim()
                    ? strings.products.descriptionRegenerate
                    : strings.products.descriptionGenerate}
              </Button>
            </div>
            <Textarea
              id="description"
              rows={5}
              placeholder={strings.products.descriptionPlaceholder}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
            {draftError ? (
              <p role="alert" className="text-xs text-destructive">
                {draftError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {canDraft
                  ? strings.products.descriptionGenerateHint
                  : strings.validation.productDescriptionSource}
              </p>
            )}
          </div>

          {/* Uploads append to the `imageUrls` form value; nothing reaches the
              product row until this form is submitted. */}
          <ProductImageField
            control={control}
            productName={name ?? ""}
            seed={previewSlug || String(product?.id ?? "")}
            // A first photo on an empty description drafts one from it. Never
            // over text the creator has written — see draftDescription.
            onUploaded={() => {
              if (!getValues("description")?.trim()) {
                void draftDescription({ onlyIfEmpty: true });
              }
            }}
          />

          {/* The digital product itself. Like the images above, the upload
              writes a form value; the row only changes on submit. */}
          <ProductFileField control={control} />
        </CardContent>

        <CardFooter className="justify-between border-t">
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? strings.products.saving
                  : strings.products.creating
                : isEdit
                  ? strings.products.save
                  : strings.products.create}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircleIcon className="size-3.5" />
                {strings.products.saved}
              </span>
            )}
          </div>

          {product && (
            <div className="flex items-center gap-1">
              <DeleteProductDialog
                id={product.id}
                name={product.name}
                trigger="button"
                afterDelete="list"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                nativeButton={false}
                render={
                  <Link href={`/${handle}/${product.id}/${product.slug}`} />
                }
              >
                {strings.products.viewInStore}
                <ArrowSquareOutIcon />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
