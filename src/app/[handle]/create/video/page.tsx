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

// Check if browser supports video recording
const checkMediaRecorderSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if MediaRecorder exists
  if (!window.MediaRecorder) {
    console.error('MediaRecorder not supported in this browser');
    return false;
  }
  
  // Check if getUserMedia is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('getUserMedia not supported in this browser');
    return false;
  }
  
  return true;
};

export default function CreateVideoPage() {
  const { handle } = useParams();
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [isMediaRecorderSupported, setIsMediaRecorderSupported] = useState(true);
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

  // Check for MediaRecorder support when component mounts
  useEffect(() => {
    setIsMediaRecorderSupported(checkMediaRecorderSupport());
  }, []);
  
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
    // Check if MediaRecorder is supported
    if (!isMediaRecorderSupported) {
      toast({
        title: 'Error',
        description: 'Your browser does not support video recording. Please try uploading a video file instead.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      console.log('Requesting camera and microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      }).catch(error => {
        console.error('Error accessing media devices:', error);
        toast({
          title: 'Permission Error',
          description: 'Could not access camera or microphone. Please check your browser permissions.',
          variant: 'destructive',
        });
        throw error;
      });
      
      console.log('Camera and microphone access granted');
      videoStreamRef.current = stream;
      
      // Try to use a more compatible MIME type if available
      const mimeType = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ].find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      
      console.log('Using MIME type for recording:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });
      
      console.log('MediaRecorder created');
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];
      
      // Display preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      
      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available event, size:', e.data.size);
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', videoChunksRef.current.length);
        if (videoChunksRef.current.length === 0) {
          console.error('No video data captured');
          toast({
            title: 'Error',
            description: 'No video data was captured. Please try again.',
            variant: 'destructive',
          });
          return;
        }
        
        const videoBlob = new Blob(videoChunksRef.current, { type: mimeType });
        console.log('Video blob created:', videoBlob.size, 'bytes, type:', videoBlob.type);
        setRecordedVideo(videoBlob);
        
        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          console.log('Video duration:', video.duration);
          setDuration(video.duration);
        };
        video.src = URL.createObjectURL(videoBlob);
        
        // Stop preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
        
        // Auto-capture thumbnail from the recorded video
        setTimeout(() => {
          if (videoRef.current) {
            captureThumbnail();
          }
        }, 500);
      };
      
      // Request data every 1 second for smoother recording
      mediaRecorder.start(1000);
      console.log('Recording started');
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
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Ensure we get the final data
        mediaRecorderRef.current.requestData();
        
        // Stop recording
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder stopped');
        setIsRecording(false);
        
        // Stop all tracks
        if (videoStreamRef.current) {
          videoStreamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log(`${track.kind} track stopped`);
          });
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast({
          title: 'Error',
          description: 'Problem stopping the recording. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      console.warn('Cannot stop recording: MediaRecorder not initialized or not recording');
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
      console.log('Preparing files for upload...');
      // Convert recorded video and thumbnail to File if needed
      let finalVideoFile: File;
      let finalThumbnailFile: File;
      
      if (recordedVideo) {
        console.log('Using recorded video, size:', recordedVideo.size);
        // Create a more descriptive filename with timestamp
        const timestamp = Date.now();
        const filename = `recording_${timestamp}.webm`;
        
        // Ensure we have the correct MIME type
        const mimeType = recordedVideo.type || 'video/webm';
        console.log('Using video MIME type:', mimeType);
        
        try {
          // Create a proper File object from the Blob with a simple name
          // Complex filenames can cause issues with CORS and URL encoding
          finalVideoFile = new File([recordedVideo], `video_${timestamp}.webm`, { 
            type: mimeType,
            lastModified: timestamp
          });
          
          console.log('Created video file object:', finalVideoFile);
        } catch (error) {
          console.error('Error creating File from Blob:', error);
          toast({
            title: 'Error',
            description: 'Failed to process recorded video. Please try uploading a video file instead.',
            variant: 'destructive',
          });
          throw error;
        }
      } else if (videoFile) {
        console.log('Using uploaded video file:', videoFile.name);
        finalVideoFile = videoFile;
      } else {
        throw new Error('No video file available');
      }
      
      if (recordedThumbnail) {
        console.log('Using captured thumbnail, size:', recordedThumbnail.size);
        // Create a more descriptive filename with timestamp
        const timestamp = Date.now();
        
        try {
          // Create a proper File object from the Blob with a simple name
          // Complex filenames can cause issues with CORS and URL encoding
          finalThumbnailFile = new File([recordedThumbnail], `thumb_${timestamp}.jpg`, { 
            type: 'image/jpeg',
            lastModified: timestamp
          });
          
          console.log('Created thumbnail file object:', finalThumbnailFile);
        } catch (error) {
          console.error('Error creating thumbnail File from Blob:', error);
          toast({
            title: 'Error',
            description: 'Failed to process thumbnail. Please try uploading a thumbnail image instead.',
            variant: 'destructive',
          });
          throw error;
        }
      } else if (thumbnailFile) {
        console.log('Using uploaded thumbnail file:', thumbnailFile.name);
        finalThumbnailFile = thumbnailFile;
      } else {
        throw new Error('No thumbnail file available');
      }
      
      try {
        console.log('Starting video upload process...');
        await createVideoContent(
          user.uid,
          title,
          "", // Empty description
          finalVideoFile,
          finalThumbnailFile,
          duration,
          true // Published by default
        );
        
        console.log('Video upload completed successfully');
        toast({
          title: 'Success',
          description: 'Your video content has been created successfully.',
        });
        
        router.push(`/${handle}`);
      } catch (uploadError: any) {
        console.error('Error during video upload:', uploadError);
        
        // Check for CORS errors
        if (uploadError.message && uploadError.message.includes('CORS')) {
          toast({
            title: 'Upload Error',
            description: 'CORS error occurred. Please try a smaller video file or contact support.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Upload Error',
            description: uploadError.message || 'Failed to upload video. Please try again with a smaller file.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('General error in form submission:', error);
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
                
                {/* Simple two-button layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left side: Record/Stop button */}
                  <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                    {!isMediaRecorderSupported ? (
                      <div className="text-center">
                        <div className="text-red-500 mb-2">Recording not supported</div>
                        <div className="text-white/70 text-xs">Your browser doesn't support video recording</div>
                      </div>
                    ) : isRecording ? (
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
                        className="w-full border-[#FFB619] text-[#FFB619] hover:bg-[#FFB619]/10"
                        onClick={startRecording}
                        disabled={!!recordedVideo}
                      >
                        <VideoIcon className="h-6 w-6 mr-2" />
                        Record
                      </Button>
                    )}
                  </div>
                  
                  {/* Right side: Upload button */}
                  <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <Label htmlFor="video" className="w-full">
                      <Button 
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full border-red-600 text-red-600 hover:bg-red-600/10"
                      >
                        <Upload className="h-6 w-6 mr-2" />
                        Upload
                      </Button>
                    </Label>
                  </div>
                </div>
                
                {/* Video preview */}
                {isRecording && (
                  <div className="mt-4 bg-black rounded-lg overflow-hidden">
                    <div className="relative">
                      <video 
                        ref={videoPreviewRef} 
                        className="w-full h-64 object-contain"
                        muted
                      />
                      <div className="absolute top-2 right-2">
                        <div className="animate-pulse flex items-center bg-black/50 px-2 py-1 rounded">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-white text-xs">LIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Recorded video preview with system controls */}
                {recordedVideo && !isRecording && (
                  <div className="mt-4 bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">Video Preview</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          setRecordedVideo(null);
                          setRecordedThumbnail(null);
                          setThumbnailPreview(null);
                          setDuration(0);
                          setIsPlaying(false);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    
                    <div className="bg-black rounded-lg overflow-hidden mb-4">
                      <video 
                        ref={videoRef} 
                        src={URL.createObjectURL(recordedVideo)} 
                        className="w-full"
                        controls
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-white/70 text-xs">
                        {Math.round(recordedVideo.size / 1024)} KB recorded
                      </div>
                      
                      <Button
                        type="submit"
                        className="bg-[#FFB619] hover:bg-[#FFB619]/90 text-white"
                        disabled={loading || !thumbnailPreview}
                      >
                        {loading ? 'Creating...' : 'Create Video Post'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Uploaded video preview */}
                {videoFile && !recordedVideo && (
                  <div className="mt-4 bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">File Upload</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          setVideoFile(null);
                          setDuration(0);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="bg-white/10 rounded p-2 mr-3">
                        <VideoIcon className="h-5 w-5 text-[#FFB619]" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{videoFile.name}</div>
                        <div className="text-white/70 text-xs">{Math.round(videoFile.size / 1024)} KB</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-[#FFB619] hover:bg-[#FFB619]/90 text-white"
                        disabled={loading || !thumbnailPreview}
                      >
                        {loading ? 'Creating...' : 'Create Video Post'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Thumbnail section - only show if we have a video */}
              {(recordedVideo || videoFile) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-white">Thumbnail</Label>
                    {thumbnailPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          setThumbnailFile(null);
                          setRecordedThumbnail(null);
                          setThumbnailPreview(null);
                        }}
                      >
                        Reset Thumbnail
                      </Button>
                    )}
                  </div>
                  
                  {/* Thumbnail actions */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Upload thumbnail */}
                    <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="hidden"
                      />
                      <Label htmlFor="thumbnail" className="w-full">
                        <Button 
                          type="button"
                          variant="outline"
                          size="lg"
                          className="w-full border-[#FFB619] text-[#FFB619] hover:bg-[#FFB619]/10"
                        >
                          <Upload className="h-6 w-6 mr-2" />
                          Upload Thumbnail
                        </Button>
                      </Label>
                    </div>
                    
                    {/* Capture thumbnail from video */}
                    <div className="border border-white/30 rounded-lg p-6 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full border-[#FFB619] text-[#FFB619] hover:bg-[#FFB619]/10"
                        onClick={captureThumbnail}
                        disabled={!videoRef.current && !videoPreviewRef.current}
                      >
                        <Camera className="h-6 w-6 mr-2" />
                        Capture from Video
                      </Button>
                    </div>
                  </div>
                  
                  {/* Thumbnail preview */}
                  {thumbnailPreview && (
                    <div className="mt-4 bg-white/10 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Thumbnail Preview</h4>
                      <div className="bg-black rounded-lg overflow-hidden mx-auto">
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="w-full object-contain max-h-48"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Submit button is now next to each preview */}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
