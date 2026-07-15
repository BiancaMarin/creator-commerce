import type { Metadata } from "next"
import {
  DotsThreeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata: Metadata = {
  title: "Products · Creator Commerce",
  description: "Manage your catalog of digital products.",
}

const products = [
  {
    name: "Studio Preset Pack",
    type: "Lightroom presets",
    price: "$48.00",
    sales: 412,
    status: "Published" as const,
  },
  {
    name: "Lightroom Masterclass",
    type: "Video course",
    price: "$129.00",
    sales: 286,
    status: "Published" as const,
  },
  {
    name: "Brand Kit Templates",
    type: "Design templates",
    price: "$64.00",
    sales: 173,
    status: "Published" as const,
  },
  {
    name: "1:1 Coaching Call",
    type: "Service",
    price: "$220.00",
    sales: 64,
    status: "Published" as const,
  },
  {
    name: "Motion Graphics Bundle",
    type: "After Effects",
    price: "$89.00",
    sales: 0,
    status: "Draft" as const,
  },
]

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your catalog of digital products.
          </p>
        </div>
        <Button size="sm">
          <PlusIcon />
          New product
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-[280px] flex-1">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products" className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <FunnelIcon />
          Status
        </Button>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Product
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">
                Price
              </TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">
                Sales
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-5 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <PackageIcon className="size-4" />
                    </span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {product.type}
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono">
                  {product.price}
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono text-muted-foreground">
                  {product.sales}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Badge
                    variant={product.status === "Published" ? "success" : "outline"}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-right">
                  <Button variant="ghost" size="icon-sm" aria-label="More actions">
                    <DotsThreeIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
