"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SignOutIcon } from "@phosphor-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { strings } from "@/constants/strings";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

export interface NavUserProps {
  name: string;
  email: string;
  image?: string | null;
}

export function NavUser({ name, email, image }: NavUserProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const displayName = name || strings.account.fallbackName;

  async function onSignOut() {
    setError(null);
    setIsSigningOut(true);

    const { error: signOutError } = await authClient.signOut();

    // Navigating regardless of the result is what makes a failed sign-out look
    // like a dead button: /login's layout still sees the live session and
    // bounces straight back to the dashboard, so the click appears to do
    // nothing. Better Auth rejects sign-out with 403 INVALID_ORIGIN when the
    // request's Origin doesn't match BETTER_AUTH_URL — serving the app on a
    // different port than that env var names is enough to trigger it.
    if (signOutError) {
      setError(strings.account.signOutError);
      setIsSigningOut(false);
      return;
    }

    // refresh() clears the cached RSC payload so the layout's session check
    // re-runs; without it the signed-in shell can flash on back-navigation.
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <SidebarMenuButton
        size="lg"
        onClick={onSignOut}
        disabled={isSigningOut}
        tooltip={strings.account.signOut}
      >
        <Avatar className="size-8 rounded-lg">
          {image && <AvatarImage src={image} alt={displayName} />}
          <AvatarFallback className="rounded-lg">
            {getInitials(displayName) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{displayName}</span>
          <span className="truncate text-xs text-sidebar-foreground/70">
            {isSigningOut ? strings.account.signingOut : email}
          </span>
        </div>
        <SignOutIcon className="ml-auto" />
      </SidebarMenuButton>
      {error && (
        // Hidden when the sidebar collapses to icons, like SidebarMenuBadge —
        // there's no width for it there.
        <p
          role="alert"
          className="px-3 pt-1.5 text-xs text-destructive group-data-[collapsible=icon]:hidden"
        >
          {error}
        </p>
      )}
    </>
  );
}
