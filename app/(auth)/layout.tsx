import { redirect } from "next/navigation"

import { getSession } from "@/lib/server/dal/session"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Already signed in? The login/signup forms have nothing to offer.
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center p-4">
      {children}
    </main>
  )
}
