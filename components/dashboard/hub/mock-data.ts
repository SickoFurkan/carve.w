import { Brain, Flame, Dumbbell, Trophy, TrendingUp, Wallet, BarChart3, Footprints } from 'lucide-react'
import type { ElementType } from 'react'

// Centralized icon map — all components import from here
export const iconMap: Record<string, ElementType> = {
  Brain, Flame, Dumbbell, Trophy, TrendingUp, Wallet, BarChart3, Footprints,
}

export interface ChatMessage {
  id: string
  role: 'coach' | 'user'
  content: string
  timestamp: Date
}

export interface UserRankData {
  rankName: string
  currentXp: number
  nextLevelXp: number
  level: number
  streak: number
}

export interface TodayStat {
  icon: string
  label: string
  value: string
  detail?: string
}

export interface MoneySnapshot {
  monthlyBudget: number
  spent: number
  currency: string
  recentExpenses: { label: string; amount: number }[]
}

export interface Challenge {
  id: string
  label: string
  type: 'daily' | 'weekly'
  current: number
  target: number
}

export interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  isYou?: boolean
}

export interface SuggestionChip {
  id: string
  icon: string
  label: string
}

// --- Mock Data ---

export const mockRankData: UserRankData = {
  rankName: 'Intermediate',
  currentXp: 2450,
  nextLevelXp: 5000,
  level: 7,
  streak: 12,
}

export const mockTodayStats: TodayStat[] = [
  { icon: 'Dumbbell', label: 'Workouts', value: '3', detail: 'this week' },
  { icon: 'Footprints', label: 'Steps', value: '8,241', detail: 'today' },
  { icon: 'Flame', label: 'Calories', value: '1,840', detail: '/ 2,200' },
]

export const mockMoneySnapshot: MoneySnapshot = {
  monthlyBudget: 2000,
  spent: 1240,
  currency: '€',
  recentExpenses: [
    { label: 'Groceries', amount: 67.40 },
    { label: 'Spotify', amount: 10.99 },
  ],
}

export const mockChallenges: Challenge[] = [
  { id: '1', label: 'Log 3 meals', type: 'daily', current: 2, target: 3 },
  { id: '2', label: '4 workouts', type: 'weekly', current: 3, target: 4 },
  { id: '3', label: 'Hit step goal', type: 'daily', current: 8241, target: 10000 },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex', xp: 12400 },
  { rank: 2, name: 'You', xp: 2450, isYou: true },
  { rank: 3, name: 'Sarah', xp: 2100 },
  { rank: 4, name: 'Mike', xp: 1800 },
]

export const mockSuggestionChips: SuggestionChip[] = [
  { id: '1', icon: 'TrendingUp', label: "What's my progress?" },
  { id: '2', icon: 'Dumbbell', label: 'Plan my workout' },
  { id: '3', icon: 'Wallet', label: "How's my budget?" },
  { id: '4', icon: 'BarChart3', label: 'Analyze my week' },
]

export const mockChatMessages: ChatMessage[] = []

export const mockStatusPills = [
  { icon: 'Flame', label: '12-day streak' },
  { icon: 'Dumbbell', label: '47 workouts' },
  { icon: 'Trophy', label: 'Level 7' },
]
