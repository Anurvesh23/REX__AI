
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Mic } from 'lucide-react';

interface DeviceSetupProps {
  interviewTitle: string;
  onSetupComplete: (stream: MediaStream) => void;
  onCancel: () => void;
}

export default function DeviceSetup({ interviewTitle, onSetupComplete, onCancel }: DeviceSetupProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedAudio, setSelectedAudio] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Request permission
        const devices = await navigator.mediaDevices.enumerateDevices();
        const video = devices.filter((d) => d.kind === 'videoinput');
        const audio = devices.filter((d) => d.kind === 'audioinput');
        setVideoDevices(video);
        setAudioDevices(audio);
        if (video.length > 0) setSelectedVideo(video[0].deviceId);
        if (audio.length > 0) setSelectedAudio(audio[0].deviceId);
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    const startStream = async () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (selectedVideo && selectedAudio) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: selectedVideo } },
            audio: { deviceId: { exact: selectedAudio } },
          });
          setStream(newStream);
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
          }
        } catch (error) {
          console.error('Error starting media stream:', error);
        }
      }
    };
    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedVideo, selectedAudio]);

  const handleContinue = () => {
    if (stream) {
      onSetupComplete(stream);
    }
  };

  return (
    <div className="bg-slate-800 text-white min-h-screen flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-4xl mx-auto">
        <div className="text-left mb-4">
            <h1 className="text-xl font-bold">{interviewTitle}</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover"></video>
          </div>
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle>Device Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Camera</label>
                <Select value={selectedVideo} onValueChange={setSelectedVideo}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-600">
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium">Mic</label>
                <Select value={selectedAudio} onValueChange={setSelectedAudio}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-600">
                    {audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={onCancel} className="w-full bg-transparent text-white">Cancel</Button>
                <Button onClick={handleContinue} className="w-full">Continue</Button>
              </div>
            </CardContent>
          </Card>
        </div>
       </div>
    </div>
  );
}