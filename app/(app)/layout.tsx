import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
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

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          user={{ name: user.name, email: user.email, image: user.image }}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
