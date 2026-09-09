"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EnvelopeSimpleIcon, StorefrontIcon } from "@phosphor-icons/react";

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
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/schemas/auth";

/**
 * Asks Better Auth to email a reset link.
 *
 * **The outcome is the same whether or not the address has an account**, and
 * that is the security property of this page, not a shortcut. Reporting "no
 * such account" would turn the form into an oracle for testing which addresses
 * are registered. Better Auth answers identically for both cases too — it even
 * does the dummy token work to keep the timing alike — so there is nothing here
 * to branch on.
 */
export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    // `redirectTo` is where Better Auth's callback sends the reader *after* it
    // has checked the token, with `?token=…` appended — or `?error=…` if the
    // link is spent. The reset page reads both.
    await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });

    // Deliberately not checking for an error. A failure here would most often
    // mean "no such user", which is exactly what must not be surfaced.
    setSent(true);
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <StorefrontIcon className="size-5" />
        </span>
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {strings.forgotPassword.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {strings.forgotPassword.subtitle}
          </p>
        </div>
      </div>

      <Card>
        {sent ? (
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <EnvelopeSimpleIcon className="size-5" />
            </span>
            <CardTitle>{strings.forgotPassword.sentTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {strings.forgotPassword.sent}
            </p>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{strings.forgotPassword.title}</CardTitle>
              <CardDescription>
                {strings.forgotPassword.paragraph}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4"
                noValidate
              >
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {strings.forgotPassword.email}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={strings.forgotPassword.emailPlaceholder}
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? strings.forgotPassword.submitting
                    : strings.forgotPassword.submit}
                </Button>
              </form>
            </CardContent>
          </>
        )}
        <CardFooter className="justify-center border-t text-sm text-muted-foreground">
          {strings.forgotPassword.footerPrompt}
          <Link
            href="/login"
            className="ml-1 font-medium text-foreground hover:underline"
          >
            {strings.forgotPassword.footerLink}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
