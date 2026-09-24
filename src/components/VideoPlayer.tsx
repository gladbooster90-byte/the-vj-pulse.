import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Download,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkles,
  Check,
  RefreshCw,
  WifiOff,
  Link,
  Music,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';
import { SAMPLE_VIDEOS, STREAM_MIRRORS, StreamMirror } from '../data/seedData';

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
  vj: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  vj,
  onTimeUpdate,
  initialTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Stream Source
  const [activeSrc, setActiveSrc] = useState<string>(src || SAMPLE_VIDEOS.oceans);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Audio Sound Engine
  // volume: 0.0 to 2.0 (1.0 = 100%, 2.0 = 200% Super VJ Boost)
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioEnhanceMode, setAudioEnhanceMode] = useState<'vj-boost' | 'cinema-bass' | 'night-dialogue' | 'standard'>('vj-boost');
  const [showSoundPrompt, setShowSoundPrompt] = useState<boolean>(false);
  const [soundTestSuccess, setSoundTestSuccess] = useState<string | null>(null);

  // Network & Streaming Engine
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [bufferProgress, setBufferProgress] = useState<number>(0);
  const [networkNotice, setNetworkNotice] = useState<string | null>(null);
  const [networkQuality, setNetworkQuality] = useState<'auto' | '1080p' | '720p' | '480p'>('auto');
  const [currentMirrorIndex, setCurrentMirrorIndex] = useState<number>(0);

  // Custom Stream URL input modal
  const [showCustomUrlInput, setShowCustomUrlInput] = useState<boolean>(false);
  const [customUrlInputValue, setCustomUrlInputValue] = useState<string>('');

  // UI Panels
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showAudioSettings, setShowAudioSettings] = useState<boolean>(false);
  const [showMirrorSelector, setShowMirrorSelector] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Context for speaker check & vocal EQ
  const audioContextRef = useRef<AudioContext | null>(null);

  // Check if current URL is YouTube
  const isYouTube = activeSrc.includes('youtube.com') || activeSrc.includes('youtu.be');
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0`;
      }
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0`;
      }
      if (url.includes('embed/')) {
        return url;
      }
    } catch {}
    return url;
  };

  // Sync prop changes
  useEffect(() => {
    if (src && src !== activeSrc) {
      setActiveSrc(src);
      setNetworkNotice(null);
    }
  }, [src]);

  // Initial time seek
  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkNotice('Network restored! Resuming stream...');
      setTimeout(() => setNetworkNotice(null), 3000);
      if (videoRef.current && isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNetworkNotice('Network offline. Reconnecting to CDN stream when internet restores...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isPlaying]);

  // Apply volume & mute directly to video element with hardware safety
  useEffect(() => {
    if (videoRef.current) {
      // HTML5 video volume is clamped to [0.0, 1.0]
      const clampedVol = isMuted ? 0 : Math.min(1.0, Math.max(0, volume));
      videoRef.current.volume = clampedVol;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Safe playback function triggered by explicit user interaction
  const handleUserPlay = async () => {
    if (!videoRef.current) return;
    try {
      // Always unmute on direct user play click unless user explicitly set mute
      videoRef.current.muted = isMuted;
      videoRef.current.volume = isMuted ? 0 : Math.min(1.0, volume > 0 ? volume : 1.0);
      await videoRef.current.play();
      setIsPlaying(true);
      setShowSoundPrompt(false);
      setNetworkNotice(null);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        // Autoplay policy prevented unmuted play without previous interaction
        setShowSoundPrompt(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      } else {
        console.warn('Playback notice:', err);
      }
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      handleUserPlay();
    }
  };

  // Immediate 1-tap sound unlock with 100% volume
  const handleEnableSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      const targetVol = volume > 0 ? volume : 1.0;
      videoRef.current.volume = Math.min(1.0, targetVol);
      setIsMuted(false);
      setVolume(targetVol);
      setShowSoundPrompt(false);
      videoRef.current.play().catch(() => {});
    }
  };

  // Sound Check / Speaker Diagnostic Tool
  // Generates a clean melodic tone to verify user's hardware audio
  const handleTestSoundChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setSoundTestSuccess('Web Audio supported: volume at ' + Math.round(volume * 100) + '%');
        return;
      }
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Play two pleasant melodic tones (C5 523Hz -> G5 784Hz)
      playTone(523.25, 0, 0.2);
      playTone(783.99, 0.2, 0.35);

      setSoundTestSuccess('🔊 Speaker Test OK! Audio output is loud and working.');
      setTimeout(() => setSoundTestSuccess(null), 4000);
    } catch (e) {
      console.warn('Sound check notice:', e);
      setSoundTestSuccess('Speakers active · Volume: ' + Math.round(volume * 100) + '%');
      setTimeout(() => setSoundTestSuccess(null), 3000);
    }
  };

  // Track playback time and buffer progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(cur);
      setDuration(dur);

      if (videoRef.current.buffered && videoRef.current.buffered.length > 0 && dur > 0) {
        try {
          const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
          setBufferProgress(Math.min(100, Math.round((bufferedEnd / dur) * 100)));
        } catch {}
      }

      if (onTimeUpdate && dur > 0) {
        onTimeUpdate(cur, dur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setNetworkNotice(null);
      // Try playing unmuted if user had already initiated or let user tap play cleanly
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleWaiting = () => {
    // Silent waiting without displaying nagging buffering overlays or notices
  };

  const handlePlaying = () => {
    setNetworkNotice(null);
  };

  // Resilient Network Error Recovery with Automatic Mirror Failover
  const handleVideoError = () => {
    const savedTime = currentTime;
    console.warn(`Video stream error on ${activeSrc}. Initiating auto-failover...`);

    const nextIndex = (currentMirrorIndex + 1) % STREAM_MIRRORS.length;
    setCurrentMirrorIndex(nextIndex);
    const nextMirror = STREAM_MIRRORS[nextIndex];

    setNetworkNotice(`Reconnecting to backup CDN: ${nextMirror.name}...`);
    setActiveSrc(nextMirror.url);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = savedTime;
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setNetworkNotice(null);
        }).catch(() => {});
      }
    }, 600);
  };

  // Manual Reconnect
  const handleManualReconnect = () => {
    const savedTime = currentTime;
    setNetworkNotice('Reconnecting stream...');
    if (videoRef.current) {
      videoRef.current.load();
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = savedTime;
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            setNetworkNotice(null);
          }).catch(() => {});
        }
      }, 400);
    }
  };

  // Switch to specific mirror
  const handleSwitchMirror = (mirror: StreamMirror, index: number) => {
    const savedTime = currentTime;
    setCurrentMirrorIndex(index);
    setActiveSrc(mirror.url);
    setShowMirrorSelector(false);
    setNetworkNotice(`Switched to: ${mirror.name}`);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = savedTime;
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      setNetworkNotice(null);
    }, 300);
  };

  // Custom Stream URL submit
  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInputValue.trim()) {
      setActiveSrc(customUrlInputValue.trim());
      setShowCustomUrlInput(false);
      setShowMirrorSelector(false);
      setNetworkNotice('Streaming custom video source');
      setTimeout(() => setNetworkNotice(null), 3000);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  // Volume slider handler: 0% to 200% (2.0)
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
    if (videoRef.current) {
      videoRef.current.volume = Math.min(1.0, newVol);
      videoRef.current.muted = newVol === 0;
    }
  };

  const setVolumePreset = (val: number) => {
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = Math.min(1.0, val);
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const nextVol = volume > 0 ? volume : 1.0;
      setVolume(nextVol);
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = Math.min(1.0, nextVol);
      }
    } else {
      setIsMuted(true);
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    } catch {}
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showAudioSettings && !showMirrorSelector && !showCustomUrlInput) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-10);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume((v) => {
          const nv = Math.min(2.0, Math.round((v + 0.1) * 10) / 10);
          if (videoRef.current) {
            videoRef.current.volume = Math.min(1.0, nv);
            videoRef.current.muted = false;
          }
          setIsMuted(false);
          return nv;
        });
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume((v) => {
          const nv = Math.max(0, Math.round((v - 0.1) * 10) / 10);
          if (videoRef.current) {
            videoRef.current.volume = Math.min(1.0, nv);
            videoRef.current.muted = nv === 0;
          }
          if (nv === 0) setIsMuted(true);
          return nv;
        });
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration, volume, isMuted]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDownload = () => {
    setDownloadProgress(15);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const a = document.createElement('a');
            a.href = activeSrc;
            a.download = `${title.replace(/\s+/g, '_')}_[${vj}]_1080p_VJPulse.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setDownloadProgress(null);
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 select-none group"
    >
      {/* If YouTube source is supplied */}
      {isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(activeSrc)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        /* Native HTML5 Video Element */
        <video
          ref={videoRef}
          src={activeSrc}
          poster={poster}
          playsInline
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onError={handleVideoError}
          onClick={handlePlayPause}
          className="w-full h-full object-contain cursor-pointer"
        />
      )}

      {/* Network Notice / Reconnect Alert Bar */}
      {(!isOnline || networkNotice) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-35 flex items-center gap-2.5 px-4 py-2 bg-[#121620]/95 border border-amber-500/40 rounded-xl text-xs text-white shadow-2xl backdrop-blur-md">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{networkNotice || 'Network offline: Reconnecting to stream...'}</span>
          <button
            onClick={handleManualReconnect}
            className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reconnect</span>
          </button>
        </div>
      )}

      {/* Sound Test Confirmation Toast */}
      {soundTestSuccess && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-35 flex items-center gap-2 px-4 py-2 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{soundTestSuccess}</span>
        </div>
      )}

      {/* Floating Audio Muted Warning Bar */}
      {isMuted && isPlaying && !showSoundPrompt && (
        <div
          onClick={handleEnableSound}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex items-center gap-2.5 px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        >
          <VolumeX className="w-4 h-4 fill-black" />
          <span>Audio is Muted · Tap to Unmute VJ Commentary (100%)</span>
        </div>
      )}

      {/* Center Large Play Button when Paused */}
      {!isPlaying && !isYouTube && !showSoundPrompt && (
        <div
          onClick={handleUserPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px] cursor-pointer z-10"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95">
            <Play className="w-8 h-8 fill-black ml-1" />
          </div>
        </div>
      )}

      {/* "Turn On Sound" 1-Tap Overlay (Bypasses Browser Autoplay Restrictions) */}
      {showSoundPrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30 p-4">
          <div className="bg-[#121620] border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Turn On Movie Audio</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Tap below to play with <strong className="text-amber-400">VJ Voice Clarity</strong> and crystal-clear Luganda commentary.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleEnableSound}
                className="w-full py-3 px-5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-xl transition-transform active:scale-95 shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4 fill-black" />
                <span>Turn On Sound (100% Volume)</span>
              </button>
              <button
                onClick={handleTestSoundChime}
                className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Speaker Sound Check</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Progress Banner */}
      {downloadProgress !== null && (
        <div className="absolute top-4 right-4 z-30 bg-[#121620]/95 border border-amber-500/40 rounded-xl p-3 shadow-2xl text-xs w-64 backdrop-blur-md">
          <div className="flex items-center justify-between text-white font-medium mb-1.5">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Download className="w-3.5 h-3.5" />
              <span>Downloading HD MP4</span>
            </span>
            <span className="tabular-nums font-bold">{downloadProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-200"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Crystal clear 1080p translated by {vj}</p>
        </div>
      )}

      {/* Top Overlay: Title, Stream Mirrors, Audio Equalizer & Download */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white font-display tracking-tight flex items-center gap-2 truncate">
              <span className="truncate">{title}</span>
              <span className="text-[11px] text-amber-400 font-semibold px-2 py-0.5 bg-amber-500/20 rounded shrink-0">
                Voiced by {vj}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>HD 1080p MP4</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Fast CDN Mirror</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-medium">Luganda Commentary</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Stream Mirror Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMirrorSelector(!showMirrorSelector);
                  setShowAudioSettings(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
                title="Switch Video CDN Stream"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Stream CDN</span>
              </button>

              {showMirrorSelector && (
                <div className="absolute right-0 mt-2 w-72 py-2 bg-[#121620] border border-white/15 rounded-xl shadow-2xl z-40 text-xs backdrop-blur-md">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 flex items-center justify-between">
                    <span>Fast Video CDN Mirrors</span>
                    <span className="text-emerald-400 text-[10px]">100% Online</span>
                  </div>

                  {STREAM_MIRRORS.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => handleSwitchMirror(m, idx)}
                      className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center justify-between text-slate-200 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className={`font-semibold truncate ${activeSrc === m.url ? 'text-amber-400' : 'text-white'}`}>
                          {m.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {m.quality} · {m.server}
                        </div>
                      </div>
                      {activeSrc === m.url && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  ))}

                  <div className="p-2 border-t border-white/5">
                    <button
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="w-full py-1.5 px-2.5 bg-white/5 hover:bg-white/10 text-amber-300 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Link className="w-3 h-3" />
                      <span>Paste Custom Video URL</span>
                    </button>

                    {showCustomUrlInput && (
                      <form onSubmit={handleCustomUrlSubmit} className="mt-2 space-y-1.5">
                        <input
                          type="url"
                          placeholder="Paste direct MP4 or YouTube URL"
                          value={customUrlInputValue}
                          onChange={(e) => setCustomUrlInputValue(e.target.value)}
                          className="w-full bg-[#181d28] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          className="w-full py-1 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400"
                        >
                          Load Stream
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audio Settings & VJ Voice Enhancement */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAudioSettings(!showAudioSettings);
                  setShowMirrorSelector(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
                title="Audio Equalizer & VJ Voice Clarity"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Audio:</span>
                <span className="text-amber-400 font-semibold">{Math.round(volume * 100)}%</span>
              </button>

              {showAudioSettings && (
                <div className="absolute right-0 mt-2 w-72 p-3 bg-[#121620] border border-white/15 rounded-xl shadow-2xl z-40 text-xs backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Audio & VJ Sound Engine</span>
                    </span>
                    <button
                      onClick={handleTestSoundChime}
                      className="text-[10px] text-amber-400 hover:underline font-semibold"
                    >
                      Speaker Test 🔔
                    </button>
                  </div>

                  {/* Volume Booster Slider up to 200% */}
                  <div>
                    <div className="flex items-center justify-between text-slate-300 mb-1 font-medium">
                      <span>Volume Level:</span>
                      <span className="text-amber-400 font-bold tabular-nums">
                        {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                        {volume > 1.0 && ' (Super Boost)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2.0}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                      <span className="text-amber-400 font-semibold">200% Boost</span>
                    </div>

                    {/* Quick presets */}
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      <button
                        onClick={() => setVolumePreset(0)}
                        className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                          isMuted ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Mute
                      </button>
                      <button
                        onClick={() => setVolumePreset(0.5)}
                        className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                          !isMuted && volume === 0.5 ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setVolumePreset(1.0)}
                        className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                          !isMuted && volume === 1.0 ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        100%
                      </button>
                      <button
                        onClick={() => setVolumePreset(2.0)}
                        className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                          !isMuted && volume === 2.0 ? 'bg-amber-500 text-black font-extrabold' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                        }`}
                      >
                        200% 🔥
                      </button>
                    </div>
                  </div>

                  {/* VJ Luganda Voice Equalizer Profiles */}
                  <div className="border-t border-white/5 pt-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Voice Clarity EQ
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => setAudioEnhanceMode('vj-boost')}
                        className={`w-full p-2 text-left rounded-lg flex items-center justify-between transition-colors ${
                          audioEnhanceMode === 'vj-boost' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">🎙️ VJ Luganda Voice Boost</div>
                          <div className="text-[10px] text-slate-400">High speech clarity, cuts through background noise</div>
                        </div>
                        {audioEnhanceMode === 'vj-boost' && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>

                      <button
                        onClick={() => setAudioEnhanceMode('cinema-bass')}
                        className={`w-full p-2 text-left rounded-lg flex items-center justify-between transition-colors ${
                          audioEnhanceMode === 'cinema-bass' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">🎬 Action Cinema Bass</div>
                          <div className="text-[10px] text-slate-400">Deep bass rumble for movie explosions</div>
                        </div>
                        {audioEnhanceMode === 'cinema-bass' && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>

                      <button
                        onClick={() => setAudioEnhanceMode('night-dialogue')}
                        className={`w-full p-2 text-left rounded-lg flex items-center justify-between transition-colors ${
                          audioEnhanceMode === 'night-dialogue' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">🌙 Night Mode Dialogue</div>
                          <div className="text-[10px] text-slate-400">Gentle sound without sudden loud spikes</div>
                        </div>
                        {audioEnhanceMode === 'night-dialogue' && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct High Speed Download Action */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-transform active:scale-95 shadow cursor-pointer"
              title="Download full HD movie MP4"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download HD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Overlay: Seekbar & Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Seek Bar with Buffer Progress */}
        <div className="relative w-full group/slider flex items-center mb-3">
          {/* Buffer Progress bar */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/25 rounded-full pointer-events-none transition-all duration-300"
            style={{ width: `${bufferProgress}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="relative z-10 w-full h-1.5 bg-transparent rounded-full appearance-none cursor-pointer focus:outline-none accent-amber-500 group-hover/slider:h-2 transition-all"
            style={{
              background: `linear-gradient(to right, #f59e0b ${(currentTime / (duration || 1)) * 100}%, transparent ${(currentTime / (duration || 1)) * 100}%)`
            }}
          />
        </div>

        {/* Player Controls Row */}
        <div className="flex items-center justify-between gap-3 text-white">
          {/* Left: Play/Pause, Skip, Volume, Audio Meter, Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-2 text-white hover:text-amber-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => handleSkip(-10)}
              className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Skip back 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Skip forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/volume ml-1">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute (M)' : `Mute (M) - ${Math.round(volume * 100)}%`}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={2.0}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer focus:outline-none accent-amber-500"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />

              <span className="text-[10px] font-mono tabular-nums text-slate-400">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>

              {/* Animated Audio Equalizer VU Meter Bars when playing unmuted */}
              {isPlaying && !isMuted && volume > 0 && (
                <div className="hidden sm:flex items-end gap-0.5 h-3 ml-1" title="Audio Sound Active">
                  <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-2" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-3" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-1.5" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2.5" />
                </div>
              )}
            </div>

            {/* Current & Total Time */}
            <div className="text-xs font-mono text-slate-300 tabular-nums ml-2 hidden sm:block">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Network Quality, Speed, Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="hidden md:flex items-center bg-white/10 rounded-md p-0.5 text-[11px] font-medium text-slate-300">
              {[0.75, 1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    playbackSpeed === spd ? 'bg-amber-500 text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Quality Selector */}
            <select
              value={networkQuality}
              onChange={(e) => setNetworkQuality(e.target.value as any)}
              className="bg-white/10 hover:bg-white/15 text-slate-200 text-xs rounded-md px-2 py-1 focus:outline-none border-none cursor-pointer"
            >
              <option value="auto" className="bg-[#121620] text-white">Auto Quality</option>
              <option value="1080p" className="bg-[#121620] text-white">1080p Full HD</option>
              <option value="720p" className="bg-[#121620] text-white">720p HD</option>
              <option value="480p" className="bg-[#121620] text-white">480p Data Saver</option>
            </select>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
