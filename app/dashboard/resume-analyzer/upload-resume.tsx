"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, X, Brain, Zap } from "lucide-react"

interface UploadResumeProps {
  onAnalyze: (resumeFile: File, jobDescription: string) => void
  isAnalyzing: boolean
}

export default function UploadResume({ onAnalyze, isAnalyzing }: UploadResumeProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  // const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setParseError(null)
    setUploadProgress(0)

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      setParseError("Please upload a PDF, DOC, or DOCX file")
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setParseError("File size must be less than 10MB")
      return
    }

    setUploadedFile(file)
    setUploadProgress(100)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setParseError(null)
  }

  const handleAnalyze = () => {
    if (uploadedFile && jobDescription.trim()) {
      onAnalyze(uploadedFile, jobDescription)
    }
  }

  const isFormValid = uploadedFile && jobDescription.trim()

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Your Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!uploadedFile ? (
              <>
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="resume-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">Click to upload</span>
                    <span className="text-slate-600 dark:text-slate-400"> or drag and drop</span>
                  </Label>
                  <p className="text-sm text-slate-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-white">{uploadedFile.name}</div>
                    <div className="text-sm text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Parsing resume...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {uploadProgress === 100 && !parseError && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Resume parsed successfully</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {parseError && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>{parseError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description - Now Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Job Description <span className="text-red-500">*</span>
            <span className="text-sm font-normal text-slate-500">(Required)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste the complete job description here. This is required for accurate analysis and keyword matching..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px]"
            required
          />
          {jobDescription.trim() && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Job description added ({jobDescription.length} characters)
            </div>
          )}
          {!jobDescription.trim() && (
            <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Job description is required for accurate analysis
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI-Powered Analysis</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Skills match percentage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Experience relevance score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Education alignment</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Job match compatibility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>ATS optimization score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Keyword analysis</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyze Button */}
      <div className="text-center">
        <Button size="lg" onClick={handleAnalyze} disabled={!isFormValid || isAnalyzing} className="px-8 py-3">
          {isAnalyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="mr-2"
              >
                <Zap className="h-5 w-5" />
              </motion.div>
              Analyzing with AI...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Analyze Resume with AI
            </>
          )}
        </Button>
        {!isFormValid && (
          <p className="mt-2 text-sm text-red-600">Please upload a resume and provide a job description to continue</p>
        )}
      </div>
    </div>
  )
}
