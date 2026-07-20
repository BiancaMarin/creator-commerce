import type { Metadata } from "next"
import { ExportIcon, FileArrowDownIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
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

export const metadata: Metadata = {
  title: "Downloads · Creator Commerce",
  description: "Delivered files and download activity across your products.",
}

const downloads = [
  {
    file: "studio-preset-pack.zip",
    product: "Studio Preset Pack",
    size: "248 MB",
    count: 412,
    status: "delivered" as const,
  },
  {
    file: "lightroom-masterclass.mp4",
    product: "Lightroom Masterclass",
    size: "1.8 GB",
    count: 286,
    status: "delivered" as const,
  },
  {
    file: "brand-kit-templates.zip",
    product: "Brand Kit Templates",
    size: "96 MB",
    count: 173,
    status: "delivered" as const,
  },
  {
    file: "coaching-worksheet.pdf",
    product: "1:1 Coaching Call",
    size: "2.4 MB",
    count: 64,
    status: "processing" as const,
  },
  {
    file: "preset-pack-v2.zip",
    product: "Studio Preset Pack",
    size: "311 MB",
    count: 0,
    status: "expired" as const,
  },
]

const badgeFor: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  delivered: "success",
  processing: "warning",
  expired: "neutral",
}

export default function DownloadsPage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Downloads
          </h1>
          <p className="text-sm text-muted-foreground">
            Delivered files and download activity across your products.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <ExportIcon />
          Export
        </Button>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 text-xs text-muted-foreground">
                File
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Product
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">
                Size
              </TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">
                Downloads
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {downloads.map((item) => (
              <TableRow key={item.file}>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <FileArrowDownIcon className="size-4" />
                    </span>
                    <span className="font-mono text-xs font-medium">
                      {item.file}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {item.product}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant={badgeFor[item.status]} className="capitalize">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono text-muted-foreground">
                  {item.size}
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono font-medium tabular-nums">
                  {item.count.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
