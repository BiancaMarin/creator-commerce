import type { Metadata, Route } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  CheckCircleIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StoreChrome } from "@/components/store/store-chrome"
import { strings } from "@/constants/strings"
import { getCreatorByHandle } from "@/lib/server/dal/creators"
import { getProductByHandleAndId } from "@/lib/server/dal/products"
import { getSession } from "@/lib/server/dal/session"

export const metadata: Metadata = {
  title: "Payment successful — Creator Commerce",
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; s?: string }>
}) {
  const { p, s } = await searchParams

  // The rest of the checkout is gated in the Server Actions, but this page is
  // reached by navigation and nothing here would have stopped a signed-out
  // visitor typing the URL and being told their download is ready. It's the
  // buyer's receipt, so it's theirs to see — read the session rather than
  // relying on how they got here.
  //
  // `getSession` + an explicit redirect, not `requireSession`: that one lands on
  // a bare /login and drops the receipt they were trying to reach.
  if (!(await getSession())) {
    const query = new URLSearchParams()

    if (p) query.set("p", p)
    if (s) query.set("s", s)

    const search = query.toString()

    redirect(
      `/login?next=${encodeURIComponent(
        `/checkout/success${search ? `?${search}` : ""}`,
      )}` as Route,
    )
  }

  // `s` is the store the buyer came from. Unknown or missing means we can't
  // name a creator, so the chrome falls back to platform branding.
  const creator = s ? await getCreatorByHandle(s) : null
  const productId = Number(p)
  // The product is only named if it really belongs to that store — `p` and `s`
  // are user-supplied query params, not trusted state.
  const product =
    creator && Number.isInteger(productId)
      ? await getProductByHandleAndId(creator.handle, productId)
      : null
  // Inlined at the `href` rather than hoisted to a `const`: typed routes need
  // the template-literal type, and a hoisted ternary widens it to `string`.
  const backHref = creator ? (`/${creator.handle}` as const) : ("/" as const)

  return (
    <StoreChrome creator={creator}>
      <div className="flex min-h-[70vh] items-center justify-center p-8">
        <Card className="max-w-[400px] p-0 text-center">
          <div className="flex flex-col items-center gap-3.5 px-7 py-8">
            <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircleIcon className="size-[30px]" />
            </span>
            <h1 className="font-heading text-xl font-semibold">
              Payment successful
            </h1>
            <p className="text-sm text-muted-foreground">
              {product ? (
                <>
                  Your download for{" "}
                  <b className="text-foreground">{product.name}</b> is ready and
                  a receipt is on its way.
                </>
              ) : (
                <>Your download is ready and a receipt is on its way.</>
              )}
            </p>
            <Button className="w-full">
              <DownloadSimpleIcon />
              Download files
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={backHref} />}
            >
              {strings.store.backToShop}
            </Button>
          </div>
        </Card>
      </div>
    </StoreChrome>
  )
}
