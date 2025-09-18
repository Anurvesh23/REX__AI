// app/dashboard/mock-interview/_components/video-interview.tsx
"use client"

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Mic, Volume2 } from 'lucide-react';
import { interviewAPI } from '@/lib/api'; // Assuming startInterview is here
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface VideoInterviewProps {
  interviewDetails: { title: string; company: string };
  userStream: MediaStream | null;
  onEndInterview: () => void;
}

interface Question {
    id: number;
    question: string;
    category: string;
}

// A simple API call for text-to-speech
const getSpeechAudio = async (text: string) => {
    try {
        const response = await fetch("http://localhost:8000/interview/speak/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error("Failed to generate speech");
        const data = await response.json();
        // Assuming your backend is on localhost:8000
        return `http://localhost:8000${data.audio_url}`;
    } catch (error) {
        console.error("Error getting speech audio:", error);
        return null;
    }
}


export default function VideoInterview({ interviewDetails, userStream, onEndInterview }: VideoInterviewProps) {
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  useEffect(() => {
    // Fetch questions when the component mounts
    const fetchQuestions = async () => {
      try {
        const data = await interviewAPI.generateQuestions(interviewDetails.title, undefined, {num_questions: 10, difficulty: 'medium'});
        setQuestions(data);
      } catch (error) {
        console.error("Failed to fetch interview questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [interviewDetails.title]);
  
  useEffect(() => {
    if (userVideoRef.current && userStream) {
      userVideoRef.current.srcObject = userStream;
    }
  }, [userStream]);

  // Effect to fetch and play audio for the current question
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      setIsAiSpeaking(true);
      getSpeechAudio(currentQuestion.question).then(audioUrl => {
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        } else {
            setIsAiSpeaking(false);
        }
      });
    }
  }, [currentQuestionIndex, questions]);
  
  const handleNextQuestion = () => {
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
      }
  };

  const handlePrevQuestion = () => {
      if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
      }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col p-4 md:p-6 lg:p-8 font-sans">
      <header className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
            <h1 className="text-2xl font-bold">{interviewDetails.title}</h1>
            <p className="text-sm text-slate-400">Interview with {interviewDetails.company}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="font-semibold">{user?.user_metadata.full_name || 'User'}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <Avatar>
              <AvatarImage src={user?.user_metadata.avatar_url} />
              <AvatarFallback>{user?.user_metadata.full_name ? user?.user_metadata.full_name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* User Video */}
        <div className="lg:col-span-2 bg-black rounded-lg flex flex-col justify-center items-center relative overflow-hidden shadow-2xl border-2 border-slate-700">
            <video ref={userVideoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]"></video>
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-sm font-medium">You</div>
             <div className="absolute top-4 right-4 bg-green-500/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Mic className="h-3 w-3"/> LIVE
             </div>
        </div>

        {/* AI Interviewer & Controls */}
        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-lg flex flex-col relative overflow-hidden p-6 shadow-2xl">
            <div className={`absolute inset-0 transition-all duration-500 ${isAiSpeaking ? 'opacity-100' : 'opacity-0'}`}>
                 <Image 
                    src="/images/roles/hr-manager.jpg"
                    alt="AI Interviewer" 
                    layout="fill"
                    objectFit="cover"
                    className="opacity-20 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/80 to-transparent"></div>
            </div>
            
            <div className="relative flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-blue-400">
                        <Image src="/images/roles/hr-manager.jpg" alt="AI" layout="fill" objectFit="cover"/>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-lg">Rex AI</h2>
                        <div className={`text-sm flex items-center gap-2 transition-colors ${isAiSpeaking ? 'text-blue-400' : 'text-slate-400'}`}>
                           {isAiSpeaking ? (
                            <>
                                <Volume2 className="h-4 w-4 animate-pulse" />
                                Speaking...
                            </>
                           ) : "Waiting for your response"}
                        </div>
                    </div>
                </div>

                <Card className="bg-black/30 backdrop-blur-sm border-slate-600 min-h-[150px] flex items-center justify-center">
                    <CardContent className="p-6 text-center">
                        {isLoading ? (
                           <Loader2 className="h-8 w-8 animate-spin text-slate-400"/>
                        ) : (
                           <motion.p 
                                key={currentQuestion?.id || 0}
                                className="text-xl lg:text-2xl font-medium leading-relaxed"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                           >
                            {currentQuestion?.question}
                           </motion.p>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center mt-6">
                    <div>
                        <Badge variant="outline" className="border-slate-500 text-slate-300">
                            Question {currentQuestionIndex + 1} / {questions.length}
                        </Badge>
                         <Badge variant="secondary" className="ml-2 capitalize">{currentQuestion?.category}</Badge>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline" size="icon" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                         <Button variant="outline" size="icon" onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative pt-6 mt-6 border-t border-slate-700">
                <Button variant="destructive" size="lg" onClick={onEndInterview} className="w-full">
                    End Interview
                </Button>
            </div>
             <audio 
                ref={audioRef} 
                onEnded={() => setIsAiSpeaking(false)}
                className="hidden"
            />
        </div>
      </main>
    </div>
  );
}