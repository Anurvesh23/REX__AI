"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, BarChart2, BarChart3, Zap } from "lucide-react"

interface DifficultySelectionProps {
  role: string
  onSelectDifficulty: (difficulty: "easy" | "medium" | "hard") => void
}

const difficulties = [
  {
    level: "easy" as const,
    title: "Easy",
    description: "Ideal for beginners. Focuses on fundamental concepts and basic questions.",
    icon: BarChart,
  },
  {
    level: "medium" as const,
    title: "Medium",
    description: "A balanced challenge for most candidates. Covers a mix of core and advanced topics.",
    icon: BarChart2,
  },
  {
    level: "hard" as const,
    title: "Hard",
    description: "For experienced professionals. Involves complex scenarios and in-depth questions.",
    icon: BarChart3,
  },
]

export default function DifficultySelection({ role, onSelectDifficulty }: DifficultySelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Challenge</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          You have selected the role: <span className="font-semibold text-blue-600">{role}</span>
        </p>
        <p className="text-md text-slate-500 dark:text-slate-400 mt-1">
          Now, select the difficulty level for your mock interview.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {difficulties.map((diff, index) => (
          <motion.div
            key={diff.level}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              className="group h-full hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => onSelectDifficulty(diff.level)}
            >
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <diff.icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>{diff.title}</CardTitle>
                <CardDescription>{diff.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Select {diff.title}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}