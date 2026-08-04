# AutoClip Pro — AI Auto Clipper

Platform otomatis bertenaga AI yang menyeleksi bagian paling menarik dari video panjang (podcast, tech review, bisnis, dll.) dan mengubahnya menjadi klip pendek 9:16 untuk TikTok, YouTube Shorts, dan Instagram Reels.

## Fitur Utama

- **AI Viral Hook Detection** — Gemini / OpenAI (OpenAI-compatible, default model `gpt-5-6-luna`) menganalisis transkrip, menentukan momen dengan skor viralitas tertinggi (85–99/100)
- **Auto-Transkripsi** — Generate transkrip otomatis dari video MP4 via Web Speech API native browser (tanpa server)
- **Smart Crop 9:16** — Pelacakan wajah pembicara otomatis dengan 4 mode layout (Smart Crop, Split-Screen, Center Fit, Blurred BG)
- **Subtitle Karaoke Multi-Bahasa** — Animasi sorot per kata, 4 preset gaya populer (MrBeast Bold, Neon Cyber, Podcast Clean, Minimalist White)
- **Burn-in Subtitle** — Opsi render subtitle tertanam langsung ke video MP4 via FFmpeg.wasm, siap upload tanpa overlay terpisah
- **Multi-Track Timeline Editor** — Timeline interaktif dengan Video, Text, dan Audio track; drag subtitle block; undo/redo
- **Render Lokal FFmpeg.wasm** — Render video 100% di browser, tanpa upload ke server, tanpa watermark
- **YouTube Integration** — Fetch metadata video via `yt-dlp` server-side
- **Export 1080p / 4K 30/60 FPS** — Format MP4 H.264 siap unggah

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router |
| **UI Library** | Lucide React, Motion (Framer Motion) |
| **Video Player** | React Player |
| **Render Engine** | FFmpeg.wasm |
| **AI Provider** | Google Gemini (`@google/genai`), OpenAI SDK (OpenAI-compatible, mis. Kenari) |
| **Auto-Transkripsi** | Web Speech API native browser |
| **Backend** | Express, CORS, Rate Limiting, Input Validation |
| **YouTube** | yt-dlp (server-side) |
| **Package Manager** | Bun |

## Quick Start

```bash
# Install dependencies (pakai Bun)
bun install

# Set environment variables
cp .env.example .env
# Edit .env — set GEMINI_API_KEY / OPENAI_API_KEY sesuai provider

# Development
bun run dev

# Production build
bun run build
bun start
```

Server berjalan di `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Tidak (opsional) | Default Gemini API key server-side |
| `OPENAI_API_KEY` | Tidak | Default API key untuk provider OpenAI-compatible (mis. Kenari) |
| `OPENAI_BASE_URL` | Tidak | Base URL OpenAI (default: `https://kenari.id/v1`) |
| `OPENAI_MODEL` | Tidak | Default model OpenAI (default: `gpt-5-6-luna`) |
| `APP_URL` | Tidak | Origin URL untuk CORS (default: allow all) |
| `PORT` | Tidak | Server port (default: 3000) |

### Model AI

Backend mendukung provider OpenAI-compatible (seperti **Kenari** di `https://kenari.id/v1`). Model default adalah `gpt-5-6-luna`, dapat diubah via `OPENAI_MODEL`. Provider Gemini tersedia sebagai alternatif.

## API Endpoints

### `GET /api/health`
Health check.

### `GET /api/ai-config`
Mengembalikan status konfigurasi AI server (apakah key server terkonfigurasi, default model) **tanpa membocorkan API key**.

### `POST /api/generate-clips`
AI clip generation. Rate limited: 30 req/menit.

Headers:
- `x-ai-provider`: `openai` (opsional, default: gemini)
- `x-custom-gemini-api-key`: Custom Gemini key
- `x-openai-api-key`, `x-openai-base-url`, `x-openai-model`: OpenAI config (opsional — server pakai env jika key klien tidak diberikan)

Body: `{ videoTitle, genre, clipCount, targetDuration, subtitleLang, youtubeUrl, transcriptText }`

### `POST /api/youtube-info`
Fetch YouTube video metadata via yt-dlp. Rate limited: 60 req/menit.

Body: `{ youtubeUrl: string }`

### `GET /api/youtube-info/available`
Check yt-dlp availability.

## Deployment (Vercel Serverless)

Backend Express dapat di-deploy ke Vercel sebagai serverless function:

- **`api/index.ts`** — entrypoint serverless Vercel yang mengekspor Express app (`@vercel/node`)
- **`server.ts`** — murni mengekspor `app` Express (tanpa `listen`)
- **`start-server.ts`** — memuat Vite middleware (dev) / dist statis (prod) + `app.listen`, untuk dev lokal & Node long-running
- **`vercel.json`** — deklarasi build function + rewrite `/api/*` → function, serta SPA routing

**Penting:** Proyek Vercel harus dikonfigurasi dengan **framework "Other"** (bukan preset Vite) agar folder `api/` dibuild sebagai serverless function. Set env var (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`) di dashboard Vercel.

## Project Structure

```
api/
└── index.ts                  # Entrypoint Vercel serverless (@vercel/node)
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Root with Router + Providers
├── index.css                 # Tailwind CSS
├── context/
│   ├── ClipperContext.tsx    # Global state (useReducer)
│   └── ToastContext.tsx      # Toast notification system
├── components/
│   ├── HeaderNav.tsx         # Navigation header
│   ├── ErrorBoundary.tsx     # Error boundary
│   ├── landing/
│   │   └── LandingPage.tsx   # Marketing landing page
│   ├── dashboard/
│   │   └── UserDashboard.tsx # Video input + AI config + clip results
│   ├── workspace/
│   │   ├── VideoWorkspace.tsx # 9:16 editor + timeline + subtitle tabs
│   │   └── ExportModal.tsx   # FFmpeg.wasm export dialog (burn-in subtitle)
│   └── settings/
│       └── SettingsPage.tsx  # AI provider + API key config
├── data/
│   └── captionPresets.ts    # Caption style presets
├── types/
│   └── index.ts             # TypeScript type definitions
└── utils/
    ├── transcribe.ts         # Auto-transkripsi Web Speech API
    └── secureStorage.ts     # Encrypted localStorage
server.ts                     # Express app (export default, tanpa listen)
start-server.ts               # Dev/Prod server (Vite middleware / dist + listen)
```

## Security

- **API key server-side** — key disimpan di env server; key klien hanya fallback
- **`/api/ai-config`** — status konfigurasi tanpa membocorkan key
- **CORS** — origin dibatasi via `APP_URL`
- **Rate limiting** — 30 req/mnt (generate-clips), 60 req/mnt (youtube-info)
- **Input validation whitelist** pada semua endpoint
- **Error boundary** di seluruh aplikasi
