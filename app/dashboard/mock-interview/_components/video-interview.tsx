"use client"

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface VideoInterviewProps {
  interviewTitle: string;
  userStream: MediaStream | null;
  onEndInterview: () => void;
}

export default function VideoInterview({ interviewTitle, userStream, onEndInterview }: VideoInterviewProps) {
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (userVideoRef.current && userStream) {
      userVideoRef.current.srcObject = userStream;
    }
  }, [userStream]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="bg-slate-800 text-white min-h-screen flex flex-col p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{interviewTitle}</h1>
        <div className="flex items-center gap-4">
          <div className="bg-black/50 rounded-full px-4 py-1.5 text-sm font-mono">
            00:{formatTime(elapsedTime)}
          </div>
          <div className="flex items-center gap-2 text-right">
             <div>
                <div className="font-semibold">{user?.user_metadata.full_name || 'User'}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <Avatar>
              <AvatarImage src={user?.user_metadata.avatar_url} />
              <AvatarFallback>{user?.user_metadata.full_name ? getInitials(user.user_metadata.full_name) : 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 grid md:grid-cols-2 gap-4">
        <div className="bg-black rounded-lg flex flex-col justify-center items-center relative overflow-hidden">
            {/* Placeholder for AI interviewer video */}
            <Image 
                src="/images/roles/hr-manager.jpg" // Using an existing image as placeholder
                alt="AI Interviewer" 
                layout="fill"
                objectFit="cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-sm">Rex AI</div>
        </div>
        <div className="bg-black rounded-lg flex flex-col justify-center items-center relative overflow-hidden">
            <video ref={userVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-sm">{user?.user_metadata.full_name || 'You'}</div>
        </div>
      </main>

      <footer className="mt-4 flex justify-center">
        <Button variant="destructive" size="lg" onClick={onEndInterview}>
          End Interview
        </Button>
      </footer>
    </div>
  );
}