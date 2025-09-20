"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EvaluatingAnswers() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center pt-16"
    >
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Evaluating Your Answers</CardTitle>
          <CardDescription>
            Our AI is analyzing your performance and generating feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8">
            <div className="flex items-center justify-center space-x-3 text-lg font-medium text-blue-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Evaluating answers...</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            This might take a moment. Please don't close the window.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}