import React, { createContext, useContext, useState } from 'react';
import {
  PageView,
  VideoSource,
  ClipperConfig,
  ClipSegment,
  CaptionStyle,
  RenderEngine,
  LayoutMode,
  SpeakerTrackMode,
  SubtitleLine,
} from '../types';
import { CAPTION_PRESETS } from '../data/sampleVideos';

interface ClipperContextType {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  videoSource: VideoSource | null;
  setVideoSource: (video: VideoSource | null) => void;
  youtubeUrlInput: string;
  setYoutubeUrlInput: (url: string) => void;
  clipperConfig: ClipperConfig;
  setClipperConfig: React.Dispatch<React.SetStateAction<ClipperConfig>>;
  generatedClips: ClipSegment[];
  activeClip: ClipSegment | null;
  setActiveClip: (clip: ClipSegment | null) => void;
  captionStyle: CaptionStyle;
  setCaptionStyle: React.Dispatch<React.SetStateAction<CaptionStyle>>;
  isAnalyzing: boolean;
  analysisPhase: 1 | 2;
  analysisProgress: number;
  analysisStepMessage: string;
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  renderEngine: RenderEngine;
  setRenderEngine: (engine: RenderEngine) => void;
  
  // Actions
  startAIAnalysis: () => Promise<void>;
  selectClipForEditing: (clipId: string) => void;
  updateActiveClipSubtitle: (id: string, field: keyof SubtitleLine, value: any) => void;
  addSubtitleLine: () => void;
  deleteSubtitleLine: (id: string) => void;
  updateActiveClipLayout: (layoutMode: LayoutMode, speakerTrack?: SpeakerTrackMode) => void;
}

const ClipperContext = createContext<ClipperContextType | undefined>(undefined);

export const ClipperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState<string>('');
  
  const [clipperConfig, setClipperConfig] = useState<ClipperConfig>({
    genre: 'Podcast',
    clipCount: 3,
    targetDuration: '45-60s',
    subtitleLang: 'Indonesian',
    speakerTrackMode: 'auto-switch',
    layoutMode: 'smart-crop-916',
  });

  const [generatedClips, setGeneratedClips] = useState<ClipSegment[]>([]);
  const [activeClip, setActiveClip] = useState<ClipSegment | null>(null);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(CAPTION_PRESETS[0]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<1 | 2>(1);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepMessage, setAnalysisStepMessage] = useState('');
  
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [renderEngine, setRenderEngine] = useState<RenderEngine>('ffmpeg-wasm');

  // Perform 2-phase AI Analysis call
  const startAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisPhase(1);
    setAnalysisProgress(10);
    setAnalysisStepMessage('Fase 1: Berpikir AI - Mengekstrak audio & menganalisis transkrip...');

    // Progress simulation step 1
    await new Promise((r) => setTimeout(r, 800));
    setAnalysisProgress(35);
    setAnalysisStepMessage('Fase 1: Menentukan skor viralitas, hook emosional & deteksi pembicara...');

    try {
      const customApiKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY');
      const openaiKey = localStorage.getItem('OPENAI_API_KEY');
      const openaiBaseUrl = localStorage.getItem('OPENAI_BASE_URL');
      const openaiModel = localStorage.getItem('OPENAI_MODEL');
      const aiProvider = localStorage.getItem('AI_PROVIDER');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (aiProvider === 'custom' && customApiKey) {
        headers['x-custom-gemini-api-key'] = customApiKey;
      }
      if (aiProvider === 'openai') {
        headers['x-ai-provider'] = 'openai';
        if (openaiKey) headers['x-openai-api-key'] = openaiKey;
        if (openaiBaseUrl) headers['x-openai-base-url'] = openaiBaseUrl;
        if (openaiModel) headers['x-openai-model'] = openaiModel;
      }

      const response = await fetch('/api/generate-clips', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          videoTitle: videoSource?.name || 'Video Input User',
          genre: clipperConfig.genre,
          clipCount: clipperConfig.clipCount,
          targetDuration: clipperConfig.targetDuration,
          subtitleLang: clipperConfig.subtitleLang,
          youtubeUrl: youtubeUrlInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setAnalysisPhase(2);
      setAnalysisProgress(65);
      setAnalysisStepMessage('Fase 2: Smart Crop 9:16 - Mengkalkulasi koordinat pelacakan wajah...');

      await new Promise((r) => setTimeout(r, 900));
      setAnalysisProgress(90);
      setAnalysisStepMessage('Fase 2: Mensinkronisasi subtitle karaoke multi-bahasa...');

      await new Promise((r) => setTimeout(r, 600));
      setAnalysisProgress(100);
      setAnalysisStepMessage('Selesai! Klip siap disunting.');

      if (data.clips && data.clips.length > 0) {
        setGeneratedClips(data.clips);
        setActiveClip(data.clips[0]);
      }
    } catch (err) {
      console.error('AI Analysis API call error:', err);
      alert(`Gagal menganalisis video: ${err instanceof Error ? err.message : 'Silakan coba lagi.'}`);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const selectClipForEditing = (clipId: string) => {
    const found = generatedClips.find((c) => c.id === clipId);
    if (found) {
      setActiveClip(found);
      setCurrentPage('workspace');
    }
  };

  const updateActiveClipSubtitle = (id: string, field: keyof SubtitleLine, value: any) => {
    if (!activeClip) return;
    const updatedSubtitles = activeClip.subtitles.map((sub) => {
      if (sub.id === id) {
        return { ...sub, [field]: value };
      }
      return sub;
    });

    const updatedClip = { ...activeClip, subtitles: updatedSubtitles };
    setActiveClip(updatedClip);

    // Sync in list
    setGeneratedClips((prev) =>
      prev.map((c) => (c.id === updatedClip.id ? updatedClip : c))
    );
  };

  const addSubtitleLine = () => {
    if (!activeClip) return;
    const lastSub = activeClip.subtitles[activeClip.subtitles.length - 1];
    const newStart = lastSub ? Number((lastSub.end + 0.2).toFixed(1)) : 0;
    const newEnd = Number((newStart + 3.0).toFixed(1));

    const newSub: SubtitleLine = {
      id: `sub-custom-${Date.now()}`,
      start: newStart,
      end: newEnd,
      text: 'Baris subtitle baru...',
      speaker: 'Pembicara',
    };

    const updatedClip = {
      ...activeClip,
      subtitles: [...activeClip.subtitles, newSub],
    };
    setActiveClip(updatedClip);
    setGeneratedClips((prev) =>
      prev.map((c) => (c.id === updatedClip.id ? updatedClip : c))
    );
  };

  const deleteSubtitleLine = (id: string) => {
    if (!activeClip) return;
    const updatedSubtitles = activeClip.subtitles.filter((sub) => sub.id !== id);
    const updatedClip = { ...activeClip, subtitles: updatedSubtitles };
    setActiveClip(updatedClip);
    setGeneratedClips((prev) =>
      prev.map((c) => (c.id === updatedClip.id ? updatedClip : c))
    );
  };

  const updateActiveClipLayout = (
    layoutMode: LayoutMode,
    speakerTrack?: SpeakerTrackMode
  ) => {
    if (!activeClip) return;
    const updatedClip = {
      ...activeClip,
      layoutMode,
      speakerTrack: speakerTrack || activeClip.speakerTrack,
    };
    setActiveClip(updatedClip);
    setGeneratedClips((prev) =>
      prev.map((c) => (c.id === updatedClip.id ? updatedClip : c))
    );
  };

  return (
    <ClipperContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        videoSource,
        setVideoSource,
        youtubeUrlInput,
        setYoutubeUrlInput,
        clipperConfig,
        setClipperConfig,
        generatedClips,
        activeClip,
        setActiveClip,
        captionStyle,
        setCaptionStyle,
        isAnalyzing,
        analysisPhase,
        analysisProgress,
        analysisStepMessage,
        exportModalOpen,
        setExportModalOpen,
        renderEngine,
        setRenderEngine,
        startAIAnalysis,
        selectClipForEditing,
        updateActiveClipSubtitle,
        addSubtitleLine,
        deleteSubtitleLine,
        updateActiveClipLayout,
      }}
    >
      {children}
    </ClipperContext.Provider>
  );
};

export const useClipper = () => {
  const ctx = useContext(ClipperContext);
  if (!ctx) {
    throw new Error('useClipper must be used within ClipperProvider');
  }
  return ctx;
};
