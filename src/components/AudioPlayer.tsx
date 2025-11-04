'use client';

import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect, type ChangeEvent } from 'react';

export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (isFinite(audio.duration)) {
          setDuration(audio.duration);
      }
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnd);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if(audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full text-foreground">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button 
        onClick={togglePlayPause} 
        className="flex items-center justify-center rounded-full bg-primary/20 text-primary h-8 w-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/30 transition-colors"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 translate-x-px" />
        )}
      </button>
      
      <div className="flex items-center gap-2 sm:gap-3 flex-grow">
        <div className="flex-grow relative h-1.5 bg-muted rounded-full cursor-pointer group">
            <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleTimeSliderChange}
                className="w-full h-full bg-transparent appearance-none cursor-pointer absolute inset-0 z-10"
            />
             <div className="absolute top-0 left-0 h-full bg-primary/50 rounded-full pointer-events-none" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
             <div 
                className="absolute top-1/2 -translate-y-1/2 h-2 w-2 sm:h-3 sm:w-3 bg-primary rounded-full pointer-events-none -translate-x-1/2 transition-opacity opacity-0 group-hover:opacity-100" 
                style={{ left: `${(currentTime / duration) * 100}%` }}>
            </div>
        </div>

        <span className="text-xs w-20 sm:w-24 tabular-nums text-muted-foreground text-right">
          <span className="hidden sm:inline">{formatTime(currentTime)}/</span>
          <span>{formatTime(duration)}</span>
        </span>
      </div>
    </div>
  );
}
