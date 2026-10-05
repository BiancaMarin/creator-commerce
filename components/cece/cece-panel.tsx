"use client"

import * as React from "react"
import type { Route } from "next"
import Link from "next/link"
import { getToolName, isToolUIPart } from "ai"
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CircleNotchIcon,
  NotePencilIcon,
  PaperPlaneRightIcon,
  SparkleIcon,
  StopIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

import { useCece } from "@/components/cece/cece-provider"
import { CeceText } from "@/components/cece/cece-text"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { strings } from "@/constants/strings"
import { CECE_MAX_INPUT_LENGTH } from "@/lib/schemas/cece"
import type { CeceUIMessage } from "@/lib/server/cece/chat"
import { cn } from "@/lib/utils"

type MessagePart = CeceUIMessage["parts"][number]

function CeceMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
        className,
      )}
    >
      <SparkleIcon weight="fill" className="size-3.5" />
    </span>
  )
}

/**
 * One lookup CECE made, as a chip: what it checked, and whether it's still
 * checking. The data itself stays out of the chat — the reply is where it's
 * explained — but seeing "Checked your sales" is what makes the numbers in
 * that reply believable.
 */
function ToolChip({ part }: { part: MessagePart }) {
  if (!isToolUIPart(part)) {
    return null
  }

  const name = getToolName(part)
  const label =
    strings.cece.tools[name as keyof typeof strings.cece.tools] ??
    strings.cece.toolFallback
  const running =
    part.state === "input-streaming" || part.state === "input-available"
  const failed = part.state === "output-error"

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground",
        failed && "bg-destructive/10 text-destructive",
      )}
    >
      {running ? (
        <CircleNotchIcon className="size-3 animate-spin" />
      ) : failed ? (
        <WarningCircleIcon className="size-3" />
      ) : (
        <CheckIcon className="size-3" />
      )}
      {failed ? strings.cece.toolFailed : label}
    </span>
  )
}

function AssistantMessage({
  message,
  onNavigate,
}: {
  message: CeceUIMessage
  onNavigate: () => void
}) {
  return (
    <div className="flex gap-2.5">
      <CeceMark className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return part.text.trim() ? (
              <CeceText key={index} text={part.text} onNavigate={onNavigate} />
            ) : null
          }

          if (!isToolUIPart(part)) {
            return null
          }

          // A help article's links are shown as buttons as well as being
          // available to the reply, so "take me there" is one click even when
          // the model forgets to link the page.
          const links =
            part.type === "tool-get_help" && part.state === "output-available"
              ? part.output.links
              : []

          return (
            <div key={index} className="flex flex-col gap-2">
              <ToolChip part={part} />
              {links.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {links.map((link) => (
                    <Button
                      key={link.href}
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link href={link.href as Route} onClick={onNavigate} />
                      }
                    >
                      {link.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UserMessage({ message }: { message: CeceUIMessage }) {
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")

  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm whitespace-pre-wrap text-primary-foreground">
        {text}
      </p>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-2 py-8 text-center">
      <CeceMark className="size-12 [&_svg]:size-6" />
      <div className="space-y-1">
        <p className="font-heading text-base font-medium">
          {strings.cece.emptyTitle}
        </p>
        <p className="text-sm text-muted-foreground">
          {strings.cece.emptyHint}
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {strings.cece.suggestions.map((question) => (
          <Button
            key={question}
            variant="outline"
            className="h-auto justify-start py-2 text-left whitespace-normal"
            onClick={() => onPick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}

/**
 * The CECE chat sheet. State lives in `CeceProvider`; this only renders it,
 * so closing the sheet (which unmounts it) loses nothing.
 */
export function CecePanel() {
  const {
    open,
    setOpen,
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    reset,
  } = useCece()

  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const busy = status === "submitted" || status === "streaming"
  const last = messages.at(-1)
  // Between sending and the first streamed token there's nothing to show in
  // the assistant's bubble yet, so a placeholder stands in for it.
  const waiting = status === "submitted" && last?.role === "user"

  // Follow the reply as it streams in. Runs on every chunk, which is cheap:
  // it's one property write, and only while the sheet is open.
  React.useEffect(() => {
    const element = scrollRef.current

    if (element) {
      element.scrollTop = element.scrollHeight
    }
  }, [messages, status])

  const send = (text: string) => {
    const question = text.trim()

    if (!question || busy) {
      return
    }

    void sendMessage(question)
    setInput("")
  }

  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        initialFocus={inputRef}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b py-4 pr-24">
          <CeceMark className="size-9 [&_svg]:size-4" />
          <div className="min-w-0 space-y-0.5">
            <SheetTitle>{strings.cece.title}</SheetTitle>
            <SheetDescription className="text-xs">
              {strings.cece.description}
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Beside the sheet's own close button, which is absolutely placed at
            top-4 right-4 by the primitive. */}
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 right-14"
            onClick={() => {
              reset()
              inputRef.current?.focus()
            }}
          >
            <NotePencilIcon />
            <span className="sr-only">{strings.cece.newChat}</span>
          </Button>
        )}

        <div
          ref={scrollRef}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
          // Announces each reply to screen readers as it completes, without
          // reading every streamed token.
          aria-live="polite"
          aria-busy={busy}
        >
          {messages.length === 0 ? (
            <EmptyState onPick={send} />
          ) : (
            messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage
                  key={message.id}
                  message={message}
                  onNavigate={close}
                />
              ),
            )
          )}

          {waiting && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <CeceMark />
              <span className="animate-pulse">{strings.cece.thinking}</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-start gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span className="flex items-center gap-1.5">
                <WarningCircleIcon className="size-4" />
                {strings.cece.error}
              </span>
              <Button variant="outline" size="sm" onClick={() => regenerate()}>
                <ArrowClockwiseIcon />
                {strings.cece.retry}
              </Button>
            </div>
          )}
        </div>

        <form
          className="flex flex-col gap-2 border-t p-4"
          onSubmit={(event) => {
            event.preventDefault()
            send(input)
          }}
        >
          <div className="flex items-end gap-2">
            <label htmlFor="cece-input" className="sr-only">
              {strings.cece.inputLabel}
            </label>
            <Textarea
              id="cece-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={CECE_MAX_INPUT_LENGTH}
              placeholder={strings.cece.inputPlaceholder}
              className="max-h-40 min-h-10 py-2.5"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                // Enter sends; Shift+Enter is a new line. `isComposing` keeps
                // an IME's confirming Enter (Japanese, Chinese…) from sending
                // half-typed text.
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault()
                  send(input)
                }
              }}
            />
            {busy ? (
              <Button
                type="button"
                size="icon-lg"
                variant="secondary"
                onClick={() => void stop()}
              >
                <StopIcon weight="fill" />
                <span className="sr-only">{strings.cece.stop}</span>
              </Button>
            ) : (
              <Button type="submit" size="icon-lg" disabled={!input.trim()}>
                <PaperPlaneRightIcon weight="fill" />
                <span className="sr-only">{strings.cece.send}</span>
              </Button>
            )}
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            {strings.cece.disclaimer}
          </p>
        </form>
      </SheetContent>
    </Sheet>
  )
}
