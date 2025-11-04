'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { isHandleOwner } from '@/lib/auth';
import { createAudioContent } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Mic, StopCircle, Play, Pause } from 'lucide-react';
import Link from 'next/link';

export default function CreateAudioPage() {
  const { handle } = useParams();
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [podcastName, setPodcastName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkOwnership = async () => {
      if (!user || !handle || typeof handle !== 'string') {
        setIsOwner(false);
        return;
      }

      try {
        const ownerStatus = await isHandleOwner(user.uid, handle);
        setIsOwner(ownerStatus);
        
        if (!ownerStatus) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to create content for this profile.',
            variant: 'destructive',
          });
          router.push(`/${handle}`);
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setInitialLoad(false);
      }
    };
    
    checkOwnership();
  }, [user, handle, router, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      
      // Get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        
        // Get audio duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);
        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isOwner) {
      toast({
        title: 'Error',
        description: 'You must be logged in and own this profile to create content.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!title) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!audioFile && !recordedAudio) {
      toast({
        title: 'Error',
        description: 'Please upload or record an audio file.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Convert recorded audio to File if needed
      let finalAudioFile: File;
      
      if (recordedAudio) {
        finalAudioFile = new File([recordedAudio], 'recorded-audio.wav', { type: 'audio/wav' });
      } else if (audioFile) {
        finalAudioFile = audioFile;
      } else {
        throw new Error('No audio file available');
      }
      
      await createAudioContent(
        user.uid,
        title,
        "", // Empty description
        finalAudioFile,
        duration,
        podcastName || undefined,
        true // Published by default
      );
      
      toast({
        title: 'Success',
        description: 'Your audio content has been created successfully.',
      });
      
      router.push(`/${handle}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state or redirect if not owner
  if (initialLoad) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-white/20 rounded"></div>
            <div className="h-4 w-48 bg-white/20 rounded"></div>
            <div className="h-40 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href={`/${handle}`} className="flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </div>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create Audio Content</CardTitle>
            <CardDescription className="text-white/70">
              Share your voice, music, or podcast with your audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your audio"
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              
              
              <div className="space-y-2">
                <Label htmlFor="podcastName" className="text-white">Podcast Name (Optional)</Label>
                <Input
                  id="podcastName"
                  value={podcastName}
                  onChange={(e) => setPodcastName(e.target.value)}
                  placeholder="Enter podcast name if applicable"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-white">Audio</Label>
                
                {/* Upload section */}
                <div className="border border-dashed border-white/30 rounded-lg p-6 text-center">
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="audio" className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-white/70 mb-2" />
                    <span className="text-white font-medium">Upload Audio File</span>
                    <span className="text-white/70 text-sm mt-1">
                      {audioFile ? audioFile.name : 'Click to browse or drag and drop'}
                    </span>
                  </Label>
                </div>
                
                {/* Or divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-white/70">Or</span>
                  </div>
                </div>
                
                {/* Record section */}
                <div className="border border-white/30 rounded-lg p-6 text-center">
                  {isRecording ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="lg"
                      className="flex items-center"
                      onClick={stopRecording}
                    >
                      <StopCircle className="h-6 w-6 mr-2" />
                      Stop Recording
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={startRecording}
                      disabled={!!recordedAudio}
                    >
                      <Mic className="h-6 w-6 mr-2" />
                      Start Recording
                    </Button>
                  )}
                  
                  {recordedAudio && (
                    <div className="mt-4">
                      <audio ref={audioRef} src={URL.createObjectURL(recordedAudio)} />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? 'Pause' : 'Play'} Recording
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading || (!audioFile && !recordedAudio)}
                >
                  {loading ? 'Creating...' : 'Create Audio Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
