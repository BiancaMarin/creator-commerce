"use client"

import * as React from "react"
import type { Route } from "next"
import Link from "next/link"

/**
 * Renders CECE's reply text: paragraphs, "- " and "1. " lists, **bold**, and
 * [links](/path) to pages inside the app. The subset the system prompt allows
 * (lib/server/cece/chat.ts), and nothing more.
 *
 * Hand-rolled rather than a markdown library because the output is model
 * text, which can be steered by whatever a creator typed into a product
 * description. Every node here is built by React from plain strings — there
 * is no HTML path to inject through — and a link is only a link when it's a
 * same-origin path. Anything else renders as its label, unlinked.
 */

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g

/** Same-origin paths only: "/orders", never "//evil.example" or "https://…". */
function isAppPath(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")
}

function renderInline(
  text: string,
  onNavigate: (() => void) | undefined,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let last = 0

  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0

    if (index > last) {
      nodes.push(text.slice(last, index))
    }

    const [, bold, label, href] = match

    if (bold !== undefined) {
      nodes.push(
        <strong key={index} className="font-semibold">
          {bold}
        </strong>,
      )
    } else if (href !== undefined && isAppPath(href)) {
      nodes.push(
        <Link
          key={index}
          // A runtime string, so typed routes can't check it. It came from a
          // tool result (a real product or page path), and a stale one lands
          // on the not-found page rather than anywhere unsafe.
          href={href as Route}
          onClick={onNavigate}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {label}
        </Link>,
      )
    } else {
      nodes.push(label)
    }

    last = index + match[0].length
  }

  if (last < text.length) {
    nodes.push(text.slice(last))
  }

  return nodes
}

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] }

const BULLET = /^\s*[-*•]\s+/
const NUMBERED = /^\s*\d+[.)]\s+/

function toBlocks(text: string): Block[] {
  const blocks: Block[] = []

  for (const line of text.split("\n")) {
    const current = blocks.at(-1)
    const bullet = BULLET.test(line)
    const numbered = NUMBERED.test(line)

    if (bullet || numbered) {
      const item = line.replace(bullet ? BULLET : NUMBERED, "")

      if (current?.kind === "list" && current.ordered === numbered) {
        current.items.push(item)
      } else {
        blocks.push({ kind: "list", ordered: numbered, items: [item] })
      }
    } else if (line.trim() === "") {
      // A blank line ends the block; the next text line starts a new one.
      blocks.push({ kind: "paragraph", lines: [] })
    } else if (current?.kind === "paragraph") {
      current.lines.push(line.trim())
    } else {
      blocks.push({ kind: "paragraph", lines: [line.trim()] })
    }
  }

  return blocks.filter((block) =>
    block.kind === "list" ? block.items.length > 0 : block.lines.length > 0,
  )
}

export function CeceText({
  text,
  onNavigate,
}: {
  text: string
  /** Called when a link is followed — the panel closes itself. */
  onNavigate?: () => void
}) {
  return (
    <div className="flex flex-col gap-2 leading-relaxed">
      {toBlocks(text).map((block, index) => {
        if (block.kind === "paragraph") {
          return (
            <p key={index}>
              {block.lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {renderInline(line, onNavigate)}
                </React.Fragment>
              ))}
            </p>
          )
        }

        const List = block.ordered ? "ol" : "ul"

        return (
          <List
            key={index}
            className={
              block.ordered
                ? "list-decimal space-y-1 pl-5"
                : "list-disc space-y-1 pl-5"
            }
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item, onNavigate)}</li>
            ))}
          </List>
        )
      })}
    </div>
  )
}
