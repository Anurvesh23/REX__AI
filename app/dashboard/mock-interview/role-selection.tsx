"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArrowRight } from "lucide-react"

interface RoleSelectionProps {
  onSelectRole: (role: string) => void
}

const roles = {
  Tech: [
    {
      title: "Software Developer",
      description: "Designs, codes, and maintains software solutions.",
      image: "/images/roles/software-developer.png",
    },
    {
      title: "Data Analyst",
      description: "Derives insights and trends from complex data sets.",
      image: "/images/roles/data-analyst.png",
    },
    {
      title: "Backend Developer",
      description: "Develops and maintains server-side applications.",
      image: "/images/roles/backend-developer.png",
    },
    {
      title: "Frontend Developer",
      description: "Creates responsive, user-centric web interfaces.",
      image: "/images/roles/frontend-developer.png",
    },
    {
      title: "QA Engineer",
      description: "Ensures software quality through rigorous testing.",
      image: "/images/roles/qa-engineer.png",
    },
    {
      title: "Cyber Security Engineer",
      description: "Secures systems and networks from cyber threats.",
      image: "/images/roles/cyber-security.png",
    },
  ],
  Management: [
    // Add management roles here when ready
  ],
  General: [
    // Add general roles here
  ],
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI-Powered Mock Tests</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Master your concepts with AI-Powered full length mock tests for 360° preparation. Select your desired role to
          begin.
        </p>
      </div>

      <Tabs defaultValue="Tech" className="w-full">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="Tech">Tech</TabsTrigger>
            <TabsTrigger value="Management" disabled>
              Management
            </TabsTrigger>
            <TabsTrigger value="General" disabled>
              General
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="Tech" className="mt-8">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent>
              {roles.Tech.map((role, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card
                      className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => onSelectRole(role.title)}
                    >
                      <CardContent className="flex flex-col items-start p-0">
                        <div className="relative w-full h-40">
                          <Image
                            src={role.image}
                            alt={role.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4 w-full">
                          <h3 className="text-lg font-semibold mb-1">{role.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 h-10">{role.description}</p>
                          <div className="mt-4 flex justify-between items-center w-full">
                            <span className="text-sm font-medium text-blue-600">Start Test</span>
                            <ArrowRight className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-12" />
            <CarouselNext className="mr-12" />
          </Carousel>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}