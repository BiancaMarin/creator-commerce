import type { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircleIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { creator, getProduct } from "@/lib/store-data"

export const metadata: Metadata = {
  title: "Payment successful — Creator Commerce",
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; s?: string }>
}) {
  const { p, s } = await searchParams
  const product = p ? getProduct(p) : undefined
  const backHref = `/${s ?? creator.slug}`

  return (
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
                <b className="text-foreground">{product.name}</b> is ready and a
                receipt is on its way.
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
            Back to shop
          </Button>
        </div>
      </Card>
    </div>
  )
}
