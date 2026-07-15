import Link from "next/link"

import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={cn("size-[17px]", className)}
    >
      <path
        d="M35 15 A13 13 0 1 0 35 33"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M31 21 A6.5 6.5 0 1 0 31 27"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-base font-semibold"
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LogoMark />
      </span>
      Creator Commerce
    </Link>
  )
}
