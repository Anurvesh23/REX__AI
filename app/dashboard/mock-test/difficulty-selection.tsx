"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Shield, BarChart } from "lucide-react";

interface DifficultySelectionProps {
  role: string;
  onSelectDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
}

const difficulties = [
    { level: "easy", title: "Easy", description: "Fundamental concepts and basic questions.", icon: Shield },
    { level: "medium", title: "Medium", description: "Practical scenarios and intermediate topics.", icon: BarChart },
    { level: "hard", title: "Hard", description: "Complex problems and advanced concepts.", icon: Zap },
];

export default function DifficultySelection({ role, onSelectDifficulty }: DifficultySelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto text-center"
    >
      <h1 className="text-3xl font-bold mb-2">Select Difficulty Level</h1>
      <p className="text-lg text-muted-foreground mb-8">
        You have selected the <span className="font-semibold text-primary">{role}</span> role. Now, choose the test difficulty.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((d) => (
          <Card
            key={d.level}
            className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
            onClick={() => onSelectDifficulty(d.level as "easy" | "medium" | "hard")}
          >
            <CardHeader>
                <d.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                <CardTitle>{d.title}</CardTitle>
                <CardDescription>{d.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}