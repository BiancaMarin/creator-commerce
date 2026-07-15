export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center p-4">
      {children}
    </main>
  )
}
