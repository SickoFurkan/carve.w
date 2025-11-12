"use client";

import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface SparklineProps {
  data: Array<{
    day: string;
    xp: number;
    isToday: boolean;
  }>;
}

export function Sparkline({ data }: SparklineProps) {
  // Gradient color mapping based on XP value
  const getBarColor = (xp: number, isToday: boolean) => {
    if (isToday) {
      return "#f59e0b"; // Orange for today
    }
    if (xp >= 300) return "#8b5cf6"; // Purple for high XP
    if (xp >= 150) return "#3b82f6"; // Blue for medium XP
    if (xp >= 50) return "#06b6d4"; // Teal for low XP
    return "#4b5563"; // Gray for minimal XP
  };

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} barGap={2}>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              return (
                <div className="rounded-lg border border-white/20 bg-[#0a0e1a] px-3 py-2">
                  <p className="text-xs text-[#8b92a8]">{payload[0].payload.day}</p>
                  <p className="text-sm font-semibold text-white">
                    {payload[0].value} XP
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={false}
        />
        <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry.xp, entry.isToday)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
