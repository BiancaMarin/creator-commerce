"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    // TODO: wire up authentication with `values`.
    console.log(values);
  });

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <StorefrontIcon className="size-5" />
          </span>
          <div className="space-y-1">
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {strings.login.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {strings.login.subtitle}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{strings.login.signIn}</CardTitle>
            <CardDescription>{strings.login.paragraph}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {strings.login.email}
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    {strings.login.password}
                  </label>
                  <Link
                    href="/login"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    {strings.login.password}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="flex items-center gap-3 py-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {strings.login.continueWith}
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline">
                <GoogleLogoIcon />
                {strings.login.google}
              </Button>
              <Button variant="outline">
                <GithubLogoIcon />
                {strings.login.github}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/login"
              className="ml-1 font-medium text-foreground hover:underline"
            >
              {strings.signup}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
