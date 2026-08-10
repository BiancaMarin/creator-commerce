"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Route } from "next"
import { CheckIcon, ShoppingBagIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { strings } from "@/constants/strings"
import { addToCart } from "@/lib/actions/cart"

/**
 * `inCart` is resolved on the server from the cart cookie, so the button knows
 * its state on first paint rather than flashing "Add to cart" for a product
 * that's already there. It stays a prop rather than local state after the add
 * because `router.refresh()` re-renders the page that computed it — one source
 * of truth, which also keeps the nav badge in step.
 */
export function AddToCartButton({
  productId,
  inCart,
}: {
  productId: number
  inCart: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  function add() {
    setError(null)

    startTransition(async () => {
      const result = await addToCart(productId)

      if (!result.ok) {
        // `addToCart` never asks for a session — sign-in is a checkout-time
        // requirement — so this branch is unreachable today. It stays because
        // the result type is shared with `checkoutCart`, and silently ignoring
        // an auth failure would be the wrong way to handle it if that changes.
        if (result.signInHref) {
          router.push(result.signInHref as Route)

          return
        }

        setError(result.error)

        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        size="lg"
        variant="outline"
        disabled={pending || inCart}
        onClick={add}
      >
        {inCart ? <CheckIcon /> : <ShoppingBagIcon />}
        {inCart
          ? strings.cart.inCart
          : pending
            ? strings.cart.adding
            : strings.cart.addToCart}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
