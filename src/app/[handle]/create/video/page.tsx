'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { isHandleOwner } from '@/lib/auth';
import { createVideoContent } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Video as VideoIcon, StopCircle, Play, Pause, Camera } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CreateVideoPage() {
  const { handle } = useParams();
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [recordedThumbnail, setRecordedThumbnail] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  
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

  // Clean up media streams when component unmounts
  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      
      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setDuration(video.duration);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      videoStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];
      
      // Display preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      
      mediaRecorder.ondataavailable = (e) => {
        videoChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setRecordedVideo(videoBlob);
        
        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setDuration(video.duration);
        };
        video.src = URL.createObjectURL(videoBlob);
        
        // Stop preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Could not access camera or microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const captureThumbnail = () => {
    if (!videoPreviewRef.current && !videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    const video = videoPreviewRef.current || videoRef.current;
    
    if (!video) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        setRecordedThumbnail(blob);
        setThumbnailPreview(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.95);
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
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
    
    if (!videoFile && !recordedVideo) {
      toast({
        title: 'Error',
        description: 'Please upload or record a video.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!thumbnailFile && !recordedThumbnail) {
      toast({
        title: 'Error',
        description: 'Please upload or capture a thumbnail.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Convert recorded video and thumbnail to File if needed
      let finalVideoFile: File;
      let finalThumbnailFile: File;
      
      if (recordedVideo) {
        finalVideoFile = new File([recordedVideo], 'recorded-video.webm', { type: 'video/webm' });
      } else if (videoFile) {
        finalVideoFile = videoFile;
      } else {
        throw new Error('No video file available');
      }
      
      if (recordedThumbnail) {
        finalThumbnailFile = new File([recordedThumbnail], 'thumbnail.jpg', { type: 'image/jpeg' });
      } else if (thumbnailFile) {
        finalThumbnailFile = thumbnailFile;
      } else {
        throw new Error('No thumbnail file available');
      }
      
      await createVideoContent(
        user.uid,
        title,
        "", // Empty description
        finalVideoFile,
        finalThumbnailFile,
        duration,
        true // Published by default
      );
      
      toast({
        title: 'Success',
        description: 'Your video content has been created successfully.',
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
            <CardTitle className="text-2xl text-white">Create Video Content</CardTitle>
            <CardDescription className="text-white/70">
              Share videos with your audience
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
                  placeholder="Enter a title for your video"
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              
              
              <div className="space-y-4">
                <Label className="text-white">Video</Label>
                
                {/* Upload section */}
                <div className="border border-dashed border-white/30 rounded-lg p-6 text-center">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="video" className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-white/70 mb-2" />
                    <span className="text-white font-medium">Upload Video File</span>
                    <span className="text-white/70 text-sm mt-1">
                      {videoFile ? videoFile.name : 'Click to browse or drag and drop'}
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
                  {/* Video preview */}
                  {isRecording && (
                    <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
                      <video 
                        ref={videoPreviewRef} 
                        className="w-full h-64 object-contain"
                        muted
                      />
                      <div className="absolute top-2 right-2">
                        <div className="animate-pulse flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-white text-xs">Recording</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {recordedVideo && !isRecording && (
                    <div className="mb-4 bg-black rounded-lg overflow-hidden">
                      <video 
                        ref={videoRef} 
                        src={URL.createObjectURL(recordedVideo)} 
                        className="w-full h-64 object-contain"
                        controls={false}
                      />
                    </div>
                  )}
                  
                  {/* Recording controls */}
                  <div className="flex justify-center space-x-4">
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
                        disabled={!!recordedVideo}
                      >
                        <VideoIcon className="h-6 w-6 mr-2" />
                        Start Recording
                      </Button>
                    )}
                    
                    {recordedVideo && !isRecording && (
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
                    )}
                  </div>
                </div>
              </div>
              
              {/* Thumbnail section */}
              <div className="space-y-4">
                <Label className="text-white">Thumbnail</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Upload thumbnail */}
                  <div className="border border-dashed border-white/30 rounded-lg p-6 text-center">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                    />
                    <Label htmlFor="thumbnail" className="cursor-pointer flex flex-col items-center justify-center h-full">
                      <Upload className="h-8 w-8 text-white/70 mb-2" />
                      <span className="text-white font-medium">Upload Thumbnail</span>
                    </Label>
                  </div>
                  
                  {/* Capture thumbnail from video */}
                  <div className="border border-white/30 rounded-lg p-6 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 h-full w-full flex flex-col items-center justify-center"
                      onClick={captureThumbnail}
                      disabled={!videoRef.current && !videoPreviewRef.current}
                    >
                      <Camera className="h-8 w-8 text-white/70 mb-2" />
                      <span className="text-white font-medium">Capture from Video</span>
                    </Button>
                  </div>
                </div>
                
                {/* Thumbnail preview */}
                {thumbnailPreview && (
                  <div className="mt-4">
                    <div className="bg-black rounded-lg overflow-hidden w-48 h-32 mx-auto">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading || (!videoFile && !recordedVideo) || (!thumbnailFile && !recordedThumbnail)}
                >
                  {loading ? 'Creating...' : 'Create Video Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
