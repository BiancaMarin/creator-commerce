import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { readCartIds } from "@/lib/server/cart";
import { requireUser } from "@/lib/server/dal/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single gate for the whole seller app: every page under (app) is
  // authenticated, so anonymous visitors get redirected to /login here
  // rather than each page repeating the check.
  const user = await requireUser();

  // The same cart the storefront nav counts. Read here rather than per page so
  // the sidebar shows it everywhere in the app — /explore most of all, since
  // that's where products get found in the first place.
  const cartCount = (await readCartIds()).length;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          user={{ name: user.name, email: user.email, image: user.image }}
          cartCount={cartCount}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
