"use client"

import { useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import type { TripPlan } from "@/lib/ai/travel-schemas"

interface TravelChatProps {
  tripId?: string
  onPlanGenerated?: (plan: TripPlan) => void
  onTripCreated?: (tripId: string) => void
}

export function TravelChat({ tripId: initialTripId, onPlanGenerated, onTripCreated }: TravelChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [tripId, setTripId] = useState(initialTripId)

  // Create a draft trip if none provided
  useEffect(() => {
    if (tripId) return
    fetch("/api/travel/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setTripId(data.id)
          onTripCreated?.(data.id)
        }
      })
      .catch(console.error)
  }, [tripId, onTripCreated])

  const { messages, append, isLoading } = useChat({
    api: "/api/travel/chat",
    body: { tripId },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Where would you like to go? Tell me about your dream trip — destination, how many days, and your budget.",
      },
    ],
    onToolCall({ toolCall }) {
      if (toolCall.toolName === "generate_trip_plan" && onPlanGenerated) {
        onPlanGenerated(toolCall.args as unknown as TripPlan)
      }
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (content: string) => {
    append({ role: "user", content })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white">Trip Planner</h2>
        <p className="text-xs text-[#555d70]">AI-powered travel planning</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={message.content}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading || !tripId} />
    </div>
  )
}
