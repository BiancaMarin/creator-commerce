export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Just the page shell — the nav/footer are added per route by
  // <StoreChrome>, which needs the `[handle]` param this layout can't see.
  return <div className="flex min-h-svh flex-col">{children}</div>
}
