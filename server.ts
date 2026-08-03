import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Helper to initialize Gemini SDK safely
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
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

// AI Generate Video Clips Endpoint
app.post("/api/generate-clips", async (req, res) => {
  const {
    videoTitle = "Video Tanpa Judul",
    genre = "Podcast",
    clipCount = 3,
    targetDuration = "45-60s",
    subtitleLang = "Indonesian",
    youtubeUrl = "",
    transcriptText = "",
  } = req.body;

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
    const openaiKey = req.headers["x-openai-api-key"] as string | undefined;
    const openaiBaseUrl = req.headers["x-openai-base-url"] as string | undefined;
    const openaiModel = req.headers["x-openai-model"] as string | undefined;
    
    if (openaiKey) {
      const openai = getOpenAIClient(openaiKey, openaiBaseUrl);
      if (openai) {
        try {
          const response = await openai.chat.completions.create({
            model: openaiModel || 'gpt-4o-mini',
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
          
          if (response.choices[0].message.content) {
            const parsed = JSON.parse(response.choices[0].message.content);
            if (parsed.clips && parsed.clips.length > 0) {
              return res.json({ source: "openai", clips: parsed.clips });
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
    const customApiKey = req.headers["x-custom-gemini-api-key"] as string | undefined;
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

// Start Server with Vite Middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Auto Clipper] Server active at http://0.0.0.0:${PORT}`);
  });
}

start();
