"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  Filter,
  Heart,
  Building,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function JobSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [savedJobs, setSavedJobs] = useState<number[]>([])

  const mockJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $160k",
      posted: "2 days ago",
      matchScore: 95,
      description: "We are looking for a Senior Frontend Developer to join our growing team...",
      requirements: ["React", "TypeScript", "Node.js", "GraphQL"],
      benefits: ["Health Insurance", "Remote Work", "401k", "Stock Options"],
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      type: "Full-time",
      salary: "$100k - $140k",
      posted: "1 day ago",
      matchScore: 88,
      description: "Join our innovative team building the next generation of web applications...",
      requirements: ["JavaScript", "React", "Python", "AWS"],
      benefits: ["Flexible Hours", "Health Insurance", "Learning Budget"],
    },
    {
      id: 3,
      title: "React Developer",
      company: "Digital Agency Pro",
      location: "Austin, TX",
      type: "Contract",
      salary: "$80k - $100k",
      posted: "3 days ago",
      matchScore: 82,
      description: "We need a skilled React developer for a 6-month project...",
      requirements: ["React", "JavaScript", "CSS", "Git"],
      benefits: ["Remote Work", "Flexible Schedule"],
    },
    {
      id: 4,
      title: "Frontend Team Lead",
      company: "Enterprise Solutions",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$140k - $180k",
      posted: "5 days ago",
      matchScore: 78,
      description: "Lead a team of frontend developers in building enterprise applications...",
      requirements: ["React", "Leadership", "TypeScript", "Team Management"],
      benefits: ["Health Insurance", "Stock Options", "Paid Time Off", "Training Budget"],
    },
  ]

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 80) return "text-blue-600 bg-blue-100"
    if (score >= 70) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Search className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">Job Search</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">AI-Powered Matching</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search for jobs, companies, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button size="lg">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="lg">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{mockJobs.length}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Jobs Found</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{savedJobs.length}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Saved Jobs</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Avg Match Score</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all-jobs" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all-jobs">All Jobs ({mockJobs.length})</TabsTrigger>
                <TabsTrigger value="saved">Saved ({savedJobs.length})</TabsTrigger>
                <TabsTrigger value="applied">Applied (0)</TabsTrigger>
              </TabsList>

              <TabsContent value="all-jobs">
                <div className="space-y-4">
                  {mockJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{job.title}</h3>
                                <Badge className={`${getMatchScoreColor(job.matchScore)} border-0`}>
                                  {job.matchScore}% Match
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 mb-3">
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  {job.company}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {job.posted}
                                </div>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 mb-4">{job.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSaveJob(job.id)}
                                className={savedJobs.includes(job.id) ? "text-red-600" : ""}
                              >
                                <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                              </Button>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-2">Requirements</h4>
                              <div className="flex flex-wrap gap-1">
                                {job.requirements.map((req, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-2">Benefits</h4>
                              <div className="flex flex-wrap gap-1">
                                {job.benefits.map((benefit, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-green-600">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium">{job.salary}</span>
                              </div>
                              <Badge variant="outline">{job.type}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button size="sm">Apply Now</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="saved">
                <div className="space-y-4">
                  {savedJobs.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Bookmark className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Saved Jobs Yet</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Save jobs you're interested in to review them later
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    mockJobs
                      .filter((job) => savedJobs.includes(job.id))
                      .map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                      {job.title}
                                    </h3>
                                    <Badge className={`${getMatchScoreColor(job.matchScore)} border-0`}>
                                      {job.matchScore}% Match
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Building className="h-4 w-4" />
                                      {job.company}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {job.location}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSaveJob(job.id)}
                                  className="text-red-600"
                                >
                                  <Heart className="h-4 w-4 fill-current" />
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                <Button size="sm">Apply Now</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="applied">
                <Card>
                  <CardContent className="p-12 text-center">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Applications Yet</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Your job applications will appear here once you start applying
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
