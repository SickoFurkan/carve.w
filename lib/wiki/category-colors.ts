export const categoryColors = {
  'nutrition': {
    name: 'Emerald',
    tw: 'emerald',
    hex: '#10b981',
    bg: 'bg-emerald-500/10',
    bgHover: 'hover:bg-emerald-500/15',
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/30',
    text: 'text-emerald-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
  },
  'exercise-science': {
    name: 'Blue',
    tw: 'blue',
    hex: '#3b82f6',
    bg: 'bg-blue-500/10',
    bgHover: 'hover:bg-blue-500/15',
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/30',
    text: 'text-blue-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]',
  },
  'physiology': {
    name: 'Purple',
    tw: 'purple',
    hex: '#a855f7',
    bg: 'bg-purple-500/10',
    bgHover: 'hover:bg-purple-500/15',
    border: 'border-purple-500/20',
    borderHover: 'hover:border-purple-500/30',
    text: 'text-purple-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]',
  },
  'training-methods': {
    name: 'Amber',
    tw: 'amber',
    hex: '#f59e0b',
    bg: 'bg-amber-500/10',
    bgHover: 'hover:bg-amber-500/15',
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/30',
    text: 'text-amber-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
  },
  'psychology': {
    name: 'Cyan',
    tw: 'cyan',
    hex: '#06b6d4',
    bg: 'bg-cyan-500/10',
    bgHover: 'hover:bg-cyan-500/15',
    border: 'border-cyan-500/20',
    borderHover: 'hover:border-cyan-500/30',
    text: 'text-cyan-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]',
  },
  'injury-health': {
    name: 'Rose',
    tw: 'rose',
    hex: '#f43f5e',
    bg: 'bg-rose-500/10',
    bgHover: 'hover:bg-rose-500/15',
    border: 'border-rose-500/20',
    borderHover: 'hover:border-rose-500/30',
    text: 'text-rose-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)]',
  },
} as const;

export type WikiCategory = keyof typeof categoryColors;

export function getCategoryColor(category: string) {
  return categoryColors[category as WikiCategory] || categoryColors['exercise-science'];
}
