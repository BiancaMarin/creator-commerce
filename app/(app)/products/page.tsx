import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PackageIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr"

import { DeleteProductDialog } from "@/components/dashboard/delete-product-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { strings } from "@/constants/strings"
import { listProductsForUser } from "@/lib/server/dal/products"
import { requireUser } from "@/lib/server/dal/session"
import { formatPrice } from "@/lib/store-data"

export const metadata: Metadata = {
  title: "Products · Creator Commerce",
  description: "Manage your catalog of digital products.",
}

export default async function ProductsPage() {
  const user = await requireUser()
  const products = await listProductsForUser(user.id)

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {strings.products.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {strings.products.subtitle}
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/products/new" />}
        >
          <PlusIcon />
          {strings.products.newProduct}
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="flex flex-1 items-center justify-center">
          <div className="flex max-w-xs flex-col items-center gap-3 py-10 text-center text-muted-foreground">
            <span className="flex size-14 items-center justify-center rounded-4xl bg-muted">
              <PackageIcon className="size-6" />
            </span>
            <p className="text-sm">{strings.products.empty}</p>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/products/new" />}
            >
              <PlusIcon />
              {strings.products.newProduct}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  {strings.products.columnProduct}
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  {strings.products.columnType}
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  {strings.products.columnUrl}
                </TableHead>
                <TableHead className="px-5 text-right text-xs text-muted-foreground">
                  {strings.products.columnPrice}
                </TableHead>
                <TableHead className="px-5 text-right">
                  <span className="sr-only">{strings.products.edit}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      {product.imageUrls[0] ? (
                        // alt="" on purpose — the product name sits right
                        // beside it, so announcing the cover twice is noise.
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-2xl bg-muted">
                          <Image
                            src={product.imageUrls[0]}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <span className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <PackageIcon className="size-4" />
                        </span>
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-muted-foreground">
                    {product.tag}
                  </TableCell>
                  <TableCell className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    /{user.handle}/{product.id}/{product.slug}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-right font-mono">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              nativeButton={false}
                              render={<Link href={`/products/${product.id}`} />}
                            >
                              {strings.products.edit}
                            </Button>
                          }
                        />
                        <TooltipContent>
                          {strings.products.editTooltip}
                        </TooltipContent>
                      </Tooltip>
                      <DeleteProductDialog
                        id={product.id}
                        name={product.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
