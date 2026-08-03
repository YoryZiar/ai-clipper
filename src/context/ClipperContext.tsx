import React, { createContext, useContext, useState, useReducer, useCallback, useMemo } from 'react';
import {
  VideoSource,
  ClipperConfig,
  ClipSegment,
  CaptionStyle,
  RenderEngine,
  LayoutMode,
  SpeakerTrackMode,
  SubtitleLine,
} from '../types';
import { CAPTION_PRESETS } from '../data/captionPresets';
import { useToast } from './ToastContext';
import { secureStorage } from '../utils/secureStorage';

interface ClipDataState {
  videoSource: VideoSource | null;
  youtubeUrlInput: string;
  clipperConfig: ClipperConfig;
  generatedClips: ClipSegment[];
  activeClip: ClipSegment | null;
  captionStyle: CaptionStyle;
  isAnalyzing: boolean;
  analysisPhase: 1 | 2;
  analysisProgress: number;
  analysisStepMessage: string;
  exportModalOpen: boolean;
  renderEngine: RenderEngine;
  history: ClipSegment[][];
  historyIndex: number;
}

type ClipDataAction =
  | { type: 'SET_VIDEO_SOURCE'; payload: VideoSource | null }
  | { type: 'SET_YOUTUBE_URL'; payload: string }
  | { type: 'SET_CONFIG'; payload: Partial<ClipperConfig> }
  | { type: 'SET_GENERATED_CLIPS'; payload: ClipSegment[] }
  | { type: 'SET_ACTIVE_CLIP'; payload: ClipSegment | null }
  | { type: 'UPDATE_CLIP'; payload: ClipSegment }
  | { type: 'SET_CAPTION_STYLE'; payload: CaptionStyle }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_ANALYSIS_PHASE'; payload: 1 | 2 }
  | { type: 'SET_ANALYSIS_PROGRESS'; payload: number }
  | { type: 'SET_ANALYSIS_MESSAGE'; payload: string }
  | { type: 'SET_EXPORT_MODAL'; payload: boolean }
  | { type: 'SET_RENDER_ENGINE'; payload: RenderEngine }
  | { type: 'UNDO' }
  | { type: 'REDO' };

function clipDataReducer(state: ClipDataState, action: ClipDataAction): ClipDataState {
  const pushHistory = (s: ClipDataState) => ({
    ...s,
    history: [...s.history.slice(0, s.historyIndex + 1), s.generatedClips],
    historyIndex: Math.min(s.historyIndex + 1, s.history.length),
  });

  switch (action.type) {
    case 'SET_VIDEO_SOURCE':
      return { ...state, videoSource: action.payload };
    case 'SET_YOUTUBE_URL':
      return { ...state, youtubeUrlInput: action.payload };
    case 'SET_CONFIG':
      return { ...state, clipperConfig: { ...state.clipperConfig, ...action.payload } };
    case 'SET_GENERATED_CLIPS': {
      const withHistory = pushHistory(state);
      return { ...withHistory, generatedClips: action.payload };
    }
    case 'SET_ACTIVE_CLIP':
      return { ...state, activeClip: action.payload };
    case 'UPDATE_CLIP': {
      const withHistory = pushHistory(state);
      return {
        ...withHistory,
        activeClip: action.payload,
        generatedClips: withHistory.generatedClips.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    }
    case 'SET_CAPTION_STYLE':
      return { ...state, captionStyle: action.payload };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_ANALYSIS_PHASE':
      return { ...state, analysisPhase: action.payload };
    case 'SET_ANALYSIS_PROGRESS':
      return { ...state, analysisProgress: action.payload };
    case 'SET_ANALYSIS_MESSAGE':
      return { ...state, analysisStepMessage: action.payload };
    case 'SET_EXPORT_MODAL':
      return { ...state, exportModalOpen: action.payload };
    case 'SET_RENDER_ENGINE':
      return { ...state, renderEngine: action.payload };
    case 'UNDO':
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const prevClips = state.history[newIndex];
        const activeFromHistory = state.activeClip
          ? prevClips.find((c) => c.id === state.activeClip!.id) || prevClips[0] || null
          : null;
        return { ...state, generatedClips: prevClips, activeClip: activeFromHistory, historyIndex: newIndex };
      }
      return state;
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const nextClips = state.history[newIndex];
        const activeFromHistory = state.activeClip
          ? nextClips.find((c) => c.id === state.activeClip!.id) || nextClips[0] || null
          : null;
        return { ...state, generatedClips: nextClips, activeClip: activeFromHistory, historyIndex: newIndex };
      }
      return state;
    default:
      return state;
  }
}

const initialState: ClipDataState = {
  videoSource: null,
  youtubeUrlInput: '',
  clipperConfig: {
    genre: 'Podcast',
    clipCount: 3,
    targetDuration: '45-60s',
    subtitleLang: 'Indonesian',
    speakerTrackMode: 'auto-switch',
    layoutMode: 'smart-crop-916',
  },
  generatedClips: [],
  activeClip: null,
  captionStyle: CAPTION_PRESETS[0],
  isAnalyzing: false,
  analysisPhase: 1,
  analysisProgress: 0,
  analysisStepMessage: '',
  exportModalOpen: false,
  renderEngine: 'ffmpeg-wasm',
  history: [],
  historyIndex: -1,
};

interface ClipperContextType {
  state: ClipDataState;
  dispatch: React.Dispatch<ClipDataAction>;
  startAIAnalysis: () => Promise<void>;
  selectClipForEditing: (clipId: string) => void;
  updateActiveClipSubtitle: (id: string, field: keyof SubtitleLine, value: any) => void;
  addSubtitleLine: () => void;
  deleteSubtitleLine: (id: string) => void;
  updateActiveClipLayout: (layoutMode: LayoutMode, speakerTrack?: SpeakerTrackMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const ClipperContext = createContext<ClipperContextType | undefined>(undefined);

export const ClipperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [state, dispatch] = useReducer(clipDataReducer, initialState);

  const startAIAnalysis = useCallback(async () => {
    dispatch({ type: 'SET_ANALYZING', payload: true });
    dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 1 });
    dispatch({ type: 'SET_ANALYSIS_PROGRESS', payload: 10 });
    dispatch({ type: 'SET_ANALYSIS_MESSAGE', payload: 'Fase 1: Berpikir AI - Mengekstrak audio & menganalisis transkrip...' });

    await new Promise((r) => setTimeout(r, 800));
    dispatch({ type: 'SET_ANALYSIS_PROGRESS', payload: 35 });
    dispatch({ type: 'SET_ANALYSIS_MESSAGE', payload: 'Fase 1: Menentukan skor viralitas, hook emosional & deteksi pembicara...' });

    try {
      const customApiKey = secureStorage.getItem('CUSTOM_GEMINI_API_KEY');
      const openaiKey = secureStorage.getItem('OPENAI_API_KEY');
      const openaiBaseUrl = secureStorage.getItem('OPENAI_BASE_URL');
      const openaiModel = secureStorage.getItem('OPENAI_MODEL');
      const aiProvider = secureStorage.getItem('AI_PROVIDER');

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
        headers,
        body: JSON.stringify({
          videoTitle: state.videoSource?.name || 'Video Input User',
          genre: state.clipperConfig.genre,
          clipCount: state.clipperConfig.clipCount,
          targetDuration: state.clipperConfig.targetDuration,
          subtitleLang: state.clipperConfig.subtitleLang,
          youtubeUrl: state.youtubeUrlInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 2 });
      dispatch({ type: 'SET_ANALYSIS_PROGRESS', payload: 65 });
      dispatch({ type: 'SET_ANALYSIS_MESSAGE', payload: 'Fase 2: Smart Crop 9:16 - Mengkalkulasi koordinat pelacakan wajah...' });

      await new Promise((r) => setTimeout(r, 900));
      dispatch({ type: 'SET_ANALYSIS_PROGRESS', payload: 90 });
      dispatch({ type: 'SET_ANALYSIS_MESSAGE', payload: 'Fase 2: Mensinkronisasi subtitle karaoke multi-bahasa...' });

      await new Promise((r) => setTimeout(r, 600));
      dispatch({ type: 'SET_ANALYSIS_PROGRESS', payload: 100 });
      dispatch({ type: 'SET_ANALYSIS_MESSAGE', payload: 'Selesai! Klip siap disunting.' });

      if (data.clips && data.clips.length > 0) {
        dispatch({ type: 'SET_GENERATED_CLIPS', payload: data.clips });
        dispatch({ type: 'SET_ACTIVE_CLIP', payload: data.clips[0] });
      }
    } catch (err) {
      console.error('AI Analysis API call error:', err);
      addToast(`Gagal menganalisis video: ${err instanceof Error ? err.message : 'Silakan coba lagi.'}`, 'error');
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_ANALYZING', payload: false });
      }, 500);
    }
  }, [state.videoSource, state.clipperConfig, state.youtubeUrlInput, addToast]);

  const selectClipForEditing = useCallback((clipId: string) => {
    const found = state.generatedClips.find((c) => c.id === clipId);
    if (found) {
      dispatch({ type: 'SET_ACTIVE_CLIP', payload: found });
    }
  }, [state.generatedClips]);

  const updateActiveClipSubtitle = useCallback(
    (id: string, field: keyof SubtitleLine, value: any) => {
      if (!state.activeClip) return;
      const updatedSubtitles = state.activeClip.subtitles.map((sub) =>
        sub.id === id ? { ...sub, [field]: value } : sub
      );
      dispatch({
        type: 'UPDATE_CLIP',
        payload: { ...state.activeClip, subtitles: updatedSubtitles },
      });
    },
    [state.activeClip],
  );

  const addSubtitleLine = useCallback(() => {
    if (!state.activeClip) return;
    const lastSub = state.activeClip.subtitles[state.activeClip.subtitles.length - 1];
    const newStart = lastSub ? Number((lastSub.end + 0.2).toFixed(1)) : 0;
    const newEnd = Number((newStart + 3.0).toFixed(1));

    const newSub: SubtitleLine = {
      id: `sub-custom-${Date.now()}`,
      start: newStart,
      end: newEnd,
      text: 'Baris subtitle baru...',
      speaker: 'Pembicara',
    };

    dispatch({
      type: 'UPDATE_CLIP',
      payload: {
        ...state.activeClip,
        subtitles: [...state.activeClip.subtitles, newSub],
      },
    });
  }, [state.activeClip]);

  const deleteSubtitleLine = useCallback(
    (id: string) => {
      if (!state.activeClip) return;
      const updatedSubtitles = state.activeClip.subtitles.filter((sub) => sub.id !== id);
      dispatch({
        type: 'UPDATE_CLIP',
        payload: { ...state.activeClip, subtitles: updatedSubtitles },
      });
    },
    [state.activeClip],
  );

  const updateActiveClipLayout = useCallback(
    (layoutMode: LayoutMode, speakerTrack?: SpeakerTrackMode) => {
      if (!state.activeClip) return;
      dispatch({
        type: 'UPDATE_CLIP',
        payload: {
          ...state.activeClip,
          layoutMode,
          speakerTrack: speakerTrack || state.activeClip.speakerTrack,
        },
      });
    },
    [state.activeClip],
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const canUndo = useMemo(() => state.historyIndex > 0, [state.historyIndex]);
  const canRedo = useMemo(() => state.historyIndex < state.history.length - 1, [state.historyIndex, state.history]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      startAIAnalysis,
      selectClipForEditing,
      updateActiveClipSubtitle,
      addSubtitleLine,
      deleteSubtitleLine,
      updateActiveClipLayout,
      canUndo,
      canRedo,
      undo,
      redo,
    }),
    [
      state,
      startAIAnalysis,
      selectClipForEditing,
      updateActiveClipSubtitle,
      addSubtitleLine,
      deleteSubtitleLine,
      updateActiveClipLayout,
      canUndo,
      canRedo,
      undo,
      redo,
    ],
  );

  return <ClipperContext.Provider value={value}>{children}</ClipperContext.Provider>;
};

export const useClipper = () => {
  const ctx = useContext(ClipperContext);
  if (!ctx) {
    throw new Error('useClipper must be used within ClipperProvider');
  }
  return ctx;
};
