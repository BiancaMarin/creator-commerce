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

  const displayName = name || strings.account.fallbackName;

  async function onSignOut() {
    setIsSigningOut(true);

    await authClient.signOut();

    // refresh() clears the cached RSC payload so the layout's session check
    // re-runs; without it the signed-in shell can flash on back-navigation.
    router.push("/login");
    router.refresh();
  }

  return (
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
  );
}
