"use client"

import { motion } from "framer-motion"

interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  className?: string
}

export function BarChart({ data, className = "" }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((item, index) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
            <span className="text-sm font-bold" style={{ color: item.color }}>
              {item.value}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <motion.div
              className="h-3 rounded-full"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / 100) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
