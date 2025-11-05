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

// Format seconds to MM:SS format
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

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
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  // Monitor recordedAudio changes
  useEffect(() => {
    if (recordedAudio) {
      console.log('recordedAudio updated:', recordedAudio);
      console.log('recordedAudio size:', recordedAudio.size, 'bytes');
      console.log('recordedAudio type:', recordedAudio.type);
    }
  }, [recordedAudio]);
  
  // Sync audio element state with our UI
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => {
      console.log('Audio element started playing');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Audio element paused');
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      console.log('Audio playback ended');
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const progressValue = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      setProgress(progressValue);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log('Audio duration loaded:', audio.duration);
    };
    
    // Add event listeners
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      // Clean up event listeners
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [recordedAudio]); // Re-run when recordedAudio changes

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
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('Microphone access granted:', stream);
      
      // Try to use a more compatible MIME type if available
      const mimeType = [
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
        'audio/wav'
      ].find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
      
      console.log('Using MIME type for recording:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // 128 kbps for better quality
      });
      
      console.log('MediaRecorder created:', mediaRecorder);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available event:', e.data.size);
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', audioChunksRef.current.length);
        if (audioChunksRef.current.length === 0) {
          console.error('No audio data captured');
          toast({
            title: 'Error',
            description: 'No audio data was captured. Please try again.',
            variant: 'destructive',
          });
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
        setRecordedAudio(audioBlob);
        
        // Get audio duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);
        audio.onloadedmetadata = () => {
          console.log('Audio duration:', audio.duration);
          setDuration(audio.duration);
        };
      };
      
      // Request data every 500ms for smoother recording
      mediaRecorder.start(500);
      console.log('Recording started');
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
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Ensure we get the final data
        mediaRecorderRef.current.requestData();
        
        // Stop recording
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder stopped');
        setIsRecording(false);
        
        // Stop all audio tracks
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => {
            track.stop();
            console.log('Audio track stopped');
          });
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      console.warn('Cannot stop recording: MediaRecorder not initialized or not recording');
    }
  };

  const togglePlayback = () => {
    console.log('Toggle playback, audioRef exists:', !!audioRef.current, 'recordedAudio exists:', !!recordedAudio);
    if (!audioRef.current) {
      console.warn('Audio element reference is missing');
      return;
    }
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        console.log('Audio playback paused');
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log('Audio playback started'))
            .catch(error => console.error('Error playing audio:', error));
        }
      }
      
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
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
        console.log('Preparing recorded audio for upload, size:', recordedAudio.size);
        // Create a more descriptive filename with timestamp
        const timestamp = Date.now();
        const filename = `recording_${timestamp}.wav`;
        
        // Ensure we have the correct MIME type
        const mimeType = recordedAudio.type || 'audio/wav';
        console.log('Using MIME type:', mimeType);
        
        // Create a proper File object from the Blob
        finalAudioFile = new File([recordedAudio], filename, { 
          type: mimeType,
          lastModified: timestamp
        });
        
        console.log('Created file object:', finalAudioFile);
      } else if (audioFile) {
        console.log('Using uploaded audio file:', audioFile.name);
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
                
                {/* Simple two-button layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left side: Record/Stop button */}
                  <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                    {isRecording ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        className="w-full flex items-center justify-center"
                        onClick={stopRecording}
                      >
                        <StopCircle className="h-6 w-6 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full border-[#5B91D7] text-[#5B91D7] hover:bg-[#5B91D7]/10"
                        onClick={startRecording}
                        disabled={!!recordedAudio}
                      >
                        <Mic className="h-6 w-6 mr-2" />
                        Record
                      </Button>
                    )}
                  </div>
                  
                  {/* Right side: Upload button */}
                  <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                    <Input
                      id="audio"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Label htmlFor="audio" className="w-full">
                      <Button 
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-600/10"
                      >
                        <Upload className="h-6 w-6 mr-2" />
                        Upload
                      </Button>
                    </Label>
                  </div>
                </div>
                
                {/* Audio preview with system controls */}
                {recordedAudio && (
                  <div className="mt-4 bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">Recording Preview</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          setRecordedAudio(null);
                          setCurrentTime(0);
                          setProgress(0);
                          setDuration(0);
                          setIsPlaying(false);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    
                    {/* Audio element with system controls */}
                    <audio 
                      ref={audioRef} 
                      src={URL.createObjectURL(recordedAudio)} 
                      controls
                      className="w-full mb-4"
                      onLoadedMetadata={() => console.log('Audio element loaded metadata')} 
                      onError={(e) => console.error('Audio element error:', e)}
                    />
                    
                    <div className="flex justify-between items-center">
                      <div className="text-white/70 text-xs">
                        {Math.round(recordedAudio.size / 1024)} KB recorded
                      </div>
                      
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Audio Post'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* File upload preview */}
                {audioFile && !recordedAudio && (
                  <div className="mt-4 bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">File Upload</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          setAudioFile(null);
                          setDuration(0);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="bg-white/10 rounded p-2 mr-3">
                        <Upload className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{audioFile.name}</div>
                        <div className="text-white/70 text-xs">{Math.round(audioFile.size / 1024)} KB</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Audio Post'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
