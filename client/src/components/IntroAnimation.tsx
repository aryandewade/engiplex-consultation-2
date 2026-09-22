import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Volume2, VolumeX } from 'lucide-react';

interface IntroAnimationProps {
  onComplete?: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    // Check URL override ?intro=true or default to showing on direct site entrance
    try {
      if (window.location.search.includes('intro=true')) return true;
      const seen = sessionStorage.getItem('engiplex_intro_seen');
      return !seen;
    } catch {
      return true;
    }
  });

  const [isFading, setIsFading] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFinish = () => {
    setIsFading(true);
    try {
      sessionStorage.setItem('engiplex_intro_seen', 'true');
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 500);
  };

  useEffect(() => {
    // Listen for custom replay event from anywhere in the app
    const handleReplay = () => {
      setIsVisible(true);
      setIsFading(false);
      setProgress(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('replay_engiplex_intro', handleReplay);
    return () => window.removeEventListener('replay_engiplex_intro', handleReplay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    document.body.style.overflow = 'hidden';

    // Explicitly trigger play on mount
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.log('[Intro] Autoplay waiting for user gesture:', err);
      });
    }

    // Safety fallback timer (max 10s)
    const timer = setTimeout(() => {
      handleFinish();
    }, 10000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Space') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#000000' }}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-radial from-emerald-950/20 via-black to-black pointer-events-none" />

      {/* Video Container */}
      <div className="relative w-full max-w-4xl px-4 sm:px-6 flex flex-col items-center justify-center">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-zinc-800/80 bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleFinish}
            className="w-full h-auto max-h-[75vh] object-contain mx-auto block"
          >
            <source src="/engiplex-opening.mp4" type="video/mp4" />
            <source src="/engiplex%20opening.mp4" type="video/mp4" />
            <source src="/engiplex opening.mp4" type="video/mp4" />
          </video>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-between mt-4 px-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 backdrop-blur-md transition-all cursor-pointer shadow-sm"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px]">Unmute Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-semibold">Audio On</span>
              </>
            )}
          </button>

          {/* Skip Intro */}
          <button
            onClick={handleFinish}
            type="button"
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-zinc-200 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500/60 backdrop-blur-md transition-all cursor-pointer shadow-sm"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-zinc-400 group-hover:text-emerald-400" />
            <kbd className="hidden sm:inline-block ml-1 text-[10px] text-zinc-400 uppercase font-mono px-1 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
              Esc
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
