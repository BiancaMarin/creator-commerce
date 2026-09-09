"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  StorefrontIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

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
import { strings } from "@/constants/strings";
import { authClient } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/schemas/auth";

/**
 * Sets a new password from a one-time link.
 *
 * The reader never arrives here directly: the emailed URL points at Better
 * Auth's own callback, which validates the token first and only then redirects
 * here with `?token=…`. A spent or expired link arrives as `?error=…` instead,
 * which is why a missing token renders as an expired link rather than a broken
 * page — those are the only two ways to arrive without one.
 *
 * The token is passed back on submit and checked again server-side. What the
 * URL carries is a claim, not an authorization.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    setFormError(null);

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      // The token can expire between this page loading and the submit, so a
      // failure here is most often the same "ask for a new link" case the
      // no-token branch renders.
      setFormError(strings.resetPassword.invalid);
      return;
    }

    setDone(true);
    // Every session was revoked by the reset (revokeSessionsOnPasswordReset),
    // so there is nothing to carry forward — the reader signs in fresh.
    router.refresh();
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <StorefrontIcon className="size-5" />
        </span>
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {strings.resetPassword.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {strings.resetPassword.subtitle}
          </p>
        </div>
      </div>

      <Card>
        {done ? (
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircleIcon className="size-5" />
            </span>
            <CardTitle>{strings.resetPassword.doneTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {strings.resetPassword.done}
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              className="mt-2"
            >
              {strings.resetPassword.doneCta}
            </Button>
          </CardContent>
        ) : !token ? (
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <WarningCircleIcon className="size-5" />
            </span>
            <CardTitle>{strings.resetPassword.invalidTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {strings.resetPassword.invalid}
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/forgot-password" />}
              variant="outline"
              className="mt-2"
            >
              {strings.resetPassword.invalidCta}
            </Button>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{strings.resetPassword.title}</CardTitle>
              <CardDescription>{strings.resetPassword.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4"
                noValidate
              >
                {formError && (
                  <p
                    role="alert"
                    className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    {formError}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {strings.resetPassword.password}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={strings.resetPassword.passwordPlaceholder}
                      className="pr-10"
                      aria-invalid={!!errors.password}
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    {strings.resetPassword.confirmPassword}
                  </label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={strings.resetPassword.passwordPlaceholder}
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? strings.resetPassword.submitting
                    : strings.resetPassword.submit}
                </Button>
              </form>
            </CardContent>
          </>
        )}
        <CardFooter className="justify-center border-t text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            {strings.forgotPassword.footerLink}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
