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
  draftProduct,
  updateProduct,
} from "@/lib/actions/products";
import {
  productSchema,
  type ProductFile,
  type ProductInput,
  type ProductValues,
} from "@/lib/schemas/product";
import {
  formatPrice,
  PLATFORM_FEE_PERCENT,
  sellerPayout,
} from "@/lib/store-data";
import { slugify } from "@/lib/utils";

/** The same shape `productSchema.price` accepts, for the live payout estimate. */
const PRICE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

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

/**
 * A titled block of the form. The page reads top to bottom in the order a
 * creator works: what they sell, how it's presented, what it costs.
 */
function FormSection({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint: string;
  /** Rendered beside the title, e.g. the AI button on Details. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

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
  const [aiFilled, setAiFilled] = React.useState(false);
  // Tracked per field: an image and the product file can upload at once, and
  // Save has to wait for both — submitting mid-upload fails validation on a
  // file that is, from the creator's point of view, already there.
  const [imagesUploading, setImagesUploading] = React.useState(false);
  const [fileUploading, setFileUploading] = React.useState(false);
  const isUploading = imagesUploading || fileUploading;

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
  const productFile = useWatch({ control, name: "file" });
  const price = useWatch({ control, name: "price" });
  // Mirrors the refine on productDescriptionRequestSchema: a name worth
  // writing about, an image to look at, or the file itself.
  const canDraft =
    (name ?? "").trim().length >= 3 ||
    (imageUrls ?? []).length > 0 ||
    Boolean(productFile);

  const priceAmount = PRICE_PATTERN.test((price ?? "").trim())
    ? Number(price)
    : 0;

  /**
   * Asks the AI Gateway for a name, type and description built from the
   * product file, cover image and whatever the creator has typed, and writes
   * them into the form. Nothing is saved — the creator still edits and submits
   * them like text they typed.
   *
   * Name and type are only ever filled when empty: those are short, deliberate
   * choices, and silently renaming a product is worse than leaving a blank.
   * The description is replaced by the button (its hint says so) but, in the
   * `automatic` run after an upload, only filled when empty — checked again
   * when the draft arrives, since the creator may have typed meanwhile.
   */
  async function draftDetails({ automatic = false } = {}) {
    const [currentName, tag, images, file] = getValues([
      "name",
      "tag",
      "imageUrls",
      "file",
    ]);

    setIsDrafting(true);
    setDraftError(null);

    const result = await draftProduct({
      name: currentName ?? "",
      tag: tag ?? "",
      imageUrl: images?.[0] ?? null,
      file: file ?? null,
    });

    setIsDrafting(false);

    if (!result.ok) {
      setDraftError(result.error);
      return;
    }

    const options = { shouldDirty: true, shouldValidate: true };
    let filled = false;

    for (const field of ["name", "tag"] as const) {
      const value = result.draft[field];

      if (value && !getValues(field)?.trim()) {
        setValue(field, value, options);
        filled = true;
      }
    }

    if (!automatic || !getValues("description")?.trim()) {
      setValue("description", result.draft.description, options);
      filled = true;
    }

    setAiFilled(filled);
  }

  /**
   * The automatic draft after an upload. It waits for the product file, since
   * that's what says most about the product and every product has one; the
   * cover is used if it's already there. Runs only while the description is
   * empty, so it never competes with text the creator wrote.
   */
  function draftAfterUpload() {
    if (getValues("file") && !getValues("description")?.trim()) {
      void draftDetails({ automatic: true });
    }
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
      setAiFilled(false);
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
              : strings.products.createSubtitle}{" "}
            {strings.products.requiredNote}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {formError && (
            <p
              role="alert"
              className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {formError}
            </p>
          )}

          {/* 1. What's being sold. First because it's the one thing every
              product needs, and because the AI drafts the details from it.
              Both uploads write form values; the row only changes on submit. */}
          <FormSection
            title={strings.products.sectionProduct}
            hint={strings.products.sectionProductHint}
          >
            <ProductFileField
              control={control}
              onUploaded={draftAfterUpload}
              onUploadingChange={setFileUploading}
            />
            <ProductImageField
              control={control}
              productName={name ?? ""}
              seed={previewSlug || String(product?.id ?? "")}
              onUploaded={draftAfterUpload}
              onUploadingChange={setImagesUploading}
            />
          </FormSection>

          {/* 2. How it's presented — the fields the AI can fill. */}
          <FormSection
            title={strings.products.sectionDetails}
            hint={strings.products.sectionDetailsHint}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canDraft || isDrafting}
                onClick={() => void draftDetails()}
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
            }
          >
            {draftError ? (
              <p role="alert" className="-mt-2 text-xs text-destructive">
                {draftError}
              </p>
            ) : aiFilled ? (
              <p className="-mt-2 flex items-center gap-1.5 text-xs text-primary">
                <SparkleIcon className="size-3.5 shrink-0" />
                {strings.products.aiFilled}
              </p>
            ) : (
              <p className="-mt-2 text-xs text-muted-foreground">
                {canDraft
                  ? strings.products.descriptionGenerateHint
                  : strings.validation.productDescriptionSource}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
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
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                  <p className="text-xs text-destructive">
                    {errors.tag.message}
                  </p>
                )}
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              {storeUrl
                ? strings.products.slugPreview.replace("{url}", storeUrl)
                : strings.products.slugPending}
            </p>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                {strings.products.description}
              </label>
              <Textarea
                id="description"
                rows={6}
                placeholder={strings.products.descriptionPlaceholder}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </FormSection>

          {/* 3. Last, because it's usually the last decision. */}
          <FormSection
            title={strings.products.sectionPrice}
            hint={strings.products.sectionPriceHint}
          >
            <div className="flex flex-col gap-2 sm:max-w-56">
              <label htmlFor="price" className="text-sm font-medium">
                {strings.products.price}
              </label>
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
                >
                  $
                </span>
                <Input
                  id="price"
                  inputMode="decimal"
                  className="pl-7"
                  placeholder={strings.products.pricePlaceholder}
                  aria-invalid={!!errors.price}
                  {...register("price")}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            {priceAmount > 0 && (
              <p className="-mt-2 text-xs text-muted-foreground">
                {strings.products.payout
                  .replace("{amount}", formatPrice(sellerPayout(priceAmount)))
                  .replace("{percent}", String(PLATFORM_FEE_PERCENT))}
              </p>
            )}
          </FormSection>
        </CardContent>

        <CardFooter className="justify-between border-t">
          <div className="flex items-center gap-3">
            {/* Held while an upload is in flight: its value isn't in the form
                yet, so submitting would fail on a file the creator can see
                arriving. */}
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isUploading
                ? strings.products.waitingForUpload
                : isSubmitting
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
