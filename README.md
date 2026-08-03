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
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 6 |
| **UI Library** | Lucide React, Motion (Framer Motion) |
| **Video Player** | React Player |
| **Render Engine** | FFmpeg.wasm |
| **AI Provider** | Google Gemini (`@google/genai`), OpenAI SDK |
| **Backend** | Express, Helmet, CORS, Rate Limiting |
| **YouTube** | yt-dlp (server-side) |

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env — set GEMINI_API_KEY or use app settings for custom keys

# Development
npm run dev

# Production build
npm run build
npm start
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

## API Endpoints

### `GET /api/health`
Health check.

### `POST /api/generate-clips`
AI clip generation. Rate limited: 30 req/menit.

Headers:
- `x-ai-provider`: `openai` (opsional, default: gemini)
- `x-custom-gemini-api-key`: Custom Gemini key
- `x-openai-api-key`, `x-openai-base-url`, `x-openai-model`: OpenAI config

Body: `{ videoTitle, genre, clipCount, targetDuration, subtitleLang, youtubeUrl, transcriptText }`

### `POST /api/youtube-info`
Fetch YouTube video metadata via yt-dlp. Rate limited: 60 req/menit.

Body: `{ youtubeUrl: string }`

### `GET /api/youtube-info/available`
Check yt-dlp availability.

## Project Structure

```
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
│   │   └── ExportModal.tsx   # FFmpeg.wasm export dialog
│   └── settings/
│       └── SettingsPage.tsx  # AI provider + API key config
├── data/
│   └── captionPresets.ts    # Caption style presets
├── types/
│   └── index.ts             # TypeScript type definitions
└── utils/
    └── secureStorage.ts     # Encrypted localStorage
server.ts                     # Express + Vite server
```

## Security

- API keys dienkripsi di localStorage via XOR cipher
- Server dilindungi Helm + CORS + rate limiting
- Input validation whitelist pada semua endpoint
- Error boundary di seluruh aplikasi
