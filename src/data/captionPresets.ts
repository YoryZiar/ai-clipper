import { VideoSource, ClipSegment } from '../types';

export const CAPTION_PRESETS = [
  {
    presetName: "MrBeast Bold",
    fontFamily: "Impact, sans-serif",
    fontSize: 28,
    primaryColor: "#FFFFFF",
    highlightColor: "#FACC15", // bright yellow
    backgroundColor: "#000000cc",
    shadowColor: "rgba(0,0,0,0.9)",
    uppercase: true,
    positionY: 72,
    animationType: "karaoke" as const,
  },
  {
    presetName: "Neon Cyber",
    fontFamily: "system-ui, sans-serif",
    fontSize: 26,
    primaryColor: "#00F0FF", // cyan
    highlightColor: "#A855F7", // purple neon
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    shadowColor: "#00F0FF80",
    uppercase: true,
    positionY: 70,
    animationType: "bounce" as const,
  },
  {
    presetName: "Podcast Clean",
    fontFamily: "Inter, sans-serif",
    fontSize: 24,
    primaryColor: "#FFFFFF",
    highlightColor: "#38BDF8", // sky blue
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    shadowColor: "rgba(0,0,0,0.5)",
    uppercase: false,
    positionY: 75,
    animationType: "karaoke" as const,
  },
  {
    presetName: "Minimalist White",
    fontFamily: "Georgia, serif",
    fontSize: 22,
    primaryColor: "#F8FAFC",
    highlightColor: "#E2E8F0",
    backgroundColor: "transparent",
    shadowColor: "rgba(0,0,0,0.8)",
    uppercase: false,
    positionY: 80,
    animationType: "fade" as const,
  },
];
