// app/dashboard/mock-interview/_components/video-interview.tsx

"use client";

import React, { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mic,
  Volume2,
  ShieldAlert,
  PlayCircle,
} from "lucide-react";
import { mockAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// TensorFlow.js dependencies for face and eye tracking
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMeshTfjsModelConfig } from "@tensorflow-models/face-landmarks-detection";

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

interface AnalysisReport {
  overall_score: number;
  category_scores: Record<string, number>;
  feedback: string;
  suggestions: string[];
}

const getSpeechAudio = async (text: string) => {
  try {
    const data = await mockAPI.speak(text);
    return `http://localhost:8000${data.audio_url}`;
  } catch (error) {
    console.error("Error getting speech audio:", error);
    return null;
  }
};

export default function VideoInterview({
  interviewDetails,
  userStream,
  onEndInterview,
}: VideoInterviewProps) {
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);

  const modelRef =
    useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const baselinePosition = useRef<{ x: number; y: number } | null>(null);
  const requestRef = useRef<number>();

  const handleWarning = useCallback(
    (message: string) => {
      setWarningMessage(message);
      setWarnings((prev) => {
        const newWarnings = prev + 1;
        if (newWarnings >= 3) {
          onEndInterview();
        }
        return newWarnings;
      });
      setTimeout(() => setWarningMessage(null), 3000);
    },
    [onEndInterview]
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await mockAPI.generateQuestions(
          interviewDetails.title,
          "medium",
          { num_questions: 10 }
        );
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

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      setIsAiSpeaking(true);
      setAudioError(false);
      getSpeechAudio(currentQuestion.question).then((audioUrl) => {
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch((e) => {
            console.error("Audio autoplay was blocked by the browser.", e);
            setAudioError(true); // Show a manual play button if autoplay fails
            setIsAiSpeaking(false);
          });
        } else {
          setIsAiSpeaking(false);
        }
      });
    }
  }, [currentQuestionIndex, questions]);

  const handleManualPlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setAudioError(false);
      setIsAiSpeaking(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // End of interview, get analysis report
      // This is a mock implementation. You would typically send the user's answers to the backend.
      const mockAnswers = questions.map((q) => ({
        question_id: q.id,
        is_correct: Math.random() > 0.5,
      }));

      mockAPI.evaluateAnswers({ questions, answers: mockAnswers }).then((report: AnalysisReport) => {
        setAnalysisReport(report);
      });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const detectMotion = useCallback(async () => {
    if (
      userVideoRef.current &&
      userVideoRef.current.readyState === 4 &&
      modelRef.current &&
      modelLoaded
    ) {
      try {
        const video = userVideoRef.current;
        const face = await modelRef.current.estimateFaces(video);

        if (face && face.length > 0) {
          const keypoints = face[0].keypoints;
          const nose = keypoints.find(
            (point) => point.name === "noseTip"
          );

          if (nose) {
            if (!baselinePosition.current) {
              setTimeout(() => {
                baselinePosition.current = { x: nose.x, y: nose.y };
              }, 2000);
            } else {
              const dx = Math.abs(nose.x - baselinePosition.current.x);
              const dy = Math.abs(nose.y - baselinePosition.current.y);

              // Increased threshold for head movement
              if (dx > 150 || dy > 150) {
                handleWarning("Please do not move your head.");
              }
            }
          }
        } else {
          handleWarning("No face detected. Please remain visible.");
        }
      } catch (error) {
        console.error("Face detection error:", error);
      }
    }
    requestRef.current = requestAnimationFrame(detectMotion);
  }, [handleWarning, modelLoaded]);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("webgl");
      const model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "tfjs",
          refineLandmarks: true,
        } as MediaPipeFaceMeshTfjsModelConfig
      );
      modelRef.current = model;
      setModelLoaded(true);
      requestRef.current = requestAnimationFrame(detectMotion);
    };
    loadModel();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [detectMotion]);

  const currentQuestion = questions[currentQuestionIndex];

  if (analysisReport) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex flex-col p-4 md:p-6 lg:p-8 font-sans">
        <h1 className="text-2xl font-bold mb-4">Interview Analysis Report</h1>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">Overall Score: {analysisReport.overall_score}%</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {Object.entries(analysisReport.category_scores).map(([category, score]) => (
                <div key={category}>
                  <p className="capitalize">{category.replace("_", " ")}</p>
                  <p className="text-lg font-bold">{score as ReactNode}%</p>
                </div>
              ))}
            </div>
            <p className="mb-4">{analysisReport.feedback}</p>
            <h3 className="font-bold mb-2">Suggestions:</h3>
            <ul>
              {analysisReport.suggestions.map((suggestion: string, index: number) => (
                <li key={index}>- {suggestion}</li>
              ))}
            </ul>
            <Button onClick={onEndInterview} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col p-4 md:p-6 lg:p-8 font-sans">
      <header className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{interviewDetails.title}</h1>
          <p className="text-sm text-slate-400">
            Interview with {interviewDetails.company}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold">
              {user?.user_metadata.full_name || "User"}
            </div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
          <Avatar>
            <AvatarImage src={user?.user_metadata.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata.full_name
                ? user?.user_metadata.full_name.charAt(0)
                : "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-black rounded-lg flex flex-col justify-center items-center relative overflow-hidden shadow-2xl border-2 border-slate-700">
          <video
            ref={userVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          ></video>
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-sm font-medium">
            You
          </div>
          <div className="absolute top-4 right-4 bg-green-500/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Mic className="h-3 w-3" /> LIVE
          </div>
          {warningMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black p-4 rounded-lg flex items-center gap-2"
            >
              <ShieldAlert />
              {warningMessage} ({warnings}/3)
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-lg flex flex-col relative overflow-hidden p-6 shadow-2xl">
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              isAiSpeaking ? "opacity-100" : "opacity-0"
            }`}
          >
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
                <Image
                  src="/images/roles/hr-manager.jpg"
                  alt="AI"
                  layout="fill"
                  objectFit="cover"
                />
              </Avatar>
              <div>
                <h2 className="font-bold text-lg">Rex AI</h2>
                <div
                  className={`text-sm flex items-center gap-2 transition-colors ${
                    isAiSpeaking ? "text-blue-400" : "text-slate-400"
                  }`}
                >
                  {isAiSpeaking ? (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse" /> Speaking...
                    </>
                  ) : (
                    "Waiting for your response"
                  )}
                </div>
              </div>
            </div>

            <Card className="bg-black/30 backdrop-blur-sm border-slate-600 min-h-[150px] flex items-center justify-center">
              <CardContent className="p-6 text-center">
                {isLoading && (
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                )}
                {audioError && !isLoading && (
                  <Button
                    variant="ghost"
                    onClick={handleManualPlay}
                    className="text-lg"
                  >
                    <PlayCircle className="mr-2 h-6 w-6" />
                    Click to Play Question
                  </Button>
                )}
                {!isLoading && !audioError && currentQuestion && (
                  <p className="text-lg text-slate-300">
                    {currentQuestion.question}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-6">
              <div>
                <Badge
                  variant="outline"
                  className="border-slate-500 text-slate-300"
                >
                  Question {currentQuestionIndex + 1} / {questions.length}
                </Badge>
                <Badge variant="secondary" className="ml-2 capitalize">
                  {currentQuestion?.category}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next Question"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="relative pt-6 mt-6 border-t border-slate-700">
            <Button
              variant="destructive"
              size="lg"
              onClick={onEndInterview}
              className="w-full"
            >
              End Interview
            </Button>
          </div>
          <audio
            ref={audioRef}
            onPlay={() => setIsAiSpeaking(true)}
            onEnded={() => {
              setIsAiSpeaking(false);
            }}
            className="hidden"
          />
        </div>
      </main>
    </div>
  );
}