"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowSquareOutIcon, CheckCircleIcon } from "@phosphor-icons/react";

import { updateHandle } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { strings } from "@/constants/strings";
import { handleSchema, type HandleValues } from "@/lib/handle-schema";

export function HandleForm({ handle }: { handle: string }) {
  const router = useRouter();
  const [saved, setSaved] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<HandleValues>({
    resolver: zodResolver(handleSchema),
    defaultValues: { handle },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaved(null);

    const result = await updateHandle(values);

    if (!result.ok) {
      setError("handle", { message: result.error });
      return;
    }

    // Re-seed the form with the normalised handle the server actually stored,
    // so the field shows "test" after the user typed " Test ".
    reset({ handle: result.handle });
    setSaved(result.handle);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
      <label htmlFor="handle" className="text-sm text-muted-foreground">
        {strings.dashboard.accountPanel.handle}
      </label>
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">/</span>
            <Input
              id="handle"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={strings.dashboard.accountPanel.handlePlaceholder}
              aria-invalid={!!errors.handle}
              {...register("handle")}
            />
          </div>
          {errors.handle && (
            <p className="text-xs text-destructive">{errors.handle.message}</p>
          )}
          {saved && !errors.handle && (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircleIcon className="size-3.5" />
              {strings.dashboard.accountPanel.handleSaved}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? strings.dashboard.accountPanel.handleSaving
            : strings.dashboard.accountPanel.handleSave}
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        nativeButton={false}
        render={<Link href={`/${saved ?? handle}`} />}
      >
        {strings.dashboard.accountPanel.viewStore}
        <ArrowSquareOutIcon />
      </Button>
    </form>
  );
}
