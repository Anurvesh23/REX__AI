"use client"

import { useState } from "react";
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArrowRight, Grid, Rows } from "lucide-react"

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
    {
      title: "Machine Learning Engineer",
      description: "Builds and deploys machine learning models.",
      image: "/images/roles/machine-learning-engineer.png",
    },
    {
      title: "DevOps Engineer",
      description: "Manages infrastructure and automates deployment.",
      image: "/images/roles/devops-engineer.png",
    },
    {
      title: "Cloud Engineer",
      description: "Manages and maintains cloud infrastructure.",
      image: "/images/roles/cloud-engineer.png",
    },
    {
      title: "Cloud Architect",
      description: "Designs and implements cloud solutions.",
      image: "/images/roles/cloud-architect.png",
    },
  ],
  Management: [
    {
      title: "Product Manager",
      description: "Defines product vision and manages the product lifecycle.",
      image: "/images/roles/product-manager.jpg",
    },
    {
      title: "HR Manager",
      description: "Oversees recruitment, employee relations, and HR policies.",
      image: "/images/roles/hr-manager.jpg",
    },
    {
      title: "Business Analyst",
      description: "Analyzes business processes and recommends improvements.",
      image: "/images/roles/business-analyst.jpg",
    },
    {
      title: "Marketing Manager",
      description: "Develops and executes marketing strategies to drive growth.",
      image: "/images/roles/marketing-manager.jpg",
    },
  ],
  General: [
    {
      title: "Content Writer",
      description: "Creates compelling content for various digital platforms.",
      image: "/images/roles/content-writer.jpg",
    },
    {
      title: "Graphic Designer",
      description: "Designs visual assets for branding and marketing materials.",
      image: "/images/roles/graphic-designer.jpg",
    },
  ],
}

// Reusable Role Card Component to keep the code DRY
const RoleCard = ({ role, onSelectRole }: { role: { title: string; image: string; description: string }, onSelectRole: (role: string) => void }) => (
    <Card
        className="group flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => onSelectRole(role.title)}
    >
        <CardContent className="p-0 flex flex-col flex-grow">
            <div className="relative w-full aspect-video">
                <Image
                    src={role.image}
                    alt={role.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-1">{role.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow min-h-[40px]">
                    {role.description}
                </p>
                <div className="mt-4 pt-4 border-t flex justify-between items-center w-full">
                    <span className="text-sm font-medium text-blue-600">Start Test</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </CardContent>
    </Card>
);


export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [isGridView, setIsGridView] = useState(false);

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
        <div className="flex justify-center items-center gap-4 mb-8">
          <TabsList>
            <TabsTrigger value="Tech">Tech</TabsTrigger>
            <TabsTrigger value="Management">Management</TabsTrigger>
            <TabsTrigger value="General">General</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={() => setIsGridView(!isGridView)}>
            {isGridView ? <Rows className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {isGridView ? "View Carousel" : "View All"}
          </Button>
        </div>

        {Object.entries(roles).map(([category, roleList]) => (
          <TabsContent key={category} value={category}>
            {isGridView ? (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {roleList.map((role, index) => (
                        <RoleCard key={index} role={role} onSelectRole={onSelectRole} />
                    ))}
                </motion.div>
            ) : (
                <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
                >
                <CarouselContent className="-ml-4">
                    {roleList.map((role, index) => (
                    <CarouselItem key={index} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                            <RoleCard role={role} onSelectRole={onSelectRole} />
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                </Carousel>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}