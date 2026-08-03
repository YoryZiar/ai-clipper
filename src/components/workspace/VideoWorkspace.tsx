import React, { useState, useRef, useEffect } from 'react';
import { useClipper } from '../../context/ClipperContext';
import { CAPTION_PRESETS } from '../../data/sampleVideos';
import { ExportModal } from './ExportModal';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  RotateCcw,
  Sparkles,
  Scissors,
  Layers,
  Crop,
  Languages,
  SlidersHorizontal,
  Flame,
  Plus,
  Trash2,
  Download,
  ArrowLeft,
  Scan,
  Music,
  Check,
  Sliders,
  Type,
  Palette,
  LayoutGrid,
  Copy,
  Tag,
  Film,
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { LayoutMode, SpeakerTrackMode, SubtitleLine } from '../../types';

export const VideoWorkspace: React.FC = () => {
  const {
    activeClip,
    generatedClips,
    selectClipForEditing,
    videoSource,
    setCurrentPage,
    captionStyle,
    setCaptionStyle,
    updateActiveClipSubtitle,
    addSubtitleLine,
    deleteSubtitleLine,
    updateActiveClipLayout,
    setExportModalOpen,
  } = useClipper();

  const playerRef = useRef<ReactPlayer | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);

  // Inspector tab
  const [activeTab, setActiveTab] = useState<'subtitles' | 'style' | 'layout' | 'caption'>('subtitles');

  // Copy caption notification
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Ref to track last spoken subtitle line to prevent repeating speech
  const lastSpokenSubIdRef = useRef<string | null>(null);

  // Reset video error when video source changes
  useEffect(() => {
    setVideoError(false);
  }, [videoSource]);

  // Fallback timer simulation when playing without direct media stream or on video error
  useEffect(() => {
    let interval: any;
    if (isPlaying && (videoError || !videoSource?.url)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackRate;
          if (activeClip && next >= activeClip.endSeconds) {
            return activeClip.startSeconds;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoError, videoSource, playbackRate, activeClip]);

  // Synchronize playback rate - handled directly by ReactPlayer prop
  // Synchronize video volume & muted states - handled directly by ReactPlayer props

  // Synchronize video seeking within clip bounds
  useEffect(() => {
    if (activeClip) {
      setCurrentTime(activeClip.startSeconds);
      if (playerRef.current && !videoError) {
        try {
          (playerRef.current as any).seekTo(activeClip.startSeconds, 'seconds');
        } catch (e) {
          // ignore seek error on unready video
        }
      }
    }
  }, [activeClip, videoError]);

  // Speech synthesis trigger when subtitle line changes during playback
  const currentSubLine = activeClip?.subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  useEffect(() => {
    if (
      isPlaying &&
      voiceoverEnabled &&
      currentSubLine &&
      currentSubLine.id !== lastSpokenSubIdRef.current
    ) {
      lastSpokenSubIdRef.current = currentSubLine.id;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(currentSubLine.text);
        utter.rate = 1.15;
        utter.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('id') ||
            v.lang.toLowerCase().includes('ind')
        );
        if (idVoice) utter.voice = idVoice;
        window.speechSynthesis.speak(utter);
      }
    }
    if (!currentSubLine) {
      lastSpokenSubIdRef.current = null;
    }
  }, [currentSubLine?.id, isPlaying, voiceoverEnabled]);

  // Cancel speech when playback stops
  useEffect(() => {
    if (!isPlaying && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isPlaying]);

  const handleTimeUpdate = (playedSeconds: number) => {
    if (videoError) return;
    const time = playedSeconds;
    setCurrentTime(time);

    // Loop back if passed end of clip
    if (activeClip && time >= activeClip.endSeconds) {
      if (playerRef.current) (playerRef.current as any).seekTo(activeClip.startSeconds, 'seconds');
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      // Unmute video explicitly if muted when starting play
      if (isMuted) {
        setIsMuted(false);
      }
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && !videoError) {
      try {
        (playerRef.current as any).seekTo(newTime, 'seconds');
      } catch (err) {
        setVideoError(true);
      }
    }
  };

  const handleCopyCaption = () => {
    if (!activeClip) return;
    const fullText = `${activeClip.suggestedCaption}\n\n${activeClip.suggestedHashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  if (!activeClip) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-slate-400">Belum ada klip yang dipilih untuk disunting.</p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 pb-16 selection:bg-purple-600 selection:text-white">
      
      {/* Top Editor Bar */}
      <div className="bg-[#0c0c0e] border-b border-zinc-800 px-4 lg:px-8 py-3 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-all flex items-center gap-1.5 text-xs font-semibold border border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Select Clip Dropdown */}
            {generatedClips.length > 1 && (
              <select
                value={activeClip.id}
                onChange={(e) => selectClipForEditing(e.target.value)}
                className="bg-zinc-900 text-xs font-bold text-zinc-200 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500"
              >
                {generatedClips.map((c, i) => (
                  <option key={c.id} value={c.id}>
                    Klip #{i + 1}: {c.title}
                  </option>
                ))}
              </select>
            )}

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Viral Score {activeClip.viralScore}/100</span>
              </span>

              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800 capitalize">
                {activeClip.layoutMode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Export Without Watermark</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / CENTER: 9:16 Player & Player Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 9:16 Preview Stage Container */}
          <div className="bg-[#0c0c0e] rounded-2xl p-4 border border-zinc-800 shadow-2xl flex flex-col items-center">
            
            <div className="relative w-full max-w-[300px] sm:max-w-[320px] aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>

              {/* ReactPlayer or Smart Preview Canvas Fallback */}
              {videoSource?.url && !videoError ? (
                <div className="absolute inset-0 w-full h-full">
                  <ReactPlayer
                    ref={playerRef as any}
                    url={videoSource.url}
                    playing={isPlaying}
                    muted={isMuted}
                    volume={volume}
                    playbackRate={playbackRate}
                    onProgress={(state) => handleTimeUpdate(state.playedSeconds)}
                    onDuration={(dur) => setDuration(dur)}
                    onError={() => setVideoError(true)}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover' }}
                    playsinline
                  />
                </div>
              ) : (
                <div className="w-full h-full relative bg-zinc-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                  <img
                    src={videoSource?.thumbnailUrl || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80"}
                    alt="Video frame"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[0.5px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                  <div className="relative z-10 space-y-2 bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 backdrop-blur-md shadow-2xl max-w-[220px]">
                    <div className="w-9 h-9 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 animate-pulse">
                      <Film className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-purple-400 font-bold block uppercase tracking-wider">
                        9:16 Smart Render
                      </span>
                      <p className="text-xs font-semibold text-white truncate max-w-[180px] mx-auto">
                        {activeClip.title}
                      </p>
                    </div>
                    <div className="pt-1 flex justify-center">
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Track: {activeClip.speakerTrack}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Speaker Crop Tracking Bounding Box Overlay */}
              {showBoundingBox && (
                <div className="absolute inset-x-8 top-12 bottom-28 border-2 border-purple-500/50 rounded pointer-events-none animate-pulse flex flex-col items-center justify-center z-20">
                  <span className="text-[8px] bg-purple-500 text-white px-1 absolute top-0 left-0 font-mono">
                    Speaker Tracking: {activeClip.speakerTrack}
                  </span>
                </div>
              )}

              {/* Live Subtitle Overlay */}
              {currentSubLine && (
                <div
                  className="absolute inset-x-4 text-center pointer-events-none transition-all px-2 z-20"
                  style={{ top: `${captionStyle.positionY}%` }}
                >
                  <div
                    className="inline-block px-3 py-1.5 rounded-lg transition-all shadow-lg transform rotate-[-1deg]"
                    style={{
                      backgroundColor: captionStyle.backgroundColor || '#facc15',
                      boxShadow: `0 4px 20px ${captionStyle.shadowColor || 'rgba(0,0,0,0.5)'}`,
                    }}
                  >
                    <p
                      className="font-black italic uppercase leading-tight text-black"
                      style={{
                        fontFamily: captionStyle.fontFamily,
                        fontSize: `${captionStyle.fontSize}px`,
                        color: captionStyle.primaryColor || '#000000',
                        textTransform: captionStyle.uppercase ? 'uppercase' : 'none',
                      }}
                    >
                      {/* Highlight active karaoke word */}
                      {currentSubLine.text.split(' ').map((word, i) => {
                        const isHighlighted = i % 2 === 0;
                        return (
                          <span
                            key={i}
                            style={{
                              color: isHighlighted
                                ? (captionStyle.highlightColor || '#9333ea')
                                : (captionStyle.primaryColor || '#000000'),
                            }}
                            className="mx-0.5 inline-block"
                          >
                            {word}{' '}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Video Player Control Bar */}
            <div className="w-full max-w-[320px] mt-4 space-y-3">
              
              {/* Scrub Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={activeClip.startSeconds}
                  max={activeClip.endSeconds}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                  <span>
                    {Math.floor(currentTime / 60)}:
                    {Math.floor(currentTime % 60)
                      .toString()
                      .padStart(2, '0')}
                  </span>
                  <span className="text-purple-400 font-bold">
                    Clip: {activeClip.durationText}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-md shadow-purple-900/30 shrink-0"
                    title={isPlaying ? "Jeda Preview" : "Putar Preview Video & Audio"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-zinc-400 hover:text-white transition-all"
                      title={isMuted ? "Nyalakan Suara" : "Matikan Suara"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : volume > 0.5 ? (
                        <Volume2 className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Volume1 className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        if (v > 0) setIsMuted(false);
                      }}
                      className="w-16 accent-purple-500 bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Speed Selector */}
                  <select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    className="bg-zinc-800 text-[11px] font-mono font-bold text-zinc-200 px-2 py-1.5 rounded-lg border border-zinc-700 focus:outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2.0x</option>
                  </select>

                  {/* Bounding Box Toggle */}
                  <button
                    onClick={() => setShowBoundingBox(!showBoundingBox)}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      showBoundingBox
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}
                    title="Toggle 9:16 Face Track Bounding Box"
                  >
                    <Scan className="w-4 h-4" />
                  </button>
                </div>

                {/* Second Row: Voiceover AI Toggle & Audio Wave Visualizer */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                  <button
                    onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border ${
                      voiceoverEnabled
                        ? 'bg-purple-950/80 border-purple-600/80 text-purple-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Mic className={`w-3 h-3 ${voiceoverEnabled ? 'text-purple-400 animate-pulse' : 'text-zinc-500'}`} />
                    <span>AI Voiceover TTS: {voiceoverEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  {isPlaying && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Audio Active</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* MULTI-TRACK TIMELINE COMPONENT */}
          <div className="bg-[#0c0c0e] rounded-2xl p-5 border border-zinc-800 shadow-xl space-y-3">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Multi-Track Timeline Editor</span>
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono">
                FFmpeg.wasm Engine
              </span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              
              {/* TRACK 1: Video Track */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-[10px] font-bold text-zinc-500">VIDEO 1</span>
                <div className="flex-1 h-7 bg-purple-900/20 border border-purple-500/30 rounded flex items-center px-1">
                  <div className="w-full h-5 bg-purple-500/40 rounded border border-purple-500 flex items-center px-2 text-[10px] text-purple-200 font-bold truncate">
                    {activeClip.title} ({activeClip.durationText})
                  </div>
                </div>
              </div>

              {/* TRACK 2: Subtitle Track */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-[10px] font-bold text-zinc-500">TEXTS</span>
                <div className="flex-1 h-7 bg-zinc-800/20 border border-zinc-700 rounded flex items-center px-1 gap-1">
                  {activeClip.subtitles.map((sub, idx) => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        if (playerRef.current) {
                          (playerRef.current as any).seekTo(sub.start, 'seconds');
                          setCurrentTime(sub.start);
                        }
                      }}
                      className="h-5 bg-yellow-500/50 hover:bg-yellow-400 text-black font-bold text-[9px] px-2 rounded-sm flex items-center justify-center truncate cursor-pointer transition-all flex-1"
                    >
                      #{idx + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* TRACK 3: Audio / BGM Track */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-[10px] font-bold text-zinc-500">AUDIO 1</span>
                <div className="flex-1 h-7 bg-blue-900/10 border border-blue-500/20 rounded relative flex items-center px-2">
                  <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 20">
                    <path d="M0 10 L5 2 L10 15 L15 5 L20 18 L25 2 L30 14 L35 4 L40 16 L45 8 L50 12 L55 3 L60 18 L65 7 L70 14 L75 4 L80 16 L85 8 L90 12 L95 2 L100 10" stroke="#3b82f6" fill="none"/>
                  </svg>
                  <span className="relative z-10 text-[9px] text-blue-300 font-bold flex items-center gap-1">
                    <Music className="w-3 h-3" /> Voice & BGM Auto-Ducking
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Inspector & Editing Tabs (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0c0c0e] rounded-2xl p-6 border border-zinc-800 shadow-xl space-y-6">
          
          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-full border border-zinc-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('subtitles')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeTab === 'subtitles'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Subtitle Lines</span>
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeTab === 'style'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Caption Style</span>
            </button>

            <button
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeTab === 'layout'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Smart Crop 9:16</span>
            </button>

            <button
              onClick={() => setActiveTab('caption')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeTab === 'caption'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>AI Caption & Tag</span>
            </button>
          </div>

          {/* TAB 1: SUBTITLE LINE EDITOR */}
          {activeTab === 'subtitles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <span>Subtitles (EN/ID)</span>
                </h4>

                <button
                  onClick={addSubtitleLine}
                  className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg border border-zinc-700 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {activeClip.subtitles.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-purple-400">
                        #{idx + 1} ({sub.speaker})
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Start & End Timing */}
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <span>Waktu:</span>
                          <input
                            type="number"
                            step="0.1"
                            value={sub.start}
                            onChange={(e) =>
                              updateActiveClipSubtitle(
                                sub.id,
                                'start',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-12 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800 text-center text-white"
                          />
                          <span>s -</span>
                          <input
                            type="number"
                            step="0.1"
                            value={sub.end}
                            onChange={(e) =>
                              updateActiveClipSubtitle(
                                sub.id,
                                'end',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-12 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800 text-center text-white"
                          />
                          <span>s</span>
                        </div>

                        <button
                          onClick={() => deleteSubtitleLine(sub.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={sub.text}
                      onChange={(e) =>
                        updateActiveClipSubtitle(sub.id, 'text', e.target.value)
                      }
                      className="w-full bg-zinc-900/80 text-xs text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-purple-500/50 font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CAPTION STYLE CUSTOMIZER */}
          {activeTab === 'style' && (
            <div className="space-y-5">
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Caption Presets & Colors</span>
              </h4>

              {/* Preset Templates */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  Preset Gaya Populer:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CAPTION_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => setCaptionStyle(preset)}
                      className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                        captionStyle.presetName === preset.presetName
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {preset.presetName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-300 block mb-1.5 font-medium">
                    Warna Teks Utama:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={captionStyle.primaryColor}
                      onChange={(e) =>
                        setCaptionStyle((p) => ({
                          ...p,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-zinc-800"
                    />
                    <span className="text-xs font-mono text-zinc-400 uppercase">
                      {captionStyle.primaryColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 block mb-1.5 font-medium">
                    Warna Sorot Karaoke:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={captionStyle.highlightColor}
                      onChange={(e) =>
                        setCaptionStyle((p) => ({
                          ...p,
                          highlightColor: e.target.value,
                        }))
                      }
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-zinc-800"
                    />
                    <span className="text-xs font-mono text-zinc-400 uppercase">
                      {captionStyle.highlightColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Font Size & Position Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1 font-medium">
                    <span>Ukuran Font</span>
                    <span className="font-mono text-purple-400">{captionStyle.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="36"
                    value={captionStyle.fontSize}
                    onChange={(e) =>
                      setCaptionStyle((p) => ({
                        ...p,
                        fontSize: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1 font-medium">
                    <span>Posisi Vertikal Y</span>
                    <span className="font-mono text-purple-400">{captionStyle.positionY}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={captionStyle.positionY}
                    onChange={(e) =>
                      setCaptionStyle((p) => ({
                        ...p,
                        positionY: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Uppercase Switch */}
              <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-xs text-zinc-300 font-medium">
                  Ubah Semua Menjadi Huruf Kapital (UPPERCASE)
                </span>
                <input
                  type="checkbox"
                  checked={captionStyle.uppercase}
                  onChange={(e) =>
                    setCaptionStyle((p) => ({ ...p, uppercase: e.target.checked }))
                  }
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

            </div>
          )}

          {/* TAB 3: SMART CROP & LAYOUT MODE */}
          {activeTab === 'layout' && (
            <div className="space-y-5">
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Crop className="w-4 h-4 text-purple-400" />
                <span>Mode Tata Letak 9:16 (Smart Crop)</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'smart-crop-916', label: 'Smart Crop 9:16', desc: 'Lacak wajah pembicara aktif otomatis' },
                  { id: 'split-screen', label: 'Split-Screen 2 Pembicara', desc: 'Pembicara A di atas, Pembicara B di bawah' },
                  { id: 'center-fit', label: 'Center Crop', desc: 'Potong di tengah tanpa pergeseran' },
                  { id: 'blurred-bg', label: 'Blurred Background', desc: 'Video 16:9 di tengah dengan latar blur' },
                ].map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => updateActiveClipLayout(layout.id as LayoutMode)}
                    className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                      activeClip.layoutMode === layout.id
                        ? 'bg-purple-950/40 border-purple-500 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      {layout.label}
                    </span>
                    <span className="text-[11px] text-zinc-400 leading-tight block">
                      {layout.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Speaker Track Target */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  Target Pelacakan Pembicara:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto-switch', label: 'Auto Switch' },
                    { id: 'speaker-a', label: 'Pembicara A' },
                    { id: 'speaker-b', label: 'Pembicara B' },
                  ].map((target) => (
                    <button
                      key={target.id}
                      onClick={() =>
                        updateActiveClipLayout(
                          activeClip.layoutMode,
                          target.id as SpeakerTrackMode
                        )
                      }
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        activeClip.speakerTrack === target.id
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI CAPTION & HASHTAGS */}
          {activeTab === 'caption' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Saran Caption & Hashtag Viral AI</span>
                </h4>

                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white font-semibold text-xs rounded-lg shadow transition-all hover:bg-purple-500"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">
                    Saran Deskripsi / Caption TikTok & Shorts
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                    {activeClip.suggestedCaption}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                    Hashtags Tren Rekomendasi AI
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeClip.suggestedHashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* EXPORT MODAL DIALOG */}
      <ExportModal />

    </div>
  );
};
