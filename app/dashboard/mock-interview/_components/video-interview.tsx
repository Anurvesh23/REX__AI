"use client"

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VideoInterviewProps {
  interviewDetails: {
    title: string;
    company: string;
  };
  userStream: MediaStream | null;
  onEndInterview: () => void;
}

export default function VideoInterview({ interviewDetails, userStream, onEndInterview }: VideoInterviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (videoRef.current && userStream) {
      videoRef.current.srcObject = userStream;
    }
  }, [userStream]);

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Video and Controls */}
          <div className="md:col-span-2 relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover"></video>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-slate-800/50 p-3 rounded-xl">
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-700 hover:bg-slate-600" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-700 hover:bg-slate-600" onClick={() => setIsVideoOff(!isVideoOff)}>
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full" onClick={onEndInterview}>
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Interview Details and Questions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{interviewDetails.title}</h2>
                <h3 className="text-md text-slate-400 mb-6">{interviewDetails.company}</h3>
                
                <div className="space-y-4">
                    <p className="text-lg font-semibold">Question 1/5:</p>
                    <p className="text-slate-300">"Tell me about a challenging project you've worked on."</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Progress value={20} className="h-2" />
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Next Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}