"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SignOutIcon } from "@phosphor-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useStrings } from "@/components/i18n/i18n-provider";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

export interface NavUserProps {
  name: string;
  email: string;
  image?: string | null;
}

export function NavUser({ name, email, image }: NavUserProps) {
  const strings = useStrings();
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

  // The identity row is display-only; signing out has its own labelled
  // button below it. A whole profile row that silently signs you out on click
  // gave no hint that's what it does.
  return (
    <>
      <SidebarMenuItem>
        <div className="flex h-14 items-center gap-2 overflow-hidden rounded-xl px-3 text-sm group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!">
          <Avatar className="size-8 shrink-0 rounded-lg">
            {image && <AvatarImage src={image} alt={displayName} />}
            <AvatarFallback className="rounded-lg bg-brand-gradient text-white">
              {getInitials(displayName) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {email}
            </span>
          </div>
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          onClick={onSignOut}
          disabled={isSigningOut}
          tooltip={strings.account.signOut}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <SignOutIcon />
          <span>
            {isSigningOut ? strings.account.signingOut : strings.account.signOut}
          </span>
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
      </SidebarMenuItem>
    </>
  );
}
