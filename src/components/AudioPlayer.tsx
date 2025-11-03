'use client';

import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect, type ChangeEvent } from 'react';

export function AudioPlayer({ src, size = 'default' }: { src: string, size?: 'small' | 'default' }) {
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

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
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

  const playButtonSize = size === 'small' ? 'h-6 w-6' : 'h-8 w-8';
  const iconSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-2 text-foreground">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button 
        onClick={togglePlayPause} 
        className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${playButtonSize}`}
      >
        {isPlaying ? (
          <Pause className={iconSize} />
        ) : (
          <Play className={`${iconSize} translate-x-px`} />
        )}
      </button>
      
      <div className="flex items-center gap-2 flex-grow bg-muted/50 rounded-full px-3 h-8">
        <span className="text-xs w-10 tabular-nums text-muted-foreground">{formatTime(currentTime)}</span>
        
        <div className="flex-grow relative h-1 bg-muted rounded-full">
            <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleTimeSliderChange}
                className="w-full h-1 bg-transparent appearance-none cursor-pointer group"
                style={{ background: 'transparent' }}
            />
             <div className="absolute top-0 left-0 h-1 bg-primary rounded-full pointer-events-none" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
        </div>

        <span className="text-xs w-10 tabular-nums text-muted-foreground">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
