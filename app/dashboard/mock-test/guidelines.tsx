"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, HelpCircle, AlertTriangle } from "lucide-react"

interface GuidelinesProps {
  role: string
  settings: {
    num_questions: number
    time_limit: boolean
    time_per_question: number
  }
  onStartTest: () => void
}

export default function Guidelines({ role, settings, onStartTest }: GuidelinesProps) {
  const [startText, setStartText] = useState("")
  const isStartDisabled = startText.toLowerCase() !== "start"

  const totalDuration = settings.time_limit
    ? settings.num_questions * settings.time_per_question
    : 15 // Default estimate if no time limit

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start pt-8"
    >
      {/* Left Panel */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{role} - Mock Test</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-slate-600 dark:text-slate-400">Questions</span>
              <span className="font-semibold">{settings.num_questions}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-slate-600 dark:text-slate-400">Marks</span>
              <span className="font-semibold">{settings.num_questions * 10}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Timelines & Questions</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                Assessment Duration: <strong>{totalDuration}:00 (mm:ss)</strong>
              </li>
              <li>
                Total Questions to be answered: <strong>{settings.num_questions}</strong>
              </li>
              <li>Do not close the window or tab if you wish to continue the application.</li>
              <li>Please ensure that you attempt the assessment in one sitting as once you start the assessment, the timer won't stop.</li>
            </ul>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <Input
              placeholder='Type "start" to Start'
              value={startText}
              onChange={(e) => setStartText(e.target.value)}
            />
            <Button onClick={onStartTest} disabled={isStartDisabled} size="lg">
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}