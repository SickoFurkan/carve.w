import Link from "next/link"
import { HealthCard } from "@/components/dashboard/shared"

interface Habit {
  id: string
  name: string
  completed: boolean
}

interface DailyRoutineCardProps {
  habits: Habit[]
}

export function DailyRoutineCard({ habits }: DailyRoutineCardProps) {
  return (
    <HealthCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔄</span>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Daily Routine
          </h3>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {habits.length === 0 ? (
        <Link
          href="#"
          className="flex items-center justify-between py-3 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 group-hover:text-white transition-colors">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-sm">Browse habits</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center gap-3 py-2">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  habit.completed
                    ? "border-emerald-400 bg-emerald-400/20"
                    : "border-slate-600"
                }`}
              >
                {habit.completed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${habit.completed ? "text-slate-500 line-through" : "text-white"}`}>
                {habit.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </HealthCard>
  )
}
