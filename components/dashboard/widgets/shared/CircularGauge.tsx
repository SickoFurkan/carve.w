"use client";

import { useId, useState, useEffect } from "react";

interface CircularGaugeProps {
  value: number;
  max: number;
  size?: number;
}

export function CircularGauge({ value, max, size = 120 }: CircularGaugeProps) {
  const [mounted, setMounted] = useState(false);
  const gradientId = useId();
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Calculate center point
  const center = size / 2;

  // Radiating lines configuration
  const numLines = 12;
  const lineLength = 8;
  const lineDistance = radius + 4;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return simple placeholder during SSR
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1a1a1a]">
              {Math.round(percentage)}%
            </div>
            <div className="text-xs text-[#6b7280]">
              {value.toLocaleString('en-US')}/{max.toLocaleString('en-US')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Radiating decorative lines */}
        {Array.from({ length: numLines }).map((_, i) => {
          const angle = (i * 360) / numLines;
          const radian = (angle * Math.PI) / 180;
          const x1 = center + Math.cos(radian) * lineDistance;
          const y1 = center + Math.sin(radian) * lineDistance;
          const x2 = center + Math.cos(radian) * (lineDistance + lineLength);
          const y2 = center + Math.sin(radian) * (lineDistance + lineLength);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="8"
        />

        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>

      {/* Percentage text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#1a1a1a]">
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-[#6b7280]">
            {value.toLocaleString('en-US')}/{max.toLocaleString('en-US')}
          </div>
        </div>
      </div>
    </div>
  );
}
