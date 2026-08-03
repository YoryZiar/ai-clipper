import React, { useState } from 'react';
import { useClipper } from '../../context/ClipperContext';
import {
  Upload,
  Youtube,
  Film,
  Sparkles,
  Sliders,
  Flame,
  Clock,
  Play,
  ArrowRight,
  BrainCircuit,
  Cpu,
  CheckCircle2,
  FileVideo,
  Languages,
  UserCheck,
  Zap,
  Tag,
  Scissors,
  Layers,
} from 'lucide-react';
import { VideoGenre, SpeakerTrackMode } from '../../types';

export const UserDashboard: React.FC = () => {
  const {
    videoSource,
    setVideoSource,
    youtubeUrlInput,
    setYoutubeUrlInput,
    clipperConfig,
    setClipperConfig,
    startAIAnalysis,
    isAnalyzing,
    analysisPhase,
    analysisProgress,
    analysisStepMessage,
    generatedClips,
    selectClipForEditing,
    loadSampleVideo,
  } = useClipper();

  const [dragOver, setDragOver] = useState(false);
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'youtube'>('upload');

  // Handle local file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('video') || file.name.endsWith('.mp4')) {
        const url = URL.createObjectURL(file);
        setVideoSource({
          file,
          name: file.name,
          url,
          duration: 300,
          isSample: false,
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setVideoSource({
        file,
        name: file.name,
        url,
        duration: 300,
        isSample: false,
      });
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrlInput) return;
    setVideoSource({
      name: `YouTube Video: ${youtubeUrlInput}`,
      url: youtubeUrlInput,
      duration: 480,
      isSample: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0c0c0e] p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Dashboard Pengguna & Generator Klip AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Konfigurasi & Analisis Video
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pilih berkas MP4 lokal atau tautan YouTube, sesuaikan parameter AI, lalu hasilkan klip viral 9:16.
          </p>
        </div>

        {videoSource && (
          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-800">
            <FileVideo className="w-5 h-5 text-purple-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-bold">Video Aktif</span>
              <span className="text-xs font-semibold text-zinc-200 max-w-[180px] truncate block">
                {videoSource.name}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input & Settings (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: Video Input Selector */}
          <div className="bg-[#0c0c0e] rounded-2xl p-6 border border-zinc-800 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                <span>Input Source</span>
              </h3>

              <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
                <button
                  onClick={() => setActiveInputTab('upload')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeInputTab === 'upload'
                      ? 'bg-zinc-800 text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Unggah MP4
                </button>
                <button
                  onClick={() => setActiveInputTab('youtube')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeInputTab === 'youtube'
                      ? 'bg-zinc-800 text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tautan YouTube
                </button>
              </div>
            </div>

            {/* TAB: Upload Local MP4 */}
            {activeInputTab === 'upload' && (
              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    dragOver
                      ? 'border-purple-500 bg-purple-950/20'
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-purple-500/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-300">
                    Tarik & Lepas Berkas MP4 Lokal Di Sini
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Mendukung format MP4, MOV, atau WEBM hingga 2GB
                  </p>

                  <label className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg cursor-pointer shadow-md shadow-purple-900/20 transition-all">
                    <span>Pilih Berkas Komputer</span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB: YouTube URL */}
            {activeInputTab === 'youtube' && (
              <form onSubmit={handleYoutubeSubmit} className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Tempelkan URL video YouTube panjang untuk diekstrak otomatis:
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Youtube className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrlInput}
                      onChange={(e) => setYoutubeUrlInput(e.target.value)}
                      className="w-full bg-zinc-900/50 text-xs text-white pl-10 pr-4 py-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg transition-all shrink-0 border border-zinc-700"
                  >
                    Muat Video
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* SECTION 2: AI Clipper Parameters */}
          <div className="bg-[#0c0c0e] rounded-2xl p-6 border border-zinc-800 shadow-xl space-y-6">
            
            <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>AI Configuration</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-5">
              
              {/* Genre Selector */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  Genre / Intent
                </label>
                <select
                  value={clipperConfig.genre}
                  onChange={(e) =>
                    setClipperConfig((prev) => ({
                      ...prev,
                      genre: e.target.value as VideoGenre,
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Podcast">Podcast Highlighting</option>
                  <option value="Edukasi">Educational Summary</option>
                  <option value="Tech Review">Tech Review & Gadget</option>
                  <option value="Bisnis">Business & Motivation</option>
                  <option value="Gaming">Gaming Clips</option>
                  <option value="Umum">Entertainment / General</option>
                </select>
              </div>

              {/* Clip Count Selector */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  Targets Jumlah Klip
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 7, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        setClipperConfig((prev) => ({ ...prev, clipCount: num }))
                      }
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                        clipperConfig.clipCount === num
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Duration Selector */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  Target Durasi Klip
                </label>
                <select
                  value={clipperConfig.targetDuration}
                  onChange={(e) =>
                    setClipperConfig((prev) => ({
                      ...prev,
                      targetDuration: e.target.value,
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="15-30s">15 - 30s (Sangat Singkat)</option>
                  <option value="30-45s">30 - 45s (Standar Shorts)</option>
                  <option value="45-60s">45 - 60s (Rekomendasi Utama)</option>
                  <option value="60-90s">60 - 90s (Mendalam)</option>
                </select>
              </div>

              {/* Subtitle Language */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  Bahasa Subtitle Auto
                </label>
                <select
                  value={clipperConfig.subtitleLang}
                  onChange={(e) =>
                    setClipperConfig((prev) => ({
                      ...prev,
                      subtitleLang: e.target.value,
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Indonesian">Bahasa Indonesia</option>
                  <option value="English">English (US)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Spanish">Spanish (Español)</option>
                </select>
              </div>

              {/* Speaker Tracking Mode */}
              <div className="sm:col-span-2">
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  Mode Pelacakan Wajah (Smart Crop 9:16)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'auto-switch', label: 'Auto Switch' },
                    { id: 'speaker-a', label: 'Pembicara A' },
                    { id: 'speaker-b', label: 'Pembicara B' },
                    { id: 'center-fixed', label: 'Center Fixed' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setClipperConfig((prev) => ({
                          ...prev,
                          speakerTrackMode: mode.id as SpeakerTrackMode,
                        }))
                      }
                      className={`p-2.5 rounded-lg text-xs font-medium border transition-all text-center ${
                        clipperConfig.speakerTrackMode === mode.id
                          ? 'bg-purple-600/30 border-purple-500/80 text-purple-200 font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Main Action Button */}
            <div className="pt-2">
              <button
                onClick={startAIAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/20 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50 text-sm"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Analyze Video & Generate Clips</span>
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Results / Preview & Clip Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#0c0c0e] rounded-2xl p-6 border border-zinc-800 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Hasil Klip AI ({generatedClips.length})</span>
              </h3>

              {generatedClips.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Ready
                </span>
              )}
            </div>

            {/* Empty State */}
            {generatedClips.length === 0 && !isAnalyzing && (
              <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-xs font-bold text-zinc-200">Belum Ada Hasil Klip</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Klik tombol <strong className="text-zinc-300">"Analyze Video"</strong> untuk memproses video dan menghasilkan klip viral otomatis.
                </p>
              </div>
            )}

            {/* Generated Clip List */}
            {generatedClips.length > 0 && !isAnalyzing && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {generatedClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 transition-all space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50 uppercase">
                          {clip.hookType}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                          {clip.title}
                        </h4>
                      </div>

                      {/* Viral Score Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{clip.viralScore}/100</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">{clip.durationText}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                      <strong className="text-purple-300">AI Viral Reason:</strong> {clip.viralReason}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span className="capitalize">{clip.layoutMode}</span>
                      </div>

                      <button
                        onClick={() => selectClipForEditing(clip.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all group-hover:scale-105"
                      >
                        <span>Open in Editor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* TWO-PHASE REAL-TIME PROCESSING MODAL */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 p-8 rounded-2xl max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Top Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400" />

            <div className="w-14 h-14 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto animate-pulse">
              {analysisPhase === 1 ? (
                <BrainCircuit className="w-7 h-7 text-purple-400" />
              ) : (
                <Cpu className="w-7 h-7 text-cyan-400" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
                FASE {analysisPhase}: {analysisPhase === 1 ? 'AI THINKING (GEMINI)' : 'RENDER & SMART CROP'}
              </span>
              <h3 className="text-lg font-bold text-white mt-3">
                Memproses Klip Video Otomatis...
              </h3>
              <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">
                {analysisStepMessage}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>AI PROGRESS</span>
                <span className="text-purple-400 font-bold">{analysisProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-zinc-400 text-left pt-2 border-t border-zinc-800 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${analysisPhase >= 1 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <span>Transkrip & Viral Hook</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${analysisProgress >= 65 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <span>Smart Crop Face Track</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
