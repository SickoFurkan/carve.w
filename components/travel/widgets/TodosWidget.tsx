"use client"

import { useState, useCallback } from "react"
import { TravelCard } from "@/components/travel/shared"
import { createClient } from "@/lib/supabase/client"

interface Todo {
  id: string
  title: string
  completed: boolean
  order_index: number
}

interface TodosWidgetProps {
  tripId: string
  initialTodos: Todo[]
}

export function TodosWidget({ tripId, initialTodos }: TodosWidgetProps) {
  const [todos, setTodos] = useState(initialTodos)
  const [newTitle, setNewTitle] = useState("")
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  const toggleTodo = useCallback(async (id: string, completed: boolean) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)))
    await supabase.from("trip_todos").update({ completed }).eq("id", id)
  }, [supabase])

  const addTodo = useCallback(async () => {
    const title = newTitle.trim()
    if (!title) return
    setAdding(true)
    const { data } = await supabase
      .from("trip_todos")
      .insert({ trip_id: tripId, title, order_index: todos.length })
      .select("id, title, completed, order_index")
      .single()
    if (data) {
      setTodos((prev) => [...prev, data])
      setNewTitle("")
    }
    setAdding(false)
  }, [newTitle, tripId, todos.length, supabase])

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <TravelCard>
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {todos.length > 0 && (
          <span className="text-xs text-[#555d70]">
            {completedCount}/{todos.length}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-white">Top To-Dos</h3>
      <p className="text-xs text-[#555d70] mt-0.5">Priority tasks</p>

      <div className="mt-4 space-y-2">
        {todos.slice(0, 5).map((todo) => (
          <label
            key={todo.id}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <button
              onClick={() => toggleTodo(todo.id, !todo.completed)}
              className={`w-4.5 h-4.5 rounded shrink-0 border transition-colors flex items-center justify-center ${
                todo.completed
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              {todo.completed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`text-sm transition-colors ${
              todo.completed ? "text-[#555d70] line-through" : "text-[#9da6b9]"
            }`}>
              {todo.title}
            </span>
          </label>
        ))}

        {todos.length === 0 && (
          <p className="text-xs text-[#555d70]">No tasks yet</p>
        )}
      </div>

      {/* Quick add */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          className="flex-1 text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-white placeholder-[#555d70] focus:outline-none focus:border-white/[0.12]"
          disabled={adding}
        />
        <button
          onClick={addTodo}
          disabled={adding || !newTitle.trim()}
          className="px-2 py-1.5 text-xs font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors disabled:opacity-40"
        >
          +
        </button>
      </div>
    </TravelCard>
  )
}
