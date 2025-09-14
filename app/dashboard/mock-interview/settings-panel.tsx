// anurvesh23/rex__ai/REX__AI-729dd70bf78d6bdb43e54cc965c0bbf834d47f56/app/dashboard/mock-interview/settings-panel.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Target, Clock, Brain } from "lucide-react"

interface InterviewSettings {
  num_questions: number
  interview_type: "technical" | "behavioral" | "mixed"
  difficulty: "easy" | "medium" | "hard"
  focus_areas: string[]
  job_role: string
  save_answers: boolean
  time_limit: boolean
  time_per_question: number
}

interface SettingsPanelProps {
  settings: InterviewSettings
  onSettingsChange: (settings: InterviewSettings) => void
  onStartInterview: () => void
}

export default function SettingsPanel({ settings, onSettingsChange, onStartInterview }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<InterviewSettings>(settings)

  const handleSettingChange = (key: keyof InterviewSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const focusAreaOptions = [
    "Problem Solving",
    "System Design",
    "Data Structures",
    "Algorithms",
    "Leadership",
    "Teamwork",
    "Communication",
    "Project Management",
    "Technical Skills",
    "Industry Knowledge",
  ]

  const toggleFocusArea = (area: string) => {
    const currentAreas = localSettings.focus_areas
    const newAreas = currentAreas.includes(area) ? currentAreas.filter((a) => a !== area) : [...currentAreas, area]

    handleSettingChange("focus_areas", newAreas)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Interview Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Role */}
          <div className="space-y-2">
            <Label htmlFor="job-role">Job Role</Label>
            <Select value={localSettings.job_role} onValueChange={(value) => handleSettingChange("job_role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select job role" />
              </SelectTrigger>
              <SelectContent>
                {/* Tech Roles */}
                <SelectItem value="software-developer">Software Developer</SelectItem>
                <SelectItem value="data-analyst">Data Analyst</SelectItem>
                <SelectItem value="backend-developer">Backend Developer</SelectItem>
                <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                <SelectItem value="qa-engineer">QA Engineer</SelectItem>
                <SelectItem value="cyber-security-engineer">Cyber Security Engineer</SelectItem>
                <SelectItem value="machine-learning-engineer">Machine Learning Engineer</SelectItem>
                <SelectItem value="devops-engineer">DevOps Engineer</SelectItem>
                {/* Management Roles */}
                <SelectItem value="product-manager">Product Manager</SelectItem>
                <SelectItem value="hr-manager">HR Manager</SelectItem>
                <SelectItem value="business-analyst">Business Analyst</SelectItem>
                <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                {/* General Roles */}
                <SelectItem value="content-writer">Content Writer</SelectItem>
                <SelectItem value="graphic-designer">Graphic Designer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interview Type */}
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select
              value={localSettings.interview_type}
              onValueChange={(value: "technical" | "behavioral" | "mixed") =>
                handleSettingChange("interview_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Only</SelectItem>
                <SelectItem value="behavioral">Behavioral Only</SelectItem>
                <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Questions */}
          <div className="space-y-3">
            <Label>Number of Questions: {localSettings.num_questions}</Label>
            <Slider
              value={[localSettings.num_questions]}
              onValueChange={(value) => handleSettingChange("num_questions", value[0])}
              max={15}
              min={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500">
              <span>5 questions</span>
              <span>15 questions</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select
              value={localSettings.difficulty}
              onValueChange={(value: "easy" | "medium" | "hard") => handleSettingChange("difficulty", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Focus Areas */}
          <div className="space-y-3">
            <Label>Focus Areas (Select up to 5)</Label>
            <div className="flex flex-wrap gap-2">
              {focusAreaOptions.map((area) => (
                <Badge
                  key={area}
                  variant={localSettings.focus_areas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => toggleFocusArea(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-500">Selected: {localSettings.focus_areas.length}/5</p>
          </div>

          {/* Time Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="time-limit">Enable Time Limit</Label>
              <Switch
                id="time-limit"
                checked={localSettings.time_limit}
                onCheckedChange={(checked) => handleSettingChange("time_limit", checked)}
              />
            </div>

            {localSettings.time_limit && (
              <div className="space-y-3">
                <Label>Time per Question: {localSettings.time_per_question} minutes</Label>
                <Slider
                  value={[localSettings.time_per_question]}
                  onValueChange={(value) => handleSettingChange("time_per_question", value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Save Answers */}
          <div className="flex items-center justify-between">
            <Label htmlFor="save-answers">Save My Answers</Label>
            <Switch
              id="save-answers"
              checked={localSettings.save_answers}
              onCheckedChange={(checked) => handleSettingChange("save_answers", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Interview Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Interview Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">
                {localSettings.time_limit
                  ? `${localSettings.num_questions * localSettings.time_per_question} min`
                  : "No time limit"}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Duration</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">{localSettings.num_questions}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Questions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold capitalize">{localSettings.difficulty}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Difficulty</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Interview Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={onStartInterview}
          className="px-8 py-3"
          disabled={!localSettings.job_role || localSettings.focus_areas.length === 0}
        >
          Start Interview
        </Button>
      </div>
    </div>
  )
}