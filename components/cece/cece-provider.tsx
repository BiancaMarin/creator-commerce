"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useChat, type UseChatHelpers } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

import { CECE_MAX_HISTORY } from "@/lib/schemas/cece"
// Type only: the module is server-only, and a value import would pull it (and
// the database client behind it) into the browser bundle.
import type { CeceUIMessage } from "@/lib/server/cece/chat"

type CeceContextValue = Omit<
  UseChatHelpers<CeceUIMessage>,
  "sendMessage" | "regenerate"
> & {
  /** Sends a question, tagged with the current page. */
  sendMessage: (text: string) => Promise<void>
  /** Retries the last reply, tagged with the current page. */
  regenerate: () => Promise<void>
  open: boolean
  setOpen: (open: boolean) => void
  /** Clears the conversation and starts over. */
  reset: () => void
}

/**
 * Module scope: the transport holds no per-user state, so one instance serves
 * every mount. Identity is the session cookie, sent by the browser.
 */
const transport = new DefaultChatTransport<CeceUIMessage>({
  api: "/api/cece",
  // Only the recent turns: the server would drop the rest anyway, and
  // resending a long conversation on every message is wasted upload.
  // `body` is what the call site passed — the pathname.
  prepareSendMessagesRequest: ({ messages, body }) => ({
    body: { ...body, messages: messages.slice(-CECE_MAX_HISTORY) },
  }),
})

const CeceContext = React.createContext<CeceContextValue | null>(null)

export function useCece() {
  const context = React.useContext(CeceContext)

  if (!context) {
    throw new Error("useCece must be used within a CeceProvider.")
  }

  return context
}

/**
 * Holds CECE's conversation for the whole seller app.
 *
 * Lives in (app)/layout.tsx rather than inside the panel or the sidebar,
 * because both of those unmount: the sheet's popup when it closes, and the
 * entire sidebar on mobile, where it is itself a sheet. The layout persists
 * across navigations, so a question asked on /products is still there after
 * following CECE's link to /orders. A reload starts over — conversations
 * aren't stored.
 *
 * The panel itself (`CecePanel`) is rendered by the layout, inside this.
 */
export function CeceProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const chat = useChat<CeceUIMessage>({ transport })

  // Every request carries the page the user is on *when they send*, which is
  // why it's passed per call rather than baked into the transport.
  const sendMessage = (text: string) =>
    chat.sendMessage({ text }, { body: { pathname } })
  const regenerate = () => chat.regenerate({ body: { pathname } })

  const reset = () => {
    void chat.stop()
    chat.setMessages([])
    chat.clearError()
  }

  return (
    <CeceContext.Provider
      value={{ ...chat, sendMessage, regenerate, open, setOpen, reset }}
    >
      {children}
    </CeceContext.Provider>
  )
}
