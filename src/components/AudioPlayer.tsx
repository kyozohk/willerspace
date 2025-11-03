'use client';

import { PlayCircle, PauseCircle, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect, type ChangeEvent } from 'react';

export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    // When audio ends, reset to play state
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
  
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if(audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-white">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlayPause} className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full">
        {isPlaying ? (
          <PauseCircle className="h-6 w-6" />
        ) : (
          <PlayCircle className="h-6 w-6" />
        )}
      </button>
      
      <span className="text-xs w-10 tabular-nums">{formatTime(currentTime)}</span>
      
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleTimeSliderChange}
        className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      
      <span className="text-xs w-10 tabular-nums">{formatTime(duration)}</span>
      
       <button onClick={toggleMute} className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full">
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
