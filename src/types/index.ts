export type PageView = 'landing' | 'dashboard' | 'workspace' | 'settings';

export type VideoGenre = 'Podcast' | 'Gaming' | 'Edukasi' | 'Tech Review' | 'Bisnis' | 'Umum';

export type LayoutMode = 'smart-crop-916' | 'split-screen' | 'center-fit' | 'blurred-bg';

export type SpeakerTrackMode = 'speaker-a' | 'speaker-b' | 'auto-switch' | 'center-fixed';

export interface SubtitleLine {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  speaker: string;
}

export interface ClipSegment {
  id: string;
  title: string;
  viralScore: number;
  viralReason: string;
  hookType: string;
  startSeconds: number;
  endSeconds: number;
  durationText: string;
  layoutMode: LayoutMode;
  speakerTrack: SpeakerTrackMode;
  suggestedHashtags: string[];
  suggestedCaption: string;
  subtitles: SubtitleLine[];
}

export interface VideoSource {
  file?: File;
  name: string;
  url: string;
  duration: number; // total duration in seconds
  isSample?: boolean;
  thumbnailUrl?: string;
}

export interface ClipperConfig {
  genre: VideoGenre;
  clipCount: number;
  targetDuration: string;
  subtitleLang: string;
  speakerTrackMode: SpeakerTrackMode;
  layoutMode: LayoutMode;
}

export interface CaptionStyle {
  presetName: string;
  fontFamily: string;
  fontSize: number; // in px
  primaryColor: string; // hex
  highlightColor: string; // hex for active karaoke word
  backgroundColor: string; // background pill color or transparent
  shadowColor: string;
  uppercase: boolean;
  positionY: number; // percentage from top (e.g. 75%)
  animationType: 'karaoke' | 'bounce' | 'fade' | 'static';
}

export type RenderEngine = 'ffmpeg-wasm' | 'remotion-aws';
