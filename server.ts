import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

dotenv.config();

const app = express();

const SERVER_GEMINI_KEY = process.env.GEMINI_API_KEY;
const SERVER_OPENAI_KEY = process.env.OPENAI_API_KEY;
const SERVER_OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://kenari.id/v1";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-6-luna";

const IS_SERVERLESS = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.VERCEL_REGION;

if (!IS_SERVERLESS) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        mediaSrc: ["'self'", "blob:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        fontSrc: ["'self'", "data:"],
      },
    },
  }));
}

app.use(cors({
  origin: process.env.APP_URL || true,
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));

// Helper to initialize Gemini SDK safely
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || SERVER_GEMINI_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getOpenAIClient(apiKey: string, baseURL?: string) {
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: baseURL || undefined,
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Configuration status endpoint
app.get("/api/ai-config", (_req, res) => {
  const configuredProvider = (SERVER_GEMINI_KEY || SERVER_OPENAI_KEY) ? "server" : "client";
  res.json({
    configuredProvider,
    serverHasGemini: !!SERVER_GEMINI_KEY,
    serverHasOpenAI: !!SERVER_OPENAI_KEY,
    defaultModel: DEFAULT_OPENAI_MODEL,
    baseUrl: SERVER_OPENAI_BASE_URL,
  });
});

// Rate limiter for AI generation endpoint
// Catatan: Store in-memory default express-rate-limit tidak dibagikan (shared) antar instance Vercel Serverless Function.
// Untuk produksi multi-instance / serverless, disarankan menggunakan store eksternal (seperti Redis / Upstash).
const generateClipsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
});

const youtubeInfoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const VALID_GENRES = ["Podcast", "Gaming", "Edukasi", "Tech Review", "Bisnis", "Umum"];
const VALID_TARGET_DURATIONS = ["15-30s", "30-45s", "45-60s", "60-90s"];
const VALID_LANGUAGES = ["Indonesian", "English", "Japanese", "Spanish"];
const VALID_LAYOUT_MODES = ["smart-crop-916", "split-screen", "center-fit", "blurred-bg"];
const VALID_SPEAKER_TRACKS = ["speaker-a", "speaker-b", "auto-switch", "center-fixed"];

function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (typeof input !== "string") return "";
  return input.slice(0, maxLength).replace(/<\/?[^>]+(>|$)/g, "");
}

// AI Generate Video Clips Endpoint
app.post("/api/generate-clips", generateClipsLimiter, async (req, res) => {
  const {
    videoTitle: rawTitle,
    genre: rawGenre,
    clipCount: rawClipCount,
    targetDuration: rawDuration,
    subtitleLang: rawLang,
    youtubeUrl: rawYoutubeUrl,
    transcriptText: rawTranscript,
  } = req.body || {};

  const videoTitle = sanitizeInput(rawTitle || "Video Tanpa Judul", 200);
  const genre = VALID_GENRES.includes(rawGenre) ? rawGenre : "Podcast";
  const clipCount = Math.min(Math.max(parseInt(String(rawClipCount), 10) || 3, 1), 10);
  const targetDuration = VALID_TARGET_DURATIONS.includes(rawDuration) ? rawDuration : "45-60s";
  const subtitleLang = VALID_LANGUAGES.includes(rawLang) ? rawLang : "Indonesian";
  const youtubeUrl = sanitizeInput(rawYoutubeUrl || "", 500);
  const transcriptText = sanitizeInput(rawTranscript || "", 4000);

  const aiProvider = req.headers["x-ai-provider"] as string | undefined;
  
  const prompt = `Anda adalah AI Video Curator & Auto Clipper profesional setara Lokaclip Pro.
Tugas Anda adalah mengidentifikasi ${clipCount} segmen klip paling viral dan menarik dari video berikut:
Judul: ${videoTitle}
Genre: ${genre}
Target Durasi: ${targetDuration}
Bahasa Subtitle: ${subtitleLang}
URL YouTube: ${youtubeUrl || "Tidak ada"}
Transkrip/Deskripsi: ${transcriptText || "Diskusi podcast menarik tentang teknologi AI, bisnis digital, produktivitas, dan strategi masa depan."}

Untuk setiap klip yang Anda buat, berikan JSON berstruktur persis sesuai skema berikut.
Pastikan setiap klip memiliki:
- Subtitle yang tersinkronisasi baris demi baris (minimal 4-6 baris subtitle per klip)
- Skor viralitas tinggi (85-99) dengan alasan AI yang tajam
- Mode tata letak 9:16 yang disarankan (smart-crop-916, split-screen, center-fit, blurred-bg)`;

  if (aiProvider === 'openai') {
    const openaiKey = (req.headers["x-openai-api-key"] as string | undefined) || SERVER_OPENAI_KEY;
    const openaiBaseUrl = (req.headers["x-openai-base-url"] as string | undefined) || SERVER_OPENAI_BASE_URL;
    const openaiModel = (req.headers["x-openai-model"] as string | undefined) || DEFAULT_OPENAI_MODEL;
    
    if (openaiKey) {
      const openai = getOpenAIClient(openaiKey, openaiBaseUrl);
      if (openai) {
        try {
          const response = await openai.chat.completions.create({
            model: openaiModel || DEFAULT_OPENAI_MODEL,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You must respond ONLY with a valid JSON object matching this schema:
{
  "clips": [
    {
      "id": "string",
      "title": "string",
      "viralScore": 0,
      "viralReason": "string",
      "hookType": "string",
      "startSeconds": 0,
      "endSeconds": 0,
      "durationText": "string",
      "layoutMode": "string",
      "speakerTrack": "string",
      "suggestedHashtags": ["string"],
      "suggestedCaption": "string",
      "subtitles": [
        {
          "id": "string",
          "start": 0,
          "end": 0,
          "text": "string",
          "speaker": "string"
        }
      ]
    }
  ]
}`
              },
              {
                role: "user",
                content: prompt
              }
            ],
          });
          
          const content = response.choices[0]?.message?.content || (response.choices[0]?.message as any)?.reasoning_content || "";
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.clips && parsed.clips.length > 0) {
                return res.json({ source: "openai", clips: parsed.clips });
              }
            } catch (jsonErr: any) {
              console.error("OpenAI response JSON parse error:", jsonErr);
              return res.status(500).json({ error: "Respons JSON dari OpenAI tidak valid." });
            }
          }
        } catch (err: any) {
          console.error("OpenAI API generation error:", err);
          return res.status(500).json({ error: err.message || "Gagal menghubungi OpenAI API" });
        }
      }
    }
  } else {
    // Default to Gemini
    const customApiKey = (req.headers["x-custom-gemini-api-key"] as string | undefined) || SERVER_GEMINI_KEY;
    const ai = getGeminiClient(customApiKey);

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                clips: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      viralScore: { type: Type.NUMBER },
                      viralReason: { type: Type.STRING },
                      hookType: { type: Type.STRING },
                      startSeconds: { type: Type.NUMBER },
                      endSeconds: { type: Type.NUMBER },
                      durationText: { type: Type.STRING },
                      layoutMode: { type: Type.STRING },
                      speakerTrack: { type: Type.STRING },
                      suggestedHashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      suggestedCaption: { type: Type.STRING },
                      subtitles: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            start: { type: Type.NUMBER },
                            end: { type: Type.NUMBER },
                            text: { type: Type.STRING },
                            speaker: { type: Type.STRING },
                          },
                          required: ["id", "start", "end", "text", "speaker"],
                        },
                      },
                    },
                    required: [
                      "id",
                      "title",
                      "viralScore",
                      "viralReason",
                      "hookType",
                      "startSeconds",
                      "endSeconds",
                      "durationText",
                      "layoutMode",
                      "speakerTrack",
                      "suggestedHashtags",
                      "suggestedCaption",
                      "subtitles",
                    ],
                  },
                },
              },
              required: ["clips"],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.clips && parsed.clips.length > 0) {
            return res.json({ source: "gemini", clips: parsed.clips });
          }
        }
      } catch (err: any) {
        console.error("Gemini API generation error:", err);
        return res.status(500).json({ error: err.message || "Gagal menghubungi Gemini API" });
      }
    }
  }

  // If we reach here, it means neither API returned clips successfully and we haven't already returned an error.
  return res.status(500).json({ error: "Gagal menghasilkan klip dari AI Provider." });
});

const YOUTUBE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|m\.youtube\.com\/watch\?v=)[\w-]{11}.*$/i;

function isValidYouTubeUrl(url: string): boolean {
  return YOUTUBE_URL_PATTERN.test(url);
}

async function checkYtDlpAvailable(): Promise<boolean> {
  try {
    await execFileAsync("yt-dlp", ["--version"], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

interface YouTubeVideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  url: string;
  uploader: string;
}

app.post("/api/youtube-info", youtubeInfoLimiter, async (req, res) => {
  try {
    const { youtubeUrl } = req.body || {};

    if (!youtubeUrl || typeof youtubeUrl !== "string" || !isValidYouTubeUrl(youtubeUrl.trim())) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const ytDlpAvailable = await checkYtDlpAvailable();
    if (!ytDlpAvailable) {
      return res.status(501).json({ error: "yt-dlp is not installed on the server" });
    }

    try {
      const { stdout } = await execFileAsync(
        "yt-dlp",
        ["--dump-json", "--no-playlist", youtubeUrl.trim()],
        { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
      );

      const info = JSON.parse(stdout);

      const result: YouTubeVideoInfo = {
        title: info.title || "",
        duration: info.duration || 0,
        thumbnail: info.thumbnail || info.thumbnails?.[info.thumbnails.length - 1]?.url || "",
        url: info.url || info.webpage_url || youtubeUrl,
        uploader: info.uploader || info.channel || "",
      };

      return res.json(result);
    } catch (err: any) {
      console.error("yt-dlp execution error:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch YouTube video info" });
    }
  } catch (err: any) {
    console.error("youtube-info endpoint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/youtube-info/available", async (_req, res) => {
  try {
    const available = await checkYtDlpAvailable();
    return res.json({ available });
  } catch {
    return res.json({ available: false });
  }
});

export default app;
