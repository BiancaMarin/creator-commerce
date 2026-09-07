"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { clearPurchasedFromCart } from "@/lib/actions/cart"

/**
 * Drops the just-bought products out of the cart cookie, once, when the receipt
 * renders.
 *
 * A component rather than something the page does itself, because only a Server
 * Action can write a cookie — a page render can't (lib/server/cart.ts) — and
 * the webhook that actually confirms the payment has no access to the buyer's
 * cookies at all. This is the first point where both facts are available: the
 * payment is confirmed, and we're in the buyer's browser.
 *
 * Renders nothing. The visible effect is the nav's cart badge catching up after
 * `router.refresh()`.
 */
export function ClearPurchasedCart() {
  const router = useRouter()
  // React 19 runs effects twice in development's Strict Mode. The action is
  // idempotent — it removes only what's already paid for — but the guard keeps
  // it to one round trip rather than two.
  const done = React.useRef(false)

  React.useEffect(() => {
    if (done.current) {
      return
    }

    done.current = true

    clearPurchasedFromCart()
      .then((result) => {
        // The action revalidates /cart server side; this refresh is what makes
        // the nav's cart badge on *this* page catch up.
        if (result.ok) {
          router.refresh()
        }
      })
      .catch(() => {
        // A stale cart entry is a cosmetic problem on a page whose job is to
        // confirm a payment that already succeeded. Nothing to tell the buyer.
      })
  }, [router])

  return null
}
