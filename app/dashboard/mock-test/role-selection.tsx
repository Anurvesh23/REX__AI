"use client"

import { useState } from "react";
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArrowRight, Grid, Rows, HelpCircle, Clock, Star } from "lucide-react"

interface RoleSelectionProps {
  onSelectRole: (role: string) => void
}

const roles = {
  Tech: [
    {
      title: "Software Developer",
      image: "/images/roles/software-developer.png",
      questions: 25,
      duration: 45,
      marks: 100,
    },
    {
      title: "Data Analyst",
      image: "/images/roles/data-analyst.png",
      questions: 30,
      duration: 60,
      marks: 100,
    },
    {
      title: "Backend Developer",
      image: "/images/roles/backend-developer.png",
      questions: 25,
      duration: 45,
      marks: 100,
    },
    {
      title: "Frontend Developer",
      image: "/images/roles/frontend-developer.png",
      questions: 25,
      duration: 45,
      marks: 100,
    },
    {
      title: "QA Engineer",
      image: "/images/roles/qa-engineer.png",
      questions: 20,
      duration: 30,
      marks: 100,
    },
    {
      title: "Cyber Security Engineer",
      image: "/images/roles/cyber-security.png",
      questions: 30,
      duration: 45,
      marks: 100,
    },
    {
      title: "Machine Learning Engineer",
      image: "/images/roles/machine-learning-engineer.png",
      questions: 25,
      duration: 60,
      marks: 100,
    },
  ],
  Management: [
    {
      title: "Product Manager",
      image: "/images/roles/product-manager.jpg",
      questions: 20,
      duration: 40,
      marks: 100,
    },
    {
      title: "HR Manager",
      image: "/images/roles/hr-manager.jpg",
      questions: 25,
      duration: 30,
      marks: 100,
    },
    {
      title: "Business Analyst",
      image: "/images/roles/business-analyst.jpg",
      questions: 30,
      duration: 50,
      marks: 100,
    },
  ],
  General: [
    {
      title: "Content Writer",
      image: "/images/roles/content-writer.jpg",
      questions: 20,
      duration: 30,
      marks: 100,
    },
    {
      title: "Graphic Designer",
      image: "/images/roles/graphic-designer.jpg",
      questions: 15,
      duration: 45,
      marks: 100,
    },
  ],
}

// Reusable Role Card Component
const RoleCard = ({ role, onSelectRole }: { role: any, onSelectRole: (role: string) => void }) => (
    <Card
        className="group flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300"
        onClick={() => onSelectRole(role.title)}
    >
        <CardContent className="p-0 flex flex-col flex-grow">
            <div className="relative w-full aspect-[16/9]">
                <Image
                    src={role.image}
                    alt={role.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2 flex-grow">{role.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground my-3 border-t border-b py-3">
                    <div className="flex items-center gap-1.5">
                        <HelpCircle className="h-4 w-4" />
                        <span>{role.questions} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{role.duration} Mins</span>
                    </div>
                </div>
                 <Button className="w-full mt-2">
                    Start Now
                </Button>
            </div>
        </CardContent>
    </Card>
);


export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [isGridView, setIsGridView] = useState(true); // Default to grid view

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
          Practice and prepare to get hired by top companies. Select your desired role to begin.
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
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"
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