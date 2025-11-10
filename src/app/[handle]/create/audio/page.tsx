
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
import { Checkbox } from '@/components/ui/checkbox';
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
  const [description, setDescription] = useState('');
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
  const [audioLevel, setAudioLevel] = useState(0); // Add audio level state
  const [isPublic, setIsPublic] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    
    // Set volume to maximum
    audio.volume = 1.0;
    
    const handlePlay = () => {
      console.log('Audio element started playing');
      setIsPlaying(true);
      // Ensure volume is at maximum when playing
      audio.volume = 1.0;
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
      // Set volume to maximum after metadata is loaded
      audio.volume = 1.0;
    };
    
    // Add event listeners
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Set volume to maximum immediately and after a short delay
    // (some browsers need this)
    audio.volume = 1.0;
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        console.log('Setting audio volume to maximum');
      }
    }, 500);
    
    return () => {
      // Clean up event listeners
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [recordedAudio, audioFile]); // Re-run when recordedAudio or audioFile changes

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
          autoGainControl: false, // Disable auto gain to prevent quiet recordings
          channelCount: 1, // Mono recording for better compatibility
          sampleRate: 44100 // Standard sample rate
        } 
      });
      console.log('Microphone access granted:', stream);
      
      // Set up audio visualization using a simpler approach
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        // Create a script processor for audio processing
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
        scriptProcessor.connect(audioContext.destination);
        source.connect(scriptProcessor);
        
        // Process audio data
        scriptProcessor.onaudioprocess = (event) => {
          if (!isRecording) return;
          
          const input = event.inputBuffer.getChannelData(0);
          let sum = 0;
          
          // Calculate RMS (root mean square) volume
          for (let i = 0; i < input.length; i++) {
            sum += input[i] * input[i];
          }
          
          const rms = Math.sqrt(sum / input.length);
          // Convert to a 0-100 scale with some amplification
          const scaledLevel = Math.min(100, Math.max(0, rms * 400));
          
          setAudioLevel(scaledLevel);
          
          // Log audio level occasionally for debugging
          if (Math.random() < 0.05) { // Log roughly every 20 frames
            console.log('Current audio level:', scaledLevel);
          }
        };
      } catch (err) {
        console.error('Error setting up audio visualization:', err);
        // Continue with recording even if visualization fails
      }
      
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
        
        // Clean up visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setAudioLevel(0);
      };
      
      // Request data every 250ms for smoother recording
      mediaRecorder.start(250);
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
        
        // Clean up audio visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Close audio context if it exists
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(err => {
            console.error('Error closing audio context:', err);
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
        description,
        finalAudioFile,
        duration,
        podcastName || undefined,
        isPublic // Use isPublic state
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
            <div className="h-40 bg-black/20 rounded"></div>
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
        
        
        <Card className="bg-black/20 backdrop-blur-md border-white/20">
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
                  className="bg-black/20 border-white/20 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for your audio content"
                  className="bg-black/20 border-white/20 text-white min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="podcastName" className="text-white">Podcast Name (Optional)</Label>
                <Input
                  id="podcastName"
                  value={podcastName}
                  onChange={(e) => setPodcastName(e.target.value)}
                  placeholder="Enter podcast name if applicable"
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-white">Audio</Label>
                
                {/* Simple two-button layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left side: Record/Stop button */}
                  <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                    <div className="space-y-4 w-full">
                      {isRecording ? (
                        <>
                          <Button
                            type="button"
                            variant="destructive"
                            size="lg"
                            className="w-full flex items-center justify-center"
                            onClick={stopRecording}
                          >
                            <StopCircle className="h-6 w-6 mr-2" />
                            Stop Recording
                          </Button>
                          
                          {/* Audio level visualization */}
                          <div className="mt-2">
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500 transition-all duration-100" 
                                style={{ width: `${audioLevel}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-white/70 mt-1">
                              <span>0</span>
                              <span>Recording... {audioLevel > 5 ? '🎤' : '🔇'}</span>
                              <span>100</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="w-full border-[#5B91D7] text-[#5B91D7] hover:bg-[#5B91D7]/10"
                          onClick={startRecording}
                          disabled={!!recordedAudio || !!audioFile}
                        >
                          <Mic className="h-6 w-6 mr-2" />
                          Record
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side: Upload button */}
                  <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                    <div className="w-full text-center">
                      <input
                        id="audio-file"
                        name="audioFile"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label 
                        htmlFor="audio-file" 
                        className="flex flex-col items-center justify-center cursor-pointer w-full border-2 border-dashed border-blue-600 rounded-lg p-6 transition-all hover:bg-blue-600/10"
                      >
                        <Upload className="h-8 w-8 text-blue-600 mb-2" />
                        <span className="text-blue-600 font-medium mb-1">Upload Audio</span>
                        <span className="text-white/70 text-sm">Click to browse files</span>
                      </label>
                      {audioFile && (
                        <div className="mt-3 text-sm text-white/80">
                          <span className="font-medium">Selected:</span> {audioFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Audio preview with system controls */}
                {(recordedAudio || audioFile) && (
                  <div className="mt-4 bg-black/20 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">{recordedAudio ? "Recording Preview" : "Upload Preview"}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-black/20"
                        onClick={() => {
                          setRecordedAudio(null);
                          setAudioFile(null);
                          setCurrentTime(0);
                          setProgress(0);
                          setDuration(0);
                          setIsPlaying(false);
                          if(fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    
                    <div className="mb-4 bg-black/30 rounded-lg p-3">
                      <audio 
                        ref={audioRef} 
                        src={recordedAudio ? URL.createObjectURL(recordedAudio) : audioFile ? URL.createObjectURL(audioFile) : ''} 
                        controls
                        className="w-full"
                        onLoadedMetadata={() => {
                          if (audioRef.current) {
                            audioRef.current.volume = 1.0;
                          }
                        }} 
                        onError={(e) => console.error('Audio element error:', e)}
                      />
                      <div className="mt-2 flex justify-between text-xs text-white/70">
                        <span>{formatTime(currentTime)}</span>
                        <span>Volume at maximum for playback</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox 
                        id="public"
                        checked={isPublic}
                        onCheckedChange={(checked) => setIsPublic(checked === true)}
                      />
                      <Label htmlFor="public" className="text-white cursor-pointer">
                        Public post (uncheck to make this post visible to members only)
                      </Label>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-white/70 text-xs">
                        {recordedAudio ? `${Math.round(recordedAudio.size / 1024)} KB recorded` : audioFile ? `${audioFile.name} (${Math.round(audioFile.size / 1024)} KB)` : ''}
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
                
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    