"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  EyeIcon,
  EyeSlashIcon,
  GithubLogoIcon,
  GoogleLogoIcon,
  StorefrontIcon,
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
import { Separator } from "@/components/ui/separator";
import { strings } from "@/constants/strings";
import { authClient } from "@/lib/auth-client";
import { signupSchema, type SignupValues } from "@/lib/schemas/auth";
import { safeNextPath } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  // Forwarded from /login when a buyer was sent to sign in from their cart.
  const next = safeNextPath(useSearchParams().get("next"));
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    // `handle` is derived server-side in lib/server/auth.ts, not collected here.
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(
        error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
          ? strings.errors.emailTaken
          : strings.errors.generic,
      );
      return;
    }

    // A runtime string, so typed routes can't check it — safeNextPath is what
    // stands in for that guarantee.
    router.push(next as Route);
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
            {strings.signup.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {strings.signup.subtitle}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{strings.signup.signUp}</CardTitle>
          <CardDescription>{strings.signup.paragraph}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
                {strings.signup.name}
              </label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder={strings.signup.namePlaceholder}
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
              <label htmlFor="email" className="text-sm font-medium">
                {strings.signup.email}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={strings.signup.emailPlaceholder}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                {strings.signup.password}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={strings.signup.passwordPlaceholder}
                  className="pr-10"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? strings.signup.submitting : strings.signup.submit}
            </Button>
          </form>

          <div className="flex items-center gap-3 py-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {strings.signup.continueWith}
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" disabled title={strings.account.socialComingSoon}>
              <GoogleLogoIcon />
              {strings.signup.google}
            </Button>
            <Button variant="outline" disabled title={strings.account.socialComingSoon}>
              <GithubLogoIcon />
              {strings.signup.github}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t text-sm text-muted-foreground">
          {strings.signup.footerPrompt}{" "}
          <Link
            href="/login"
            className="ml-1 font-medium text-foreground hover:underline"
          >
            {strings.signup.footerLink}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
